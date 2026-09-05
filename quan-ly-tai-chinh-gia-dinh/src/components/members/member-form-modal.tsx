"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form-controls";
import { MEMBER_ROLES, MEMBER_ROLE_LABEL, type MemberRole } from "@/lib/enums";
import { createMemberAction, updateMemberAction } from "@/lib/actions/members";

const AVATAR_COLORS = ["#6d5ef7", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444"];

export function MemberFormModal({
  open,
  onClose,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  initial?: { id: string; name: string; role: MemberRole; avatarColor: string; hasLogin: boolean };
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [role, setRole] = useState<MemberRole>(initial?.role ?? "MEMBER");
  const [avatarColor, setAvatarColor] = useState(initial?.avatarColor ?? AVATAR_COLORS[0]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [withLogin, setWithLogin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    if (!name.trim()) return setError("Vui lòng nhập tên");
    setError(null);
    startTransition(async () => {
      try {
        if (initial?.id) {
          await updateMemberAction(initial.id, { name, role, avatarColor });
        } else {
          await createMemberAction({
            name,
            role,
            avatarColor,
            email: withLogin ? email : "",
            password: withLogin ? password : "",
          });
        }
        router.refresh();
        onClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
      }
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={initial?.id ? "Sửa thành viên" : "Thêm thành viên"}>
      <div className="space-y-4">
        <Field label="Tên thành viên" htmlFor="mem-name">
          <Input id="mem-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Nguyễn Văn A" />
        </Field>

        <Field label="Vai trò" htmlFor="mem-role" hint="Trẻ em chỉ xem được tiêu vặt/mục tiêu của mình">
          <Select id="mem-role" value={role} onChange={(e) => setRole(e.target.value as MemberRole)}>
            {MEMBER_ROLES.map((r) => (
              <option key={r} value={r}>
                {MEMBER_ROLE_LABEL[r]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Màu đại diện">
          <div className="flex gap-2">
            {AVATAR_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setAvatarColor(c)}
                className="h-8 w-8 rounded-full ring-offset-2 ring-offset-surface"
                style={{ background: c, boxShadow: avatarColor === c ? `0 0 0 2px ${c}` : undefined }}
                aria-label={c}
              />
            ))}
          </div>
        </Field>

        {!initial?.id ? (
          <>
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border px-3.5 py-3">
              <span className="text-sm font-medium">Cấp tài khoản đăng nhập</span>
              <input
                type="checkbox"
                checked={withLogin}
                onChange={(e) => setWithLogin(e.target.checked)}
                className="h-5 w-5 accent-[var(--brand)]"
              />
            </label>
            {withLogin ? (
              <>
                <Field label="Email">
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@vidu.com" />
                </Field>
                <Field label="Mật khẩu">
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Ít nhất 6 ký tự" />
                </Field>
              </>
            ) : null}
          </>
        ) : initial.hasLogin ? (
          <p className="text-xs text-muted">Thành viên này đã có tài khoản đăng nhập riêng.</p>
        ) : null}

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <Button className="w-full" onClick={submit} disabled={pending}>
          {pending ? "Đang lưu..." : "Lưu thành viên"}
        </Button>
      </div>
    </Modal>
  );
}
