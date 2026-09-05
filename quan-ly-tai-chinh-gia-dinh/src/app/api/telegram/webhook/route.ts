import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage, downloadTelegramFileAsBase64 } from "@/lib/telegram/bot-api";
import { consumeLinkCode, getLinkedMember } from "@/lib/telegram/link";
import { parseTransactionFromText, parseTransactionFromImage, type CategoryOption } from "@/lib/telegram/ai-parser";
import { createTransactionFromTelegram, TelegramTransactionError } from "@/lib/telegram/create-transaction";

// Đọc ảnh hóa đơn (tải file Telegram + gọi Gemini Vision) thường mất hơn 10 giây —
// giới hạn mặc định của hàm serverless trên Vercel (kể cả gói Hobby). Không khai báo
// dòng này thì Vercel sẽ ngắt hàm giữa chừng khi xử lý ẢNH (tin nhắn chữ thì nhanh nên
// vẫn chạy được bình thường) → đúng triệu chứng "gửi hóa đơn lên Telegram bị lỗi".
export const maxDuration = 60;

const WELCOME =
  "Chào bạn! Đây là bot Sổ Thu Chi Gia Đình.\n\n" +
  "Trước tiên vào app > Cài đặt > Liên kết Telegram để lấy mã, rồi gửi cho bot theo dạng:\n/link MÃCODE\n\n" +
  "Sau khi liên kết, bạn có thể:\n" +
  "• Gửi ảnh chụp hóa đơn — bot tự đọc và ghi nhận khoản chi\n" +
  "• Nhắn tin kiểu \"chi 50k ăn trưa\" hoặc \"thu 2 triệu lương\" — bot tự ghi nhận\n" +
  "• Nhắn \"vay chị X 500k\" hoặc \"trả chị X 500k\" — bot tự ghi nhận vay/trả nợ";

function describeError(err: unknown): string {
  if (err instanceof TelegramTransactionError) return err.message;
  const message = err instanceof Error ? err.message : String(err);
  if (message.includes("RESOURCE_EXHAUSTED") || message.includes("429")) {
    return "Bot đã dùng hết lượt đọc AI miễn phí trong hôm nay (giới hạn của gói miễn phí), vui lòng thử lại sau hoặc để mai ghi nhận nhé.";
  }
  if (message.includes("UNAVAILABLE") || message.includes("503")) {
    return "Hệ thống đọc AI đang quá tải, vui lòng thử gửi lại sau ít phút.";
  }
  return "Có lỗi xảy ra khi ghi nhận giao dịch, vui lòng thử lại.";
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-telegram-bot-api-secret-token");
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const update = await request.json();
  const message = update?.message;
  if (!message) return NextResponse.json({ ok: true });

  const chatId = String(message.chat.id);
  const text: string | undefined = message.text;

  try {
    if (text?.trim() === "/start") {
      await sendTelegramMessage(chatId, WELCOME);
      return NextResponse.json({ ok: true });
    }

    if (text?.trim().toUpperCase().startsWith("/LINK")) {
      const code = text.trim().split(/\s+/)[1] ?? "";
      const result = await consumeLinkCode(code, chatId);
      await sendTelegramMessage(
        chatId,
        result.ok ? `Đã liên kết thành công với thành viên "${result.memberName}" ✅` : result.message
      );
      return NextResponse.json({ ok: true });
    }

    const link = await getLinkedMember(chatId);
    if (!link) {
      await sendTelegramMessage(
        chatId,
        "Chat này chưa liên kết với gia đình nào. Vào app > Cài đặt > Liên kết Telegram để lấy mã, rồi gửi: /link MÃCODE"
      );
      return NextResponse.json({ ok: true });
    }

    const categoriesRaw = await prisma.category.findMany({
      where: { familyId: link.familyId, isActive: true },
      select: { id: true, name: true, type: true },
    });
    const categories: CategoryOption[] = categoriesRaw.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type as "INCOME" | "EXPENSE",
    }));

    const photos = message.photo as Array<{ file_id: string }> | undefined;
    if (photos && photos.length > 0) {
      const largest = photos[photos.length - 1];
      const { base64, mimeType } = await downloadTelegramFileAsBase64(largest.file_id);
      const parsed = await parseTransactionFromImage(base64, mimeType, categories);
      if (!parsed.success) {
        await sendTelegramMessage(chatId, `❓ ${parsed.clarification}`);
      } else {
        const { summary } = await createTransactionFromTelegram(link.familyId, link.memberId, parsed);
        await sendTelegramMessage(chatId, `✅ Đã ghi nhận: ${summary}`);
      }
      return NextResponse.json({ ok: true });
    }

    if (text && text.trim().length > 0) {
      const parsed = await parseTransactionFromText(text, categories);
      if (!parsed.success) {
        await sendTelegramMessage(chatId, `❓ ${parsed.clarification}`);
      } else {
        const { summary } = await createTransactionFromTelegram(link.familyId, link.memberId, parsed);
        await sendTelegramMessage(chatId, `✅ Đã ghi nhận: ${summary}`);
      }
      return NextResponse.json({ ok: true });
    }

    await sendTelegramMessage(chatId, "Gửi ảnh hóa đơn hoặc nhắn tin kiểu \"chi 50k ăn trưa\" để ghi nhận giao dịch nhé.");
    return NextResponse.json({ ok: true });
  } catch (err) {
    await sendTelegramMessage(chatId, `⚠️ ${describeError(err)}`);
    console.error("Telegram webhook error:", err);
    return NextResponse.json({ ok: true });
  }
}
