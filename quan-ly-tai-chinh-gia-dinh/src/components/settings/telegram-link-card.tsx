"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { generateTelegramLinkCodeAction, unlinkTelegramAction } from "@/lib/actions/telegram";

const BOT_USERNAME = "namitubot";

export function TelegramLinkCard({ isLinked }: { isLinked: boolean }) {
  const router = useRouter();
  const [code, setCode] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function generate() {
    startTransition(async () => {
      const res = await generateTelegramLinkCodeAction();
      setCode(res.code);
    });
  }

  function unlink() {
    if (!confirm("Hủy liên kết Telegram?")) return;
    startTransition(async () => {
      await unlinkTelegramAction();
      setCode(null);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="MessageCircle" size={18} /> Liên kết Telegram
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted">
          Gửi ảnh hóa đơn hoặc nhắn tin (VD: &quot;chi 50k ăn trưa&quot;) qua Telegram để tự động ghi nhận giao dịch, không cần mở app.
        </p>

        {isLinked ? (
          <div className="flex items-center justify-between rounded-xl bg-success-soft px-3.5 py-3 text-sm text-success">
            <span className="flex items-center gap-2">
              <Icon name="CheckCircle2" size={16} /> Đã liên kết Telegram
            </span>
            <Button size="sm" variant="outline" onClick={unlink} disabled={pending}>
              Hủy liên kết
            </Button>
          </div>
        ) : code ? (
          <div className="space-y-3 rounded-xl border border-border p-4 text-center">
            <p className="text-xs text-muted">Mã liên kết (hết hạn sau 10 phút)</p>
            <p className="text-2xl font-bold tracking-widest text-brand">{code}</p>
            <p className="text-sm">
              Mở Telegram, nhắn cho bot{" "}
              <a
                href={`https://t.me/${BOT_USERNAME}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand hover:underline"
              >
                @{BOT_USERNAME}
              </a>{" "}
              theo cú pháp:
            </p>
            <p className="rounded-lg bg-black/5 px-3 py-2 font-mono text-sm dark:bg-white/5">/link {code}</p>
          </div>
        ) : (
          <Button onClick={generate} disabled={pending}>
            <Icon name="Link2" size={14} /> Tạo mã liên kết
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
