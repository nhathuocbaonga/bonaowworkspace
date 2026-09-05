"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, Select, Textarea } from "@/components/ui/form-controls";
import { Icon } from "@/components/icon";
import {
  NECESSITY_LEVELS,
  NECESSITY_LABEL,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_LABEL,
} from "@/lib/enums";
import {
  softDeleteTransactionAction,
  restoreTransactionAction,
  updateTransactionAction,
} from "@/lib/actions/transactions";

export function TransactionDetailActions({
  transaction,
  isExpense,
  isTransfer,
}: {
  transaction: {
    id: string;
    isDeleted: boolean;
    canEditCore: boolean;
    note: string | null;
    necessity: string | null;
    paymentMethod: string;
    status: string;
    isFixed: boolean;
    location: string | null;
    isShared: boolean;
    beneficiaryIds: string[];
  };
  isExpense: boolean;
  isTransfer: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(transaction.note ?? "");
  const [necessity, setNecessity] = useState(transaction.necessity ?? "CAN_THIET");
  const [paymentMethod, setPaymentMethod] = useState(transaction.paymentMethod);
  const [status, setStatus] = useState(transaction.status);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        await updateTransactionAction({
          transactionId: transaction.id,
          note,
          necessity: isExpense ? necessity : undefined,
          paymentMethod: !isTransfer ? paymentMethod : undefined,
          status: !isTransfer ? status : undefined,
        });
        router.refresh();
        setEditing(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
      }
    });
  }

  function remove() {
    if (!confirm("Xóa giao dịch này? Bạn có thể khôi phục lại sau.")) return;
    startTransition(async () => {
      await softDeleteTransactionAction(transaction.id);
      router.refresh();
    });
  }

  function restore() {
    startTransition(async () => {
      await restoreTransactionAction(transaction.id);
      router.refresh();
    });
  }

  if (transaction.isDeleted) {
    return (
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <p className="text-sm text-muted">Giao dịch này đã bị xóa.</p>
          <Button size="sm" variant="outline" onClick={restore} disabled={pending}>
            <Icon name="ArrowLeftRight" size={14} /> Khôi phục
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!editing) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={() => setEditing(true)}>
          <Icon name="Pencil" size={16} /> Sửa
        </Button>
        <Button variant="danger" className="flex-1" onClick={remove} disabled={pending}>
          <Icon name="Trash2" size={16} /> Xóa
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        {!transaction.canEditCore ? (
          <p className="rounded-xl bg-warning-soft px-3 py-2 text-xs text-warning">
            Giao dịch đã chia nhỏ theo nhiều danh mục — chỉ có thể sửa ghi chú và thông tin bổ sung. Để đổi số
            tiền/danh mục, hãy xóa và tạo lại giao dịch.
          </p>
        ) : null}

        {isExpense ? (
          <Field label="Mức độ cần thiết">
            <Select value={necessity} onChange={(e) => setNecessity(e.target.value)}>
              {NECESSITY_LEVELS.map((n) => (
                <option key={n} value={n}>
                  {NECESSITY_LABEL[n]}
                </option>
              ))}
            </Select>
          </Field>
        ) : null}

        {!isTransfer ? (
          <>
            <Field label="Hình thức thanh toán">
              <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                {PAYMENT_METHODS.map((p) => (
                  <option key={p} value={p}>
                    {PAYMENT_METHOD_LABEL[p]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Trạng thái thanh toán">
              <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {PAYMENT_STATUS_LABEL[s]}
                  </option>
                ))}
              </Select>
            </Field>
          </>
        ) : null}

        <Field label="Ghi chú">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setEditing(false)} disabled={pending}>
            Hủy
          </Button>
          <Button className="flex-1" onClick={save} disabled={pending}>
            {pending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
