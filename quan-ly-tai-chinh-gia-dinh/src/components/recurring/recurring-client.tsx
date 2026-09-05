"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/icon";
import { formatMoney, formatDate } from "@/lib/format";
import { RECURRING_FREQUENCY_LABEL, type RecurringFrequency } from "@/lib/enums";
import { RecurringFormModal } from "./recurring-form-modal";
import {
  confirmRecurringPaymentAction,
  skipRecurringPaymentAction,
  toggleRecurringRuleActiveAction,
  deleteRecurringRuleAction,
} from "@/lib/actions/recurring";

type Option = { id: string; name: string; type?: string; icon?: string };
type Rule = {
  id: string;
  name: string;
  type: string;
  amount: number;
  frequency: string;
  nextRunDate: Date;
  isActive: boolean;
  note: string | null;
};

export function RecurringClient({
  rules,
  categories,
  accounts,
  jars,
  members,
}: {
  rules: Rule[];
  categories: Option[];
  accounts: Option[];
  jars: Option[];
  members: Option[];
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const now = new Date();
  const due = rules.filter((r) => r.isActive && r.nextRunDate <= now);
  const upcoming = rules.filter((r) => r.isActive && r.nextRunDate > now);
  const inactive = rules.filter((r) => !r.isActive);

  function handleConfirmPayment(id: string) {
    startTransition(async () => {
      await confirmRecurringPaymentAction(id);
      router.refresh();
    });
  }
  function skip(id: string) {
    startTransition(async () => {
      await skipRecurringPaymentAction(id);
      router.refresh();
    });
  }
  function toggleActive(id: string, isActive: boolean) {
    startTransition(async () => {
      await toggleRecurringRuleActiveAction(id, isActive);
      router.refresh();
    });
  }
  function remove(id: string) {
    if (!confirm("Xóa giao dịch định kỳ này?")) return;
    startTransition(async () => {
      await deleteRecurringRuleAction(id);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Giao dịch định kỳ</h1>
          <p className="text-sm text-muted">{rules.length} quy tắc</p>
        </div>
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Icon name="Plus" size={14} /> Thêm định kỳ
        </Button>
      </div>

      {due.length > 0 ? (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-warning">Đến hạn ({due.length})</h2>
          <div className="space-y-2">
            {due.map((r) => (
              <RuleRow
                key={r.id}
                r={r}
                due
                onConfirm={handleConfirmPayment}
                onSkip={skip}
                onPause={() => toggleActive(r.id, false)}
                onDelete={remove}
                pending={pending}
              />
            ))}
          </div>
        </section>
      ) : null}

      {upcoming.length > 0 ? (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-muted">Sắp tới</h2>
          <div className="space-y-2">
            {upcoming.map((r) => (
              <RuleRow
                key={r.id}
                r={r}
                onConfirm={handleConfirmPayment}
                onSkip={skip}
                onPause={() => toggleActive(r.id, false)}
                onDelete={remove}
                pending={pending}
              />
            ))}
          </div>
        </section>
      ) : null}

      {inactive.length > 0 ? (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-muted">Đã tạm dừng</h2>
          <div className="space-y-2">
            {inactive.map((r) => (
              <Card key={r.id}>
                <CardContent className="flex items-center justify-between p-3.5 opacity-70">
                  <div>
                    <p className="text-sm font-medium">{r.name}</p>
                    <p className="text-xs text-muted">{formatMoney(r.amount)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => toggleActive(r.id, true)} disabled={pending}>
                      Bật lại
                    </Button>
                    <button
                      onClick={() => remove(r.id)}
                      disabled={pending}
                      className="rounded-lg p-2 text-muted hover:bg-danger-soft hover:text-danger"
                      aria-label="Xóa"
                    >
                      <Icon name="Trash2" size={14} />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {rules.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">Chưa có giao dịch định kỳ nào.</p>
      ) : null}

      <RecurringFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        categories={categories}
        accounts={accounts}
        jars={jars}
        members={members}
      />
    </div>
  );
}

function RuleRow({
  r,
  due,
  onConfirm,
  onSkip,
  onPause,
  onDelete,
  pending,
}: {
  r: Rule;
  due?: boolean;
  onConfirm: (id: string) => void;
  onSkip: (id: string) => void;
  onPause: () => void;
  onDelete: (id: string) => void;
  pending: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <div>
            <p className="font-medium">{r.name}</p>
            <p className="text-xs text-muted">
              {RECURRING_FREQUENCY_LABEL[r.frequency as RecurringFrequency]} · Ngày tới: {formatDate(r.nextRunDate)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {due ? <Badge tone="warning">Đến hạn</Badge> : null}
            <p className={`font-semibold ${r.type === "INCOME" ? "text-success" : "text-danger"}`}>
              {r.type === "INCOME" ? "+" : "-"}
              {formatMoney(r.amount)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => onConfirm(r.id)} disabled={pending}>
            Xác nhận đã thanh toán
          </Button>
          <Button size="sm" variant="outline" onClick={() => onSkip(r.id)} disabled={pending}>
            Bỏ qua kỳ này
          </Button>
          <button
            onClick={onPause}
            disabled={pending}
            className="rounded-lg px-2 py-1.5 text-xs text-muted hover:bg-black/5 dark:hover:bg-white/10"
          >
            Tạm dừng
          </button>
          <button
            onClick={() => onDelete(r.id)}
            disabled={pending}
            className="rounded-lg p-1.5 text-muted hover:bg-danger-soft hover:text-danger"
            aria-label="Xóa"
          >
            <Icon name="Trash2" size={14} />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
