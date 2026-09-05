import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage } from "@/lib/telegram/bot-api";
import { parseTransactionFromImage, type CategoryOption } from "@/lib/telegram/ai-parser";
import { createTransactionFromTelegram, TelegramTransactionError } from "@/lib/telegram/create-transaction";
import {
  isDriveInboxConfigured,
  listInboxImages,
  downloadDriveFileAsBase64,
  makeInboxFileViewable,
  moveInboxFile,
} from "@/lib/google-drive";

// Đọc + phân loại nhiều ảnh trong 1 lần chạy có thể mất vài chục giây (mỗi ảnh gọi Gemini,
// có thể phải thử lại) — cùng lý do với webhook Telegram, xem giải thích ở đó.
export const maxDuration = 60;

// Xử lý tối đa từng này ảnh mỗi lần cron chạy để chắc chắn không vượt quá 60s. Nếu hộp thư
// đến còn nhiều ảnh hơn, số còn lại sẽ được xử lý ở lần chạy cron kế tiếp (không bị mất ảnh,
// chỉ chậm lại chứ không hỏng dữ liệu).
const MAX_IMAGES_PER_RUN = 8;

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

export async function GET(request: NextRequest) {
  // Vercel Cron tự động gửi header này khi có cấu hình biến môi trường CRON_SECRET —
  // chặn mọi request gọi thẳng route này mà không có secret đúng.
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) return unauthorized();
  }

  if (!isDriveInboxConfigured()) {
    return NextResponse.json({ ok: true, skipped: "GOOGLE_DRIVE_INBOX_FOLDER_ID chưa cấu hình" });
  }

  // App hiện chỉ phục vụ 1 gia đình — lấy gia đình đầu tiên và người quản trị đầu tiên
  // của gia đình đó để gán cho các giao dịch được tạo tự động từ ảnh trong hộp thư đến.
  const family = await prisma.family.findFirst({ orderBy: { createdAt: "asc" } });
  if (!family) return NextResponse.json({ ok: true, skipped: "Chưa có gia đình nào trong hệ thống" });

  const member =
    (await prisma.familyMember.findFirst({
      where: { familyId: family.id, role: "ADMIN", isActive: true },
      orderBy: { createdAt: "asc" },
    })) ??
    (await prisma.familyMember.findFirst({
      where: { familyId: family.id, isActive: true },
      orderBy: { createdAt: "asc" },
    }));
  if (!member) return NextResponse.json({ ok: true, skipped: "Gia đình chưa có thành viên nào" });

  const categoriesRaw = await prisma.category.findMany({
    where: { familyId: family.id, isActive: true },
    select: { id: true, name: true, type: true },
  });
  const categories: CategoryOption[] = categoriesRaw.map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type as "INCOME" | "EXPENSE",
  }));

  const files = await listInboxImages(MAX_IMAGES_PER_RUN);

  let processed = 0;
  const needsReview: string[] = [];

  for (const file of files) {
    try {
      const base64 = await downloadDriveFileAsBase64(file.id);
      const parsed = await parseTransactionFromImage(base64, file.mimeType, categories);

      if (!parsed.success) {
        await moveInboxFile(file.id, "needs-review");
        needsReview.push(`${file.name} — ${parsed.clarification}`);
        continue;
      }

      const { summary, transactionId } = await createTransactionFromTelegram(family.id, member.id, parsed);
      // Gán ảnh gốc làm chứng từ đính kèm cho giao dịch vừa tạo, để xem lại sau này trong app.
      const viewUrl = await makeInboxFileViewable(file.id);
      await prisma.transaction.update({ where: { id: transactionId }, data: { attachmentUrl: viewUrl } }).catch(() => {
        // Không nghiêm trọng nếu gán chứng từ thất bại — giao dịch vẫn đã được ghi nhận đúng số liệu.
      });

      await moveInboxFile(file.id, "processed");
      processed++;
      void summary; // đã gộp vào thông báo Telegram tổng hợp bên dưới, không cần gửi riêng từng ảnh
    } catch (err) {
      await moveInboxFile(file.id, "needs-review").catch(() => {});
      const message = err instanceof TelegramTransactionError ? err.message : err instanceof Error ? err.message : String(err);
      needsReview.push(`${file.name} — ${message}`);
    }
  }

  if (files.length > 0) {
    const lines = [
      `📥 Nhập ảnh từ Google Drive lúc ${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}:`,
      `✅ Đã ghi nhận ${processed}/${files.length} giao dịch.`,
    ];
    if (needsReview.length > 0) {
      lines.push(`⚠️ ${needsReview.length} ảnh cần xem lại (đã chuyển vào thư mục "Cần xem lại"):`);
      for (const line of needsReview.slice(0, 10)) lines.push(`• ${line}`);
    }
    const links = await prisma.telegramLink.findMany({ where: { familyId: family.id } });
    for (const link of links) {
      await sendTelegramMessage(link.chatId, lines.join("\n"));
    }
  }

  return NextResponse.json({ ok: true, found: files.length, processed, needsReview: needsReview.length });
}
