"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form-controls";
import { AmountInput } from "@/components/quick-add/amount-input";
import { RECURRING_FREQUENCIES, RECURRING_FREQUENCY_LABEL, type RecurringFrequency } from "@/lib/enums";
import { toDateInputValue } from "@/lib/format";
import { createRecurringRuleAction } from "@/lib/actions/recurring";

type Option = { id: string; name: string; type?: string; icon?: string };

export function RecurringFormModal({
  open,
  onClose,
  categories,
  accounts,
  jars,
  members,
}: {
  open: boolean;
  onClose: () => void;
  categories: Option[];
  accounts: Option[];
  jars: Option[];
  members: Option[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [amount, setAmount] = useState(0);
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [jarId, setJarId] = useState(jars[0]?.id ?? "");
  const [payerMemberId, setPayerMemberId] = useState(members[0]?.id ?? "");
  const [frequency, setFrequency] = useState<RecurringFrequency>("MONTHLY");
  const [startDate, setStartDate] = useState(toDateInputValue(new Date()));
  const [endDate, setEndDate] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filteredCategories = useMemo(() => categories.filter((c) => c.type === type), [categories, type]);

  function submit() {
    if (!name.trim() || amount <= 0 || !categoryId) {
      setError("Vui lòng nhập đủ tên, số tiền và danh mục");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await createRecurringRuleAction({
          name,
          type,
          amount,
          categoryId,
          accountId,
          jarId: type === "EXPENSE" ? jarId : undefined,
          payerMemberId,
          isShared: false,
          frequency,
          startDate,
          endDate: endDate || undefined,
          note,
        });
        router.refresh();
        onClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
      }
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Thêm giao dịch định kỳ" widthClassName="max-w-lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-black/5 p-1 dark:bg-white/5">
          <button
            onClick={() => {
              setType("EXPENSE");
              setCategoryId("");
            }}
            className={`rounded-lg py-2 text-sm font-semibold ${type === "EXPENSE" ? "bg-surface shadow-sm text-danger" : "text-muted"}`}
          >
            Khoản chi
          </button>
          <button
            onClick={() => {
              setType("INCOME");
              setCategoryId("");
            }}
            className={`rounded-lg py-2 text-sm font-semibold ${type === "INCOME" ? "bg-surface shadow-sm text-success" : "text-muted"}`}
          >
            Khoản thu
          </button>
        </div>

        <Field label="Tên">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Tiền điện hàng tháng" />
        </Field>
        <Field label="Số tiền">
          <AmountInput value={amount} onChange={setAmount} />
        </Field>
        <Field label="Danh mục">
          <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">-- Chọn danh mục --</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tài khoản">
            <Select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Select>
          </Field>
          {type === "EXPENSE" ? (
            <Field label="Chiếc lọ">
              <Select value={jarId} onChange={(e) => setJarId(e.target.value)}>
                {jars.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.name}
                  </option>
                ))}
              </Select>
            </Field>
          ) : (
            <Field label="Người tạo thu nhập">
              <Select value={payerMemberId} onChange={(e) => setPayerMemberId(e.target.value)}>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </Select>
            </Field>
          )}
        </div>
        <Field label="Tần suất">
          <Select value={frequency} onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}>
            {RECURRING_FREQUENCIES.map((f) => (
              <option key={f} value={f}>
                {RECURRING_FREQUENCY_LABEL[f]}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Bắt đầu từ">
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </Field>
          <Field label="Kết thúc" hint="Không bắt buộc">
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </Field>
        </div>
        <Field label="Ghi chú">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Không bắt buộc" />
        </Field>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <Button className="w-full" onClick={submit} disabled={pending}>
          {pending ? "Đang lưu..." : "Lưu giao dịch định kỳ"}
        </Button>
      </div>
    </Modal>
  );
}
