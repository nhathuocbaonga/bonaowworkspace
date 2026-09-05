"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form-controls";
import { AmountInput } from "@/components/quick-add/amount-input";
import { ACCOUNT_TYPES, ACCOUNT_TYPE_LABEL, type AccountType } from "@/lib/enums";
import { createAccountAction, updateAccountAction, type AccountInput } from "@/lib/actions/accounts";

type Member = { id: string; name: string };

export function AccountFormModal({
  open,
  onClose,
  members,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  members: Member[];
  initial?: { id: string } & Partial<AccountInput>;
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<AccountType>((initial?.type as AccountType) ?? "CASH");
  const [ownerMemberId, setOwnerMemberId] = useState(initial?.ownerMemberId ?? "");
  const [openingBalance, setOpeningBalance] = useState(initial?.openingBalance ?? 0);
  const [note, setNote] = useState(initial?.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    if (!name.trim()) {
      setError("Vui lòng nhập tên tài khoản");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const input: AccountInput = { name, type, ownerMemberId, openingBalance, note };
        if (initial?.id) {
          await updateAccountAction(initial.id, input);
        } else {
          await createAccountAction(input);
        }
        router.refresh();
        onClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
      }
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={initial?.id ? "Sửa tài khoản" : "Thêm tài khoản"}>
      <div className="space-y-4">
        <Field label="Tên tài khoản" htmlFor="acc-name">
          <Input id="acc-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Tài khoản Vietcombank" />
        </Field>
        <Field label="Loại tài khoản" htmlFor="acc-type">
          <Select id="acc-type" value={type} onChange={(e) => setType(e.target.value as AccountType)}>
            {ACCOUNT_TYPES.map((t) => (
              <option key={t} value={t}>
                {ACCOUNT_TYPE_LABEL[t]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Chủ tài khoản" htmlFor="acc-owner">
          <Select id="acc-owner" value={ownerMemberId} onChange={(e) => setOwnerMemberId(e.target.value)}>
            <option value="">Chung cả gia đình</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Số dư đầu kỳ" hint="Số dư hiện có tại thời điểm bắt đầu dùng ứng dụng">
          <AmountInput value={openingBalance} onChange={setOpeningBalance} />
        </Field>
        <Field label="Ghi chú">
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Không bắt buộc" />
        </Field>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <Button className="w-full" onClick={submit} disabled={pending}>
          {pending ? "Đang lưu..." : "Lưu tài khoản"}
        </Button>
      </div>
    </Modal>
  );
}
