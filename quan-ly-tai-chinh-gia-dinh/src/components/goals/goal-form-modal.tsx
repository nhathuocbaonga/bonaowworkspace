"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form-controls";
import { AmountInput } from "@/components/quick-add/amount-input";
import { toDateInputValue } from "@/lib/format";
import { createGoalAction } from "@/lib/actions/goals";

type Member = { id: string; name: string };

export function GoalFormModal({
  open,
  onClose,
  members,
  isEmergencyFund = false,
  title,
}: {
  open: boolean;
  onClose: () => void;
  members: Member[];
  isEmergencyFund?: boolean;
  title?: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(isEmergencyFund ? "Quỹ dự phòng gia đình" : "");
  const [ownerMemberId, setOwnerMemberId] = useState("");
  const [targetAmount, setTargetAmount] = useState(0);
  const [currentAmount, setCurrentAmount] = useState(0);
  const [targetDate, setTargetDate] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    if (!name.trim() || targetAmount <= 0) {
      setError("Vui lòng nhập tên và số tiền mục tiêu");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await createGoalAction({
          name,
          ownerMemberId: ownerMemberId || undefined,
          targetAmount,
          currentAmount,
          startDate: toDateInputValue(new Date()),
          targetDate: targetDate || undefined,
          note,
          isEmergencyFund,
        });
        router.refresh();
        onClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
      }
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={title ?? "Thêm mục tiêu tài chính"}>
      <div className="space-y-4">
        <Field label="Tên mục tiêu">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Mua nhà, Học đại học cho con..."
            disabled={isEmergencyFund}
          />
        </Field>
        <Field label="Số tiền cần đạt">
          <AmountInput value={targetAmount} onChange={setTargetAmount} />
        </Field>
        <Field label="Số tiền hiện có" hint="Nếu đã có sẵn một phần">
          <AmountInput value={currentAmount} onChange={setCurrentAmount} />
        </Field>
        {!isEmergencyFund ? (
          <Field label="Người sở hữu mục tiêu">
            <Select value={ownerMemberId} onChange={(e) => setOwnerMemberId(e.target.value)}>
              <option value="">Chung cả gia đình</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </Field>
        ) : null}
        <Field label="Ngày dự kiến hoàn thành" hint="Không bắt buộc">
          <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
        </Field>
        <Field label="Ghi chú">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Không bắt buộc" />
        </Field>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <Button className="w-full" onClick={submit} disabled={pending}>
          {pending ? "Đang lưu..." : "Lưu mục tiêu"}
        </Button>
      </div>
    </Modal>
  );
}
