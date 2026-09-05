import "server-only";
import { GoogleGenAI, Type, type Part } from "@google/genai";

/** Đọc ảnh hóa đơn hoặc tin nhắn chữ, trích ra thông tin giao dịch bằng Gemini —
 *  dùng chung cho luồng Telegram (ảnh chụp hóa đơn hoặc gõ chữ tự nhiên).
 *
 *  Hỗ trợ 4 loại ý định: EXPENSE (chi), INCOME (thu), LOAN_BORROW (vay/nhận tiền vay),
 *  LOAN_REPAY (trả nợ đã vay). Ảnh hóa đơn luôn được coi là EXPENSE. */

export type CategoryOption = {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
};

export type ParsedTransaction =
  | {
      success: true;
      kind: "EXPENSE" | "INCOME";
      amount: number;
      categoryName: string;
      merchant: string | null;
      note: string | null;
      accountHint: string | null;
    }
  | {
      success: true;
      kind: "LOAN_BORROW" | "LOAN_REPAY";
      amount: number;
      counterpartyName: string;
      note: string | null;
      accountHint: string | null;
    }
  | {
      success: false;
      clarification: string;
    };

// Lưu ý: Gemini (bản structured-output/JSON schema) có lỗi thỉnh thoảng làm hỏng dấu tiếng Việt
// hoặc chèn thêm ký tự lạ khi bị yêu cầu CHÉP LẠI NGUYÊN VĂN một chuỗi tiếng Việt dài (vd tên danh
// mục) vào field JSON. Để tránh hoàn toàn vấn đề này, không hỏi Gemini trả về TÊN danh mục — chỉ
// hỏi trả về SỐ THỨ TỰ (index) trong danh sách đánh số sẵn, rồi tự tra cứu tên thật từ index đó.
// (counterpartyName/accountHint/note là tên riêng do người dùng gõ ra, không nằm trong danh sách có
// sẵn nên không áp dụng được cách này — chấp nhận rủi ro nhỏ, có bước chuẩn hoá/so khớp gần đúng ở
// create-transaction.ts thay vì so khớp tuyệt đối.)
const RECORD_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    success: {
      type: Type.BOOLEAN,
      description: "false nếu không đọc được số tiền hoặc không rõ đây là giao dịch gì",
    },
    intent: {
      type: Type.STRING,
      enum: ["EXPENSE", "INCOME", "LOAN_BORROW", "LOAN_REPAY"],
      description:
        "EXPENSE: chi tiêu thường. INCOME: thu nhập thường (lương, thưởng...). " +
        "LOAN_BORROW: VAY tiền / MƯỢN tiền / NHẬN tiền vay từ ai đó — KHÔNG phải thu nhập. " +
        "LOAN_REPAY: TRẢ nợ / TRẢ tiền đã vay cho ai đó — KHÔNG phải chi tiêu thường.",
    },
    categoryIndex: {
      type: Type.NUMBER,
      description:
        "CHỈ áp dụng khi intent là EXPENSE hoặc INCOME: số thứ tự (bắt đầu từ 0) của danh mục phù hợp nhất trong danh sách đánh số được cung cấp",
    },
    amount: { type: Type.NUMBER, description: "Số tiền, đơn vị VND, chỉ số nguyên dương" },
    merchant: { type: Type.STRING, description: "Tên cửa hàng/nơi giao dịch nếu đọc được, không bắt buộc" },
    counterpartyName: {
      type: Type.STRING,
      description: "CHỈ áp dụng khi intent là LOAN_BORROW hoặc LOAN_REPAY: tên người cho vay/được trả nợ, ví dụ 'chị Michell'",
    },
    accountHint: {
      type: Type.STRING,
      description:
        "Tên tài khoản/hình thức thanh toán được nhắc tới nếu có, ví dụ 'tiền mặt', 'Vietcombank'. Để trống nếu tin nhắn không nhắc tới.",
    },
    note: { type: Type.STRING, description: "Ghi chú ngắn gọn bằng tiếng Việt, không bắt buộc" },
    clarification: {
      type: Type.STRING,
      description:
        "Nếu success=false: giải thích ngắn gọn, thân thiện bằng tiếng Việt lý do và gợi ý người dùng nên gửi lại thế nào",
    },
  },
  required: ["success"],
};

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Chưa cấu hình GEMINI_API_KEY");
  return new GoogleGenAI({ apiKey });
}

function buildSystemPrompt(categories: CategoryOption[]) {
  const list = categories.map((c, i) => `${i}: ${c.name} (${c.type === "EXPENSE" ? "chi" : "thu"})`).join("\n");
  return `Bạn là trợ lý đọc hóa đơn/tin nhắn để ghi sổ thu chi gia đình Việt Nam. Đơn vị tiền luôn là VND.

Danh sách danh mục hợp lệ của gia đình này, đánh số từ 0 — CHỈ dùng khi intent là EXPENSE/INCOME (categoryIndex PHẢI là 1 số nguyên trong danh sách này, KHÔNG chép lại tên danh mục):
${list}

Phân loại intent:
- "vay", "mượn", "vay tiền", "nhận tiền vay từ X" → LOAN_BORROW. Đây KHÔNG phải khoản thu (INCOME).
- "trả nợ", "trả tiền vay", "trả X số tiền" (khi X là người đã cho vay trước đó) → LOAN_REPAY. Đây KHÔNG phải khoản chi (EXPENSE).
- Còn lại: EXPENSE (chi tiêu) hoặc INCOME (thu nhập) như bình thường.
- Với LOAN_BORROW/LOAN_REPAY: trích counterpartyName là tên người liên quan (vd "chị Michell"), KHÔNG cần categoryIndex.

Quy tắc đọc số tiền:
- "50k", "50 k" = 50000.
- Chuỗi số có dấu chấm hoặc dấu phẩy phân cách hàng nghìn kiểu Việt Nam, vd "113.672.088", "113,672,088", "500.000đ", "500,000" — LUÔN hiểu dấu chấm/phẩy là phân cách hàng nghìn, không phải dấu thập phân. Kết quả: 113.672.088 → 113672088, 500.000 → 500000.
- Nếu là ảnh hóa đơn/biên lai mua hàng: luôn là EXPENSE, lấy tổng tiền cuối hóa đơn (không phải tiền từng món), merchant là tên cửa hàng in trên hóa đơn.
- Nếu không chắc chắn số tiền hoặc không rõ nội dung, đặt success=false và giải thích ngắn gọn, thân thiện.
- Luôn trả lời đúng theo schema JSON được cung cấp, không trả lời bằng văn bản thường.`;
}

function isTransientGeminiError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return message.includes("UNAVAILABLE") || message.includes("503") || message.includes("RESOURCE_EXHAUSTED") || message.includes("429");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Gemini thỉnh thoảng báo quá tải tạm thời (503 UNAVAILABLE) chỉ trong vài giây — tự thử
// lại 2 lần (chờ ngắn dần) trước khi báo lỗi cho người dùng, để họ không phải tự gửi lại ảnh.
async function generateContentWithRetry(client: GoogleGenAI, args: Parameters<GoogleGenAI["models"]["generateContent"]>[0]) {
  const delays = [1200, 2500];
  let lastErr: unknown;
  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      return await client.models.generateContent(args);
    } catch (err) {
      lastErr = err;
      if (attempt < delays.length && isTransientGeminiError(err)) {
        await sleep(delays[attempt]);
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

async function callGemini(parts: Part[], categories: CategoryOption[]): Promise<ParsedTransaction> {
  const client = getClient();
  const response = await generateContentWithRetry(client, {
    model: "gemini-flash-latest",
    contents: [{ role: "user", parts }],
    config: {
      systemInstruction: buildSystemPrompt(categories),
      responseMimeType: "application/json",
      responseSchema: RECORD_SCHEMA,
    },
  });

  const text = response.text;
  if (!text) {
    return { success: false, clarification: "Không đọc được nội dung, vui lòng thử gửi lại." };
  }

  let input: Record<string, unknown>;
  try {
    input = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { success: false, clarification: "Không đọc được nội dung, vui lòng thử gửi lại." };
  }

  if (!input.success) {
    return {
      success: false,
      clarification:
        typeof input.clarification === "string" && input.clarification
          ? input.clarification
          : "Không đọc rõ được thông tin giao dịch, vui lòng gửi lại rõ hơn.",
    };
  }

  const amount = Number(input.amount);
  if (!amount || amount <= 0) {
    return { success: false, clarification: "Không xác định được số tiền, vui lòng gửi lại rõ hơn." };
  }

  const accountHint = typeof input.accountHint === "string" && input.accountHint.trim() ? input.accountHint.trim() : null;
  const note = typeof input.note === "string" && input.note ? input.note : null;
  const intent = String(input.intent ?? "");

  if (intent === "LOAN_BORROW" || intent === "LOAN_REPAY") {
    const counterpartyName = typeof input.counterpartyName === "string" ? input.counterpartyName.trim() : "";
    if (!counterpartyName) {
      return { success: false, clarification: "Không xác định được tên người cho vay/được trả nợ, vui lòng gửi lại rõ hơn." };
    }
    return { success: true, kind: intent, amount: Math.round(amount), counterpartyName, note, accountHint };
  }

  const categoryIndex = Number(input.categoryIndex);
  const validCategory = Number.isInteger(categoryIndex) ? categories[categoryIndex] : undefined;
  if (!validCategory) {
    return { success: false, clarification: "Không xác định được danh mục phù hợp, vui lòng gửi lại rõ hơn." };
  }

  return {
    success: true,
    kind: validCategory.type,
    amount: Math.round(amount),
    categoryName: validCategory.name,
    merchant: typeof input.merchant === "string" && input.merchant ? input.merchant : null,
    note,
    accountHint,
  };
}

export async function parseTransactionFromText(
  text: string,
  categories: CategoryOption[]
): Promise<ParsedTransaction> {
  return callGemini([{ text }], categories);
}

export async function parseTransactionFromImage(
  imageBase64: string,
  mimeType: "image/jpeg" | "image/png" | "image/webp",
  categories: CategoryOption[]
): Promise<ParsedTransaction> {
  return callGemini(
    [
      { inlineData: { mimeType, data: imageBase64 } },
      { text: "Đây là ảnh hóa đơn/biên lai. Hãy trích xuất thông tin giao dịch." },
    ],
    categories
  );
}
