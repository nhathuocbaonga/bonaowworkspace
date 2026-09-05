import "server-only";
import { google } from "googleapis";
import { Readable } from "node:stream";

/**
 * Lưu trữ file đính kèm (hóa đơn, chứng từ) trên Google Drive bằng Service Account.
 *
 * Thiết lập (xem README mục "Đính kèm hóa đơn qua Google Drive"):
 *   1. Tạo Service Account trên Google Cloud, bật Google Drive API.
 *   2. Chia sẻ 1 thư mục Drive với email của Service Account (quyền Editor).
 *   3. Đặt biến môi trường:
 *      GOOGLE_SERVICE_ACCOUNT_KEY = nội dung file JSON key (dán nguyên văn)
 *      GOOGLE_DRIVE_FOLDER_ID    = ID thư mục đã chia sẻ ở bước 2
 *
 * Nếu chưa cấu hình, isGoogleDriveConfigured() trả về false — nơi gọi phải ẩn hẳn
 * UI đính kèm thay vì hiển thị nút không hoạt động.
 */

export function isGoogleDriveConfigured(): boolean {
  return !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY && !!process.env.GOOGLE_DRIVE_FOLDER_ID;
}

function getDriveClient() {
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!rawKey) throw new Error("Chưa cấu hình GOOGLE_SERVICE_ACCOUNT_KEY");

  const credentials = JSON.parse(rawKey);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
  return google.drive({ version: "v3", auth });
}

export type UploadedAttachment = {
  fileId: string;
  viewUrl: string;
  name: string;
};

/** Tải 1 file lên thư mục Drive đã cấu hình, đặt quyền xem công khai qua link. */
export async function uploadAttachment(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<UploadedAttachment> {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) throw new Error("Chưa cấu hình GOOGLE_DRIVE_FOLDER_ID");

  const drive = getDriveClient();

  const res = await drive.files.create({
    requestBody: { name: filename, parents: [folderId] },
    media: { mimeType, body: Readable.from(buffer) },
    fields: "id, name",
  });

  const fileId = res.data.id;
  if (!fileId) throw new Error("Tải file lên Google Drive thất bại");

  // Cho phép xem qua link (giống ảnh hóa đơn dùng nội bộ gia đình) — không cho chỉnh sửa/xóa.
  await drive.permissions.create({
    fileId,
    requestBody: { role: "reader", type: "anyone" },
  });

  return {
    fileId,
    viewUrl: `https://drive.google.com/uc?id=${fileId}`,
    name: res.data.name ?? filename,
  };
}

export async function deleteAttachment(fileId: string): Promise<void> {
  const drive = getDriveClient();
  await drive.files.delete({ fileId }).catch(() => {
    // Bỏ qua nếu file đã bị xóa thủ công trên Drive trước đó.
  });
}

/** Trích fileId từ viewUrl dạng https://drive.google.com/uc?id=... để phục vụ xóa/đổi. */
export function extractDriveFileId(viewUrl: string): string | null {
  const match = viewUrl.match(/[?&]id=([^&]+)/);
  return match ? match[1] : null;
}

// ─────────────────────────────────────────────────────────────────────────
// Nhập ảnh hàng loạt từ 1 thư mục Drive "hộp thư đến" — dùng cho cron job
// chạy mỗi sáng (xem src/app/api/cron/drive-import/route.ts). Luồng riêng
// với đính kèm hóa đơn ở trên: đây là chiều ĐỌC ảnh mới rồi tạo giao dịch,
// không phải đính kèm ảnh vào giao dịch đã có sẵn.
// ─────────────────────────────────────────────────────────────────────────

export function isDriveInboxConfigured(): boolean {
  return !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY && !!process.env.GOOGLE_DRIVE_INBOX_FOLDER_ID;
}

const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type InboxFile = {
  id: string;
  name: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
};

/** Tìm (hoặc tạo mới nếu chưa có) 1 thư mục con theo tên, nằm trong thư mục cha cho trước. */
async function ensureSubfolder(drive: ReturnType<typeof getDriveClient>, parentId: string, name: string): Promise<string> {
  const existing = await drive.files.list({
    q: `'${parentId}' in parents and name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id)",
    pageSize: 1,
  });
  const foundId = existing.data.files?.[0]?.id;
  if (foundId) return foundId;

  const created = await drive.files.create({
    requestBody: { name, mimeType: "application/vnd.google-apps.folder", parents: [parentId] },
    fields: "id",
  });
  if (!created.data.id) throw new Error(`Không tạo được thư mục "${name}" trên Google Drive`);
  return created.data.id;
}

/** Liệt kê ảnh mới (chưa xử lý) trong thư mục hộp thư đến, cũ nhất trước, tối đa `limit` ảnh
 *  mỗi lần gọi (để không vượt quá thời gian chạy tối đa của hàm serverless). */
export async function listInboxImages(limit: number): Promise<InboxFile[]> {
  const folderId = process.env.GOOGLE_DRIVE_INBOX_FOLDER_ID;
  if (!folderId) throw new Error("Chưa cấu hình GOOGLE_DRIVE_INBOX_FOLDER_ID");

  const drive = getDriveClient();
  const mimeQuery = IMAGE_MIME_TYPES.map((m) => `mimeType = '${m}'`).join(" or ");
  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false and (${mimeQuery})`,
    fields: "files(id, name, mimeType, createdTime)",
    orderBy: "createdTime",
    pageSize: limit,
  });

  return (res.data.files ?? [])
    .filter((f): f is typeof f & { id: string; name: string; mimeType: string } => !!f.id && !!f.mimeType)
    .filter((f) => IMAGE_MIME_TYPES.includes(f.mimeType))
    .map((f) => ({ id: f.id, name: f.name ?? f.id, mimeType: f.mimeType as InboxFile["mimeType"] }));
}

export async function downloadDriveFileAsBase64(fileId: string): Promise<string> {
  const drive = getDriveClient();
  const res = await drive.files.get({ fileId, alt: "media" }, { responseType: "arraybuffer" });
  return Buffer.from(res.data as ArrayBuffer).toString("base64");
}

/** Cho phép xem qua link (giống ảnh đính kèm thủ công) rồi trả về viewUrl để lưu vào
 *  transaction.attachmentUrl — không tải lại/tạo bản sao, dùng thẳng file đã có trong hộp thư đến. */
export async function makeInboxFileViewable(fileId: string): Promise<string> {
  const drive = getDriveClient();
  await drive.permissions.create({ fileId, requestBody: { role: "reader", type: "anyone" } }).catch(() => {
    // Nếu đã có quyền rồi thì bỏ qua lỗi.
  });
  return `https://drive.google.com/uc?id=${fileId}`;
}

/** Sau khi xử lý xong 1 ảnh, chuyển sang thư mục con "Đã xử lý" hoặc "Cần xem lại" để
 *  lần chạy cron kế tiếp không đọc lại ảnh này nữa. */
export async function moveInboxFile(fileId: string, outcome: "processed" | "needs-review"): Promise<void> {
  const folderId = process.env.GOOGLE_DRIVE_INBOX_FOLDER_ID;
  if (!folderId) throw new Error("Chưa cấu hình GOOGLE_DRIVE_INBOX_FOLDER_ID");

  const drive = getDriveClient();
  const targetName = outcome === "processed" ? "Đã xử lý" : "Cần xem lại";
  const targetFolderId = await ensureSubfolder(drive, folderId, targetName);
  await drive.files.update({ fileId, addParents: targetFolderId, removeParents: folderId, fields: "id" });
}
