"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { uploadAttachment, deleteAttachment, extractDriveFileId, isGoogleDriveConfigured } from "@/lib/google-drive";
import { writeAuditLog } from "@/lib/audit";

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

const uploadSchema = z.object({
  transactionId: z.string().min(1),
  filename: z.string().min(1),
  mimeType: z.string().refine((t) => ALLOWED_MIME_TYPES.includes(t), "Chỉ hỗ trợ ảnh JPG/PNG/WEBP hoặc PDF"),
  base64Content: z.string().min(1),
});
export type UploadAttachmentInput = z.infer<typeof uploadSchema>;

export async function uploadTransactionAttachmentAction(input: UploadAttachmentInput) {
  if (!isGoogleDriveConfigured()) {
    throw new Error(
      "Chưa cấu hình Google Drive cho đính kèm. Xem hướng dẫn trong README mục 'Đính kèm hóa đơn qua Google Drive'."
    );
  }

  const session = await requireSession();
  const parsed = uploadSchema.parse(input);

  const buffer = Buffer.from(parsed.base64Content, "base64");
  if (buffer.byteLength > MAX_FILE_SIZE) {
    throw new Error("File vượt quá 8MB");
  }

  const tx = await prisma.transaction.findFirst({
    where: { id: parsed.transactionId, familyId: session.familyId },
  });
  if (!tx) throw new Error("Không tìm thấy giao dịch");

  // Xóa ảnh cũ trên Drive nếu có, tránh rác file mồ côi.
  if (tx.attachmentUrl) {
    const oldFileId = extractDriveFileId(tx.attachmentUrl);
    if (oldFileId) await deleteAttachment(oldFileId);
  }

  const uploaded = await uploadAttachment(buffer, parsed.filename, parsed.mimeType);

  await prisma.transaction.update({
    where: { id: tx.id },
    data: { attachmentUrl: uploaded.viewUrl },
  });

  await writeAuditLog({
    familyId: session.familyId,
    memberId: session.memberId,
    entityType: "TRANSACTION",
    entityId: tx.id,
    action: "UPDATE",
    summary: `Đính kèm chứng từ "${parsed.filename}" vào giao dịch`,
  });

  revalidatePath(`/transactions/${tx.id}`);
  return uploaded.viewUrl;
}

export async function removeTransactionAttachmentAction(transactionId: string) {
  const session = await requireSession();
  const tx = await prisma.transaction.findFirst({
    where: { id: transactionId, familyId: session.familyId },
  });
  if (!tx || !tx.attachmentUrl) return;

  const fileId = extractDriveFileId(tx.attachmentUrl);
  if (fileId && isGoogleDriveConfigured()) {
    await deleteAttachment(fileId);
  }

  await prisma.transaction.update({
    where: { id: tx.id },
    data: { attachmentUrl: null },
  });

  revalidatePath(`/transactions/${tx.id}`);
}
