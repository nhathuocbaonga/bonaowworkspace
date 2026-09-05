"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form-controls";
import { AmountInput } from "@/components/quick-add/amount-input";
import { toDateInputValue, formatMoney } from "@/lib/format";
import { recordDebtPaymentAction } from "@/lib/actions/debts";

type Account = { id: string; name: string };

export function DebtPaymentModal({
  open,
  onClose,
  debtId,
  debtName,
  remainingBalance,
  accounts,
}: {
  open: boolean;
  onClose: () => void;
  debtId: string;
  debtName: string;
  remainingBalance: number;
  accounts: Account[];
}) {
  const router = useRouter();
  const [principalAmount, setPrincipalAmount] = useState(0);
  const [interestAmount, setInterestAmount] = useState(0);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [date, setDate] = useState(toDateInputValue(new Date()));
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    if (principalAmount <= 0 && interestAmount <= 0) {
      setError("Vui lòng nhập số tiền trả gốc hoặc lãi");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await recordDebtPaymentAction({ debtId, principalAmount, interestAmount, accountId, date, note });
        router.refresh();
        onClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
      }
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={`Trả nợ: ${debtName}`}>
      <div className="space-y-4">
        <p className="text-sm text-muted">Dư nợ hiện tại: <span className="font-semibold text-foreground">{formatMoney(remainingBalance)}</span></p>
        <Field label="Trả nợ gốc">
          <AmountInput value={principalAmount} onChange={setPrincipalAmount} />
        </Field>
        <Field label="Trả lãi">
          <AmountInput value={interestAmount} onChange={setInterestAmount} />
        </Field>
        <Field label="Tài khoản thanh toán">
          <Select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Ngày trả">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Ghi chú">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Không bắt buộc" />
        </Field>

        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <p className="text-xs text-muted">
          Trả gốc làm giảm tiền và giảm dư nợ. Trả lãi làm giảm tiền và được ghi nhận là chi phí.
        </p>

        <Button className="w-full" onClick={submit} disabled={pending}>
          {pending ? "Đang lưu..." : "Xác nhận thanh toán"}
        </Button>
      </div>
    </Modal>
  );
}
