"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { Icon } from "@/components/icon";
import { formatMoney } from "@/lib/format";
import { JarTransferModal } from "./jar-transfer-modal";
import { JarPercentagesModal } from "./jar-percentages-modal";
import type { JarWithBalance } from "@/lib/finance";

export function JarsClient({ jars }: { jars: JarWithBalance[] }) {
  const [transferOpen, setTransferOpen] = useState(false);
  const [percentOpen, setPercentOpen] = useState(false);

  const totalPercentage = Math.round(jars.reduce((s, j) => s + j.percentage, 0) * 100) / 100;
  const totalBalance = jars.reduce((s, j) => s + j.balance, 0);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">6 Chiếc lọ tài chính</h1>
          <p className="text-sm text-muted">Phương pháp T. Harv Eker — Tổng số dư: {formatMoney(totalBalance)}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setTransferOpen(true)}>
            <Icon name="ArrowLeftRight" size={14} /> Chuyển lọ
          </Button>
          <Button size="sm" onClick={() => setPercentOpen(true)}>
            <Icon name="Settings" size={14} /> Tỷ lệ
          </Button>
        </div>
      </div>

      {Math.abs(totalPercentage - 100) > 0.01 ? (
        <div className="flex items-center gap-2 rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning">
          <Icon name="AlertTriangle" size={16} />
          Tổng tỷ lệ hiện tại là {totalPercentage}%, khác 100%. Vui lòng điều chỉnh lại.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {jars.map((jar) => {
          const allocated = jar.balance + jar.spent;
          const percentUsed = allocated > 0 ? (jar.spent / allocated) * 100 : 0;
          const isLow = jar.balance < 0;
          const isNearLimit = allocated > 0 && percentUsed >= 90 && !isLow;

          return (
            <Card key={jar.id}>
              <CardContent className="p-4 sm:p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full"
                      style={{ background: `${jar.color}22`, color: jar.color }}
                    >
                      <Icon name={jar.icon} size={18} />
                    </div>
                    <div>
                      <p className="font-semibold">{jar.name}</p>
                      <p className="text-xs text-muted">{jar.percentage}% thu nhập</p>
                    </div>
                  </div>
                  {isLow ? <Badge tone="danger">Âm quỹ</Badge> : null}
                  {isNearLimit ? <Badge tone="warning">Sắp hết</Badge> : null}
                </div>

                <p className={`text-2xl font-bold ${isLow ? "text-danger" : ""}`}>{formatMoney(jar.balance)}</p>
                <p className="mb-2 text-xs text-muted">Số dư hiện tại</p>

                {allocated > 0 ? (
                  <>
                    <ProgressBar percent={percentUsed} />
                    <div className="mt-1.5 flex justify-between text-xs text-muted">
                      <span>Đã chi {formatMoney(jar.spent)}</span>
                      <span>{Math.round(percentUsed)}%</span>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted">Chưa có dữ liệu phân bổ</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <JarTransferModal open={transferOpen} onClose={() => setTransferOpen(false)} jars={jars} />
      <JarPercentagesModal open={percentOpen} onClose={() => setPercentOpen(false)} jars={jars} />
    </div>
  );
}
