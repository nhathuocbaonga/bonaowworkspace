"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { Icon } from "@/components/icon";
import { formatMoney } from "@/lib/format";
import { GoalFormModal } from "./goal-form-modal";
import { GoalContributeModal } from "./goal-contribute-modal";
import type { getEmergencyFundStatus } from "@/lib/debts-goals";

type Status = Awaited<ReturnType<typeof getEmergencyFundStatus>>;
type Member = { id: string; name: string };

export function EmergencyFundClient({ status, members }: { status: Status; members: Member[] }) {
  const [formOpen, setFormOpen] = useState(false);
  const [contributeOpen, setContributeOpen] = useState(false);

  if (!status.fund) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-1 text-xl font-bold sm:text-2xl">Quỹ dự phòng</h1>
        <p className="mb-6 text-sm text-muted">
          Quỹ dự phòng giúp gia đình có đệm tài chính khi gặp sự cố bất ngờ (mất việc, ốm đau...).
        </p>
        <Card>
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand">
              <Icon name="ShieldCheck" size={28} />
            </div>
            <p className="mb-1 font-medium">Chưa thiết lập quỹ dự phòng</p>
            <p className="mb-4 text-sm text-muted">
              Chi phí thiết yếu trung bình 3 tháng gần đây: <strong>{formatMoney(status.avgMonthlyEssential)}</strong>/tháng
            </p>
            <Button onClick={() => setFormOpen(true)}>Tạo quỹ dự phòng</Button>
          </CardContent>
        </Card>
        <GoalFormModal
          open={formOpen}
          onClose={() => setFormOpen(false)}
          members={members}
          isEmergencyFund
          title="Tạo quỹ dự phòng"
        />
      </div>
    );
  }

  const percent = status.target6 > 0 ? (status.currentAmount / status.target6) * 100 : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">Quỹ dự phòng</h1>
        <p className="text-sm text-muted">Đệm tài chính cho các tình huống khẩn cấp</p>
      </div>

      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-xs text-muted">Quỹ hiện có</p>
          <p className="mb-1 text-3xl font-bold text-brand">{formatMoney(status.currentAmount)}</p>
          <p className="mb-4 text-sm text-muted">
            Đủ sống <strong>{status.monthsCovered.toFixed(1)} tháng</strong> với chi phí thiết yếu hiện tại
          </p>
          <ProgressBar percent={percent} />
          <p className="mt-2 text-xs text-muted">Mục tiêu tham khảo: 6 tháng chi phí thiết yếu</p>
          <Button className="mt-4" onClick={() => setContributeOpen(true)}>
            Cập nhật quỹ
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <p className="mb-3 text-sm font-semibold">Mục tiêu theo số tháng</p>
          <div className="space-y-3">
            {[
              { label: "3 tháng", target: status.target3 },
              { label: "6 tháng", target: status.target6 },
              { label: "12 tháng", target: status.target12 },
            ].map((t) => {
              const p = t.target > 0 ? Math.min(100, (status.currentAmount / t.target) * 100) : 0;
              const shortfall = Math.max(0, t.target - status.currentAmount);
              return (
                <div key={t.label}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{t.label} — {formatMoney(t.target)}</span>
                    <span className="text-muted">
                      {shortfall > 0 ? `Còn thiếu ${formatMoney(shortfall)}` : "Đã đạt"}
                    </span>
                  </div>
                  <ProgressBar percent={p} />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <GoalContributeModal
        open={contributeOpen}
        onClose={() => setContributeOpen(false)}
        goalId={status.fund.id}
        goalName={status.fund.name}
      />
    </div>
  );
}
