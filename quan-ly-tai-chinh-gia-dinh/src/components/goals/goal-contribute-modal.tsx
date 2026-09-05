"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/form-controls";
import { AmountInput } from "@/components/quick-add/amount-input";
import { contributeToGoalAction } from "@/lib/actions/goals";

export function GoalContributeModal({
  open,
  onClose,
  goalId,
  goalName,
}: {
  open: boolean;
  onClose: () => void;
  goalId: string;
  goalName: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"ADD" | "WITHDRAW">("ADD");
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    if (amount <= 0) return setError("Vui lòng nhập số tiền");
    setError(null);
    startTransition(async () => {
      try {
        await contributeToGoalAction({ goalId, amount: mode === "ADD" ? amount : -amount, note });
        router.refresh();
        onClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
      }
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={`Cập nhật quỹ: ${goalName}`}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-black/5 p-1 dark:bg-white/5">
          <button
            onClick={() => setMode("ADD")}
            className={`rounded-lg py-2 text-sm font-semibold ${mode === "ADD" ? "bg-surface shadow-sm text-success" : "text-muted"}`}
          >
            Nạp thêm
          </button>
          <button
            onClick={() => setMode("WITHDRAW")}
            className={`rounded-lg py-2 text-sm font-semibold ${mode === "WITHDRAW" ? "bg-surface shadow-sm text-danger" : "text-muted"}`}
          >
            Rút bớt
          </button>
        </div>
        <AmountInput value={amount} onChange={setAmount} autoFocus />
        <Field label="Ghi chú">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Không bắt buộc" />
        </Field>

        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <p className="text-xs text-muted">
          Đây là cập nhật tiến độ theo dõi mục tiêu, không tạo giao dịch thu/chi mới (số tiền vẫn đang nằm trong tài khoản/lọ tương ứng).
        </p>

        <Button className="w-full" onClick={submit} disabled={pending}>
          {pending ? "Đang lưu..." : "Xác nhận"}
        </Button>
      </div>
    </Modal>
  );
}
