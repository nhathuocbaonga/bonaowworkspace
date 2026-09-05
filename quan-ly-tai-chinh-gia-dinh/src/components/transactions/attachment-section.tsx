"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { uploadTransactionAttachmentAction, removeTransactionAttachmentAction } from "@/lib/actions/attachments";

const MAX_FILE_SIZE = 8 * 1024 * 1024;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function AttachmentSection({
  transactionId,
  attachmentUrl,
  driveConfigured,
}: {
  transactionId: string;
  attachmentUrl: string | null;
  driveConfigured: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!attachmentUrl && !driveConfigured) return null;

  async function handleFile(file: File) {
    if (file.size > MAX_FILE_SIZE) {
      setError("File vượt quá 8MB");
      return;
    }
    setError(null);
    const base64Content = await fileToBase64(file);
    startTransition(async () => {
      try {
        await uploadTransactionAttachmentAction({
          transactionId,
          filename: file.name,
          mimeType: file.type,
          base64Content,
        });
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
      }
    });
  }

  function handleRemove() {
    startTransition(async () => {
      await removeTransactionAttachmentAction(transactionId);
      router.refresh();
    });
  }

  return (
    <div className="mt-4 border-t border-border pt-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Hóa đơn / Chứng từ</p>

      {attachmentUrl ? (
        <div className="flex items-center gap-3">
          <a
            href={attachmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm text-brand hover:underline"
          >
            <Icon name="Receipt" size={16} />
            Xem chứng từ đã đính kèm
          </a>
          {driveConfigured ? (
            <button
              onClick={handleRemove}
              disabled={pending}
              className="rounded-lg p-2 text-muted hover:bg-danger-soft hover:text-danger"
              aria-label="Xóa đính kèm"
            >
              <Icon name="Trash2" size={14} />
            </button>
          ) : null}
        </div>
      ) : (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={pending}>
            <Icon name="Upload" size={14} />
            {pending ? "Đang tải lên..." : "Đính kèm ảnh hóa đơn / PDF"}
          </Button>
        </div>
      )}

      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
    </div>
  );
}
