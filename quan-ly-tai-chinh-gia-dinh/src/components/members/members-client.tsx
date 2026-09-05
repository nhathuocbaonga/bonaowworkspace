"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/icon";
import { MEMBER_ROLE_LABEL, type MemberRole } from "@/lib/enums";
import { MemberFormModal } from "./member-form-modal";
import { deactivateMemberAction } from "@/lib/actions/members";

type Member = {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
  userId: string | null;
};

export function MembersClient({ members, currentMemberId }: { members: Member[]; currentMemberId: string }) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [pending, startTransition] = useTransition();

  function remove(id: string) {
    if (!confirm("Ẩn thành viên này khỏi danh sách hoạt động?")) return;
    startTransition(async () => {
      await deactivateMemberAction(id);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Thành viên gia đình</h1>
          <p className="text-sm text-muted">{members.length} thành viên</p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Icon name="Plus" size={14} /> Thêm thành viên
        </Button>
      </div>

      <div className="space-y-3">
        {members.map((m) => (
          <Card key={m.id}>
            <CardContent className="flex items-center gap-3 p-4">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: m.avatarColor }}
              >
                {m.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {m.name} {m.id === currentMemberId ? <span className="text-xs text-muted">(bạn)</span> : null}
                </p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <Badge tone={m.role === "ADMIN" ? "brand" : m.role === "CHILD" ? "warning" : "muted"}>
                    {MEMBER_ROLE_LABEL[m.role as MemberRole]}
                  </Badge>
                  {m.userId ? (
                    <span className="text-xs text-muted">Có tài khoản đăng nhập</span>
                  ) : (
                    <span className="text-xs text-muted">Chưa có đăng nhập</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setEditing(m);
                  setFormOpen(true);
                }}
                className="rounded-lg p-2 text-muted hover:bg-black/5 dark:hover:bg-white/10"
                aria-label="Sửa"
              >
                <Icon name="Pencil" size={16} />
              </button>
              {members.length > 1 ? (
                <button
                  onClick={() => remove(m.id)}
                  disabled={pending}
                  className="rounded-lg p-2 text-muted hover:bg-danger-soft hover:text-danger"
                  aria-label="Ẩn"
                >
                  <Icon name="Trash2" size={16} />
                </button>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <MemberFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initial={
          editing
            ? {
                id: editing.id,
                name: editing.name,
                role: editing.role as MemberRole,
                avatarColor: editing.avatarColor,
                hasLogin: !!editing.userId,
              }
            : undefined
        }
      />
    </div>
  );
}
