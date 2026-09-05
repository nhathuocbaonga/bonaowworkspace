"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form-controls";
import { AmountInput } from "@/components/quick-add/amount-input";
import { toDateInputValue, formatMoney } from "@/lib/format";
import { collectReceivableAction } from "@/lib/actions/receivables";

type Account = { id: string; name: string };

export function ReceivableCollectModal({
  open,
  onClose,
  receivableId,
  borrowerName,
  outstanding,
  accounts,
}: {
  open: boolean;
  onClose: () => void;
  receivableId: string;
  borrowerName: string;
  outstanding: number;
  accounts: Account[];
}) {
  const router = useRouter();
  const [amount, setAmount] = useState(outstanding);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [date, setDate] = useState(toDateInputValue(new Date()));
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    if (amount <= 0) {
      setError("Vui lòng nhập số tiền thu hồi");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await collectReceivableAction({ receivableId, amount, accountId, date, note });
        router.refresh();
        onClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
      }
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={`Thu hồi nợ: ${borrowerName}`}>
      <div className="space-y-4">
        <p className="text-sm text-muted">
          Còn phải thu: <span className="font-semibold text-foreground">{formatMoney(outstanding)}</span>
        </p>
        <Field label="Số tiền thu hồi">
          <AmountInput value={amount} onChange={setAmount} />
        </Field>
        <Field label="Nhận vào tài khoản">
          <Select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Ngày thu hồi">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Ghi chú">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Không bắt buộc" />
        </Field>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <Button className="w-full" onClick={submit} disabled={pending}>
          {pending ? "Đang lưu..." : "Xác nhận thu hồi"}
        </Button>
      </div>
    </Modal>
  );
}
