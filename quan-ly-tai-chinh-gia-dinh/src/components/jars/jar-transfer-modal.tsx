"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form-controls";
import { AmountInput } from "@/components/quick-add/amount-input";
import { Icon } from "@/components/icon";
import { toDateInputValue, formatMoney } from "@/lib/format";
import { createJarTransferAction } from "@/lib/actions/transactions";

type Jar = { id: string; name: string; icon: string; balance: number };

export function JarTransferModal({
  open,
  onClose,
  jars,
}: {
  open: boolean;
  onClose: () => void;
  jars: Jar[];
}) {
  const router = useRouter();
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(toDateInputValue(new Date()));
  const [jarId, setJarId] = useState(jars[0]?.id ?? "");
  const [toJarId, setToJarId] = useState(jars[1]?.id ?? jars[0]?.id ?? "");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const sourceJar = jars.find((j) => j.id === jarId);

  function submit() {
    if (amount <= 0) return setError("Vui lòng nhập số tiền");
    if (jarId === toJarId) return setError("Lọ nguồn và lọ đích phải khác nhau");
    setError(null);
    startTransition(async () => {
      try {
        await createJarTransferAction({ amount, date, jarId, toJarId, note });
        router.refresh();
        onClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
      }
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Chuyển tiền giữa 6 lọ">
      <div className="space-y-4">
        <AmountInput value={amount} onChange={setAmount} autoFocus />
        <Field label="Ngày">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Từ lọ" hint={sourceJar ? `Số dư hiện tại: ${formatMoney(sourceJar.balance)}` : undefined}>
          <Select value={jarId} onChange={(e) => setJarId(e.target.value)}>
            {jars.map((j) => (
              <option key={j.id} value={j.id}>
                {j.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Đến lọ">
          <Select value={toJarId} onChange={(e) => setToJarId(e.target.value)}>
            {jars.map((j) => (
              <option key={j.id} value={j.id}>
                {j.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Ghi chú">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Không bắt buộc" />
        </Field>

        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <div className="flex items-start gap-2 rounded-xl bg-brand-soft px-3 py-2.5 text-xs text-brand">
          <Icon name="AlertTriangle" size={14} className="mt-0.5 shrink-0" />
          Chuyển tiền giữa các lọ không được tính là thu nhập hoặc chi phí mới.
        </div>

        <Button className="w-full" onClick={submit} disabled={pending}>
          {pending ? "Đang chuyển..." : "Xác nhận chuyển tiền"}
        </Button>
      </div>
    </Modal>
  );
}
