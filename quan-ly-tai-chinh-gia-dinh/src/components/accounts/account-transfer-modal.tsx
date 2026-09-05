"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form-controls";
import { AmountInput } from "@/components/quick-add/amount-input";
import { toDateInputValue } from "@/lib/format";
import { createAccountTransferAction } from "@/lib/actions/transactions";

type Account = { id: string; name: string };

export function AccountTransferModal({
  open,
  onClose,
  accounts,
}: {
  open: boolean;
  onClose: () => void;
  accounts: Account[];
}) {
  const router = useRouter();
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(toDateInputValue(new Date()));
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id ?? accounts[0]?.id ?? "");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    if (amount <= 0) return setError("Vui lòng nhập số tiền");
    if (accountId === toAccountId) return setError("Tài khoản nguồn và đích phải khác nhau");
    setError(null);
    startTransition(async () => {
      try {
        await createAccountTransferAction({ amount, date, accountId, toAccountId, note });
        router.refresh();
        onClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
      }
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Chuyển tiền giữa tài khoản">
      <div className="space-y-4">
        <AmountInput value={amount} onChange={setAmount} autoFocus />
        <Field label="Ngày">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Từ tài khoản">
          <Select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Đến tài khoản">
          <Select value={toAccountId} onChange={(e) => setToAccountId(e.target.value)}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Ghi chú">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Không bắt buộc" />
        </Field>

        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <p className="text-xs text-muted">
          Chuyển tiền giữa các tài khoản của gia đình không được tính là thu nhập hoặc chi phí.
        </p>

        <Button className="w-full" onClick={submit} disabled={pending}>
          {pending ? "Đang chuyển..." : "Xác nhận chuyển tiền"}
        </Button>
      </div>
    </Modal>
  );
}
