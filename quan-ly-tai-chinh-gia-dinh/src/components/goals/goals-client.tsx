"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { Icon } from "@/components/icon";
import { formatMoney, formatDate } from "@/lib/format";
import { GoalFormModal } from "./goal-form-modal";
import { GoalContributeModal } from "./goal-contribute-modal";
import { deleteGoalAction } from "@/lib/actions/goals";
import type { getGoalsWithProgress } from "@/lib/debts-goals";

type Member = { id: string; name: string };
type Goal = Awaited<ReturnType<typeof getGoalsWithProgress>>[number];

export function GoalsClient({ goals, members }: { goals: Goal[]; members: Member[] }) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [contributing, setContributing] = useState<Goal | null>(null);
  const [pending, startTransition] = useTransition();

  const regularGoals = goals.filter((g) => !g.isEmergencyFund);

  function remove(id: string) {
    if (!confirm("Xóa mục tiêu này?")) return;
    startTransition(async () => {
      await deleteGoalAction(id);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Mục tiêu tài chính</h1>
          <p className="text-sm text-muted">{regularGoals.length} mục tiêu</p>
        </div>
        <div className="flex gap-2">
          <Link href="/emergency-fund">
            <Button size="sm" variant="outline">
              <Icon name="ShieldCheck" size={14} /> Quỹ dự phòng
            </Button>
          </Link>
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Icon name="Plus" size={14} /> Thêm mục tiêu
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {regularGoals.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">Chưa có mục tiêu tài chính nào.</p>
        ) : (
          regularGoals.map((g) => (
            <Card key={g.id}>
              <CardContent className="p-4 sm:p-5">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <p className="font-medium">{g.name}</p>
                    <p className="text-xs text-muted">
                      {g.owner?.name ?? "Chung cả gia đình"}
                      {g.targetDate ? ` · Dự kiến ${formatDate(g.targetDate)}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    {g.isCompleted ? <Badge tone="success">Hoàn thành</Badge> : null}
                    {!g.isCompleted && !g.isOnTrack ? <Badge tone="warning">Chậm tiến độ</Badge> : null}
                  </div>
                </div>
                <ProgressBar percent={g.percent} colorClass={g.isCompleted ? "bg-success" : undefined} />
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-muted">
                    {formatMoney(g.currentAmount)} / {formatMoney(g.targetAmount)}
                  </span>
                  <span className="font-medium">{Math.round(g.percent)}%</span>
                </div>
                {g.monthsLeft && !g.isCompleted ? (
                  <p className="mt-1 text-xs text-muted">
                    Còn {g.monthsLeft} tháng — cần tiết kiệm thêm ~{formatMoney(g.requiredMonthly)}/tháng
                  </p>
                ) : null}
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setContributing(g)}>
                    Cập nhật quỹ
                  </Button>
                  <button
                    onClick={() => remove(g.id)}
                    disabled={pending}
                    className="rounded-lg p-2 text-muted hover:bg-danger-soft hover:text-danger"
                    aria-label="Xóa"
                  >
                    <Icon name="Trash2" size={14} />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <GoalFormModal open={formOpen} onClose={() => setFormOpen(false)} members={members} />
      {contributing ? (
        <GoalContributeModal
          open={!!contributing}
          onClose={() => setContributing(null)}
          goalId={contributing.id}
          goalName={contributing.name}
        />
      ) : null}
    </div>
  );
}
