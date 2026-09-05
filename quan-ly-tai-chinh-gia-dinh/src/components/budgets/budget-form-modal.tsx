"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/form-controls";
import { AmountInput } from "@/components/quick-add/amount-input";
import { BUDGET_SCOPES, BUDGET_SCOPE_LABEL, type BudgetScope } from "@/lib/enums";
import { createBudgetAction } from "@/lib/actions/budgets";

type Option = { id: string; name: string };

export function BudgetFormModal({
  open,
  onClose,
  month,
  year,
  categories,
  members,
  jars,
}: {
  open: boolean;
  onClose: () => void;
  month: number;
  year: number;
  categories: Option[];
  members: Option[];
  jars: Option[];
}) {
  const router = useRouter();
  const [scope, setScope] = useState<BudgetScope>("CATEGORY");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [memberId, setMemberId] = useState(members[0]?.id ?? "");
  const [jarId, setJarId] = useState(jars[0]?.id ?? "");
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    if (amount <= 0) return setError("Vui lòng nhập số tiền ngân sách");
    setError(null);
    startTransition(async () => {
      try {
        await createBudgetAction({
          month,
          year,
          scope,
          amount,
          categoryId: scope === "CATEGORY" ? categoryId : undefined,
          memberId: scope === "MEMBER" ? memberId : undefined,
          jarId: scope === "JAR" ? jarId : undefined,
        });
        router.refresh();
        onClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
      }
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Thêm ngân sách">
      <div className="space-y-4">
        <Field label="Áp dụng cho">
          <div className="grid grid-cols-3 gap-2">
            {BUDGET_SCOPES.map((s) => (
              <button
                key={s}
                onClick={() => setScope(s)}
                className={`rounded-xl border px-2 py-2 text-xs font-medium ${
                  scope === s ? "border-brand bg-brand-soft text-brand" : "border-border text-muted"
                }`}
              >
                {BUDGET_SCOPE_LABEL[s]}
              </button>
            ))}
          </div>
        </Field>

        {scope === "CATEGORY" ? (
          <Field label="Danh mục chi tiêu">
            <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
        ) : null}
        {scope === "MEMBER" ? (
          <Field label="Thành viên">
            <Select value={memberId} onChange={(e) => setMemberId(e.target.value)}>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </Field>
        ) : null}
        {scope === "JAR" ? (
          <Field label="Chiếc lọ">
            <Select value={jarId} onChange={(e) => setJarId(e.target.value)}>
              {jars.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.name}
                </option>
              ))}
            </Select>
          </Field>
        ) : null}

        <Field label="Số tiền ngân sách / tháng">
          <AmountInput value={amount} onChange={setAmount} />
        </Field>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <Button className="w-full" onClick={submit} disabled={pending}>
          {pending ? "Đang lưu..." : "Lưu ngân sách"}
        </Button>
      </div>
    </Modal>
  );
}
