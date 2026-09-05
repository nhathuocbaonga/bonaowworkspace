"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form-controls";
import { AmountInput } from "@/components/quick-add/amount-input";
import { toDateInputValue } from "@/lib/format";
import { createReceivableAction } from "@/lib/actions/receivables";

type Member = { id: string; name: string };
type Account = { id: string; name: string };

export function ReceivableFormModal({
  open,
  onClose,
  members,
  accounts,
}: {
  open: boolean;
  onClose: () => void;
  members: Member[];
  accounts: Account[];
}) {
  const router = useRouter();
  const [borrowerName, setBorrowerName] = useState("");
  const [lentByMemberId, setLentByMemberId] = useState(members[0]?.id ?? "");
  const [amount, setAmount] = useState(0);
  const [lentDate, setLentDate] = useState(toDateInputValue(new Date()));
  const [dueDate, setDueDate] = useState("");
  const [interestRate, setInterestRate] = useState<number | "">("");
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id ?? "");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    if (!borrowerName.trim() || amount <= 0) {
      setError("Vui lòng nhập tên người vay và số tiền cho vay");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await createReceivableAction({
          borrowerName,
          lentByMemberId,
          amount,
          lentDate,
          dueDate: dueDate || undefined,
          interestRate: interestRate === "" ? undefined : Number(interestRate),
          note,
          fromAccountId,
        });
        router.refresh();
        onClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
      }
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Thêm khoản cho vay">
      <div className="space-y-4">
        <Field label="Người vay">
          <Input value={borrowerName} onChange={(e) => setBorrowerName(e.target.value)} placeholder="VD: Anh Tuấn (bạn)" />
        </Field>
        <Field label="Số tiền cho vay">
          <AmountInput value={amount} onChange={setAmount} />
        </Field>
        <Field label="Người trong gia đình cho vay">
          <Select value={lentByMemberId} onChange={(e) => setLentByMemberId(e.target.value)}>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Chi từ tài khoản">
          <Select value={fromAccountId} onChange={(e) => setFromAccountId(e.target.value)}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ngày cho vay">
            <Input type="date" value={lentDate} onChange={(e) => setLentDate(e.target.value)} />
          </Field>
          <Field label="Hạn trả">
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </Field>
        </div>
        <Field label="Lãi suất (%/năm)" hint="Không bắt buộc">
          <Input
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </Field>
        <Field label="Ghi chú">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Không bắt buộc" />
        </Field>

        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <p className="text-xs text-muted">
          Khoản cho vay không được ghi nhận là chi tiêu — chỉ làm giảm tiền và tạo khoản phải thu.
        </p>

        <Button className="w-full" onClick={submit} disabled={pending}>
          {pending ? "Đang lưu..." : "Lưu khoản cho vay"}
        </Button>
      </div>
    </Modal>
  );
}
