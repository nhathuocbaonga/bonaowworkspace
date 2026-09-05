"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { Icon } from "@/components/icon";
import { formatMoney } from "@/lib/format";
import { BudgetFormModal } from "./budget-form-modal";
import { deleteBudgetAction, copyBudgetsFromPreviousMonthAction } from "@/lib/actions/budgets";
import type { getBudgetProgress } from "@/lib/finance";

type Option = { id: string; name: string };
type BudgetProgress = Awaited<ReturnType<typeof getBudgetProgress>>[number];

export function BudgetsClient({
  budgets,
  month,
  year,
  categories,
  members,
  jars,
}: {
  budgets: BudgetProgress[];
  month: number;
  year: number;
  categories: Option[];
  members: Option[];
  jars: Option[];
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function remove(id: string) {
    if (!confirm("Xóa ngân sách này?")) return;
    startTransition(async () => {
      await deleteBudgetAction(id);
      router.refresh();
    });
  }

  function copyPrev() {
    startTransition(async () => {
      await copyBudgetsFromPreviousMonthAction(month, year);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          {budgets.length === 0 ? (
            <Button variant="outline" size="sm" onClick={copyPrev} disabled={pending}>
              <Icon name="ArrowLeftRight" size={14} /> Sao chép tháng trước
            </Button>
          ) : null}
        </div>
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Icon name="Plus" size={14} /> Thêm ngân sách
        </Button>
      </div>

      <div className="space-y-3">
        {budgets.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">Chưa có ngân sách nào cho tháng này.</p>
        ) : (
          budgets.map((b) => {
            const label = b.category?.name ?? b.member?.name ?? b.jar?.name ?? "Ngân sách";
            return (
              <Card key={b.id}>
                <CardContent className="p-4 sm:p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-medium">{label}</p>
                    <div className="flex items-center gap-2">
                      {b.status === "OVER" ? <Badge tone="danger">Vượt ngân sách</Badge> : null}
                      {b.status === "DANGER" ? <Badge tone="warning">Đã dùng {Math.round(b.percent)}%</Badge> : null}
                      {b.status === "WARNING" ? <Badge tone="warning">Đã dùng 70%+</Badge> : null}
                      <button
                        onClick={() => remove(b.id)}
                        disabled={pending}
                        className="rounded-lg p-1.5 text-muted hover:bg-danger-soft hover:text-danger"
                        aria-label="Xóa"
                      >
                        <Icon name="Trash2" size={14} />
                      </button>
                    </div>
                  </div>
                  <ProgressBar percent={b.percent} />
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted sm:grid-cols-4">
                    <span>Ngân sách: {formatMoney(b.amount)}</span>
                    <span>Đã chi: {formatMoney(b.spent)}</span>
                    <span className={b.remaining < 0 ? "text-danger" : ""}>
                      Còn lại: {formatMoney(b.remaining)}
                    </span>
                    {b.daysLeft > 0 ? (
                      <span>
                        Dự báo cuối tháng: {formatMoney(b.projected)}{" "}
                        {b.projected > b.amount ? "(có thể vượt)" : "(ổn)"}
                      </span>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <BudgetFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        month={month}
        year={year}
        categories={categories}
        members={members}
        jars={jars}
      />
    </div>
  );
}
