"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form-controls";
import { AmountInput } from "@/components/quick-add/amount-input";
import { DEBT_SCHEDULES, DEBT_SCHEDULE_LABEL, type DebtSchedule } from "@/lib/enums";
import { toDateInputValue } from "@/lib/format";
import { createDebtAction } from "@/lib/actions/debts";

type Member = { id: string; name: string };
type Account = { id: string; name: string };

export function DebtFormModal({
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
  const [name, setName] = useState("");
  const [lender, setLender] = useState("");
  const [borrowerMemberId, setBorrowerMemberId] = useState(members[0]?.id ?? "");
  const [responsibleMemberId, setResponsibleMemberId] = useState(members[0]?.id ?? "");
  const [principalAmount, setPrincipalAmount] = useState(0);
  const [interestRate, setInterestRate] = useState<number | "">("");
  const [startDate, setStartDate] = useState(toDateInputValue(new Date()));
  const [dueDate, setDueDate] = useState("");
  const [paymentSchedule, setPaymentSchedule] = useState<DebtSchedule>("MONTHLY");
  const [installmentAmount, setInstallmentAmount] = useState(0);
  const [purpose, setPurpose] = useState("");
  const [note, setNote] = useState("");
  const [receiveNow, setReceiveNow] = useState(false);
  const [receiveIntoAccountId, setReceiveIntoAccountId] = useState(accounts[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    if (!name.trim() || !lender.trim() || principalAmount <= 0) {
      setError("Vui lòng nhập đủ tên khoản nợ, chủ nợ và số tiền vay");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await createDebtAction({
          name,
          lender,
          borrowerMemberId,
          responsibleMemberId,
          principalAmount,
          interestRate: interestRate === "" ? undefined : Number(interestRate),
          startDate,
          dueDate: dueDate || undefined,
          paymentSchedule,
          installmentAmount: installmentAmount > 0 ? installmentAmount : undefined,
          purpose,
          note,
          receiveIntoAccountId: receiveNow ? receiveIntoAccountId : undefined,
        });
        router.refresh();
        onClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
      }
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Thêm khoản nợ đang vay" widthClassName="max-w-lg">
      <div className="space-y-4">
        <Field label="Tên khoản nợ">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Vay mua xe máy" />
        </Field>
        <Field label="Chủ nợ / Ngân hàng">
          <Input value={lender} onChange={(e) => setLender(e.target.value)} placeholder="VD: Ngân hàng Vietcombank" />
        </Field>
        <Field label="Số tiền vay">
          <AmountInput value={principalAmount} onChange={setPrincipalAmount} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Người đứng tên vay">
            <Select value={borrowerMemberId} onChange={(e) => setBorrowerMemberId(e.target.value)}>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Người chịu trách nhiệm trả">
            <Select value={responsibleMemberId} onChange={(e) => setResponsibleMemberId(e.target.value)}>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ngày vay">
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </Field>
          <Field label="Ngày đến hạn (tổng)">
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Lãi suất (%/năm)">
            <Input
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="Không bắt buộc"
            />
          </Field>
          <Field label="Kỳ trả nợ">
            <Select value={paymentSchedule} onChange={(e) => setPaymentSchedule(e.target.value as DebtSchedule)}>
              {DEBT_SCHEDULES.map((s) => (
                <option key={s} value={s}>
                  {DEBT_SCHEDULE_LABEL[s]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Số tiền phải trả mỗi kỳ" hint="Không bắt buộc">
          <AmountInput value={installmentAmount} onChange={setInstallmentAmount} />
        </Field>
        <Field label="Mục đích vay">
          <Input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Không bắt buộc" />
        </Field>
        <Field label="Ghi chú">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Không bắt buộc" />
        </Field>

        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border px-3.5 py-3">
          <span className="text-sm font-medium">Đã nhận tiền vay vào tài khoản</span>
          <input
            type="checkbox"
            checked={receiveNow}
            onChange={(e) => setReceiveNow(e.target.checked)}
            className="h-5 w-5 accent-[var(--brand)]"
          />
        </label>
        {receiveNow ? (
          <Field label="Nhận vào tài khoản">
            <Select value={receiveIntoAccountId} onChange={(e) => setReceiveIntoAccountId(e.target.value)}>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Select>
          </Field>
        ) : null}

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <Button className="w-full" onClick={submit} disabled={pending}>
          {pending ? "Đang lưu..." : "Lưu khoản nợ"}
        </Button>
      </div>
    </Modal>
  );
}
