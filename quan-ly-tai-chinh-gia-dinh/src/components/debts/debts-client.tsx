"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/icon";
import { formatMoney, formatDate } from "@/lib/format";
import { DEBT_SCHEDULE_LABEL, RECEIVABLE_STATUS_LABEL, type DebtSchedule, type ReceivableStatus } from "@/lib/enums";
import { DebtFormModal } from "./debt-form-modal";
import { DebtPaymentModal } from "./debt-payment-modal";
import { ReceivableFormModal } from "./receivable-form-modal";
import { ReceivableCollectModal } from "./receivable-collect-modal";
import type { getDebtsWithBalance, getReceivablesWithBalance } from "@/lib/debts-goals";

type Member = { id: string; name: string };
type Account = { id: string; name: string };
type Debt = Awaited<ReturnType<typeof getDebtsWithBalance>>[number];
type Receivable = Awaited<ReturnType<typeof getReceivablesWithBalance>>[number];

export function DebtsClient({
  debts,
  receivables,
  members,
  accounts,
}: {
  debts: Debt[];
  receivables: Receivable[];
  members: Member[];
  accounts: Account[];
}) {
  const [tab, setTab] = useState<"DEBT" | "RECEIVABLE">("DEBT");
  const [debtFormOpen, setDebtFormOpen] = useState(false);
  const [receivableFormOpen, setReceivableFormOpen] = useState(false);
  const [payingDebt, setPayingDebt] = useState<Debt | null>(null);
  const [collectingReceivable, setCollectingReceivable] = useState<Receivable | null>(null);

  const totalDebt = debts.filter((d) => d.status === "ACTIVE").reduce((s, d) => s + d.remainingBalance, 0);
  const totalReceivable = receivables.reduce((s, r) => s + r.outstanding, 0);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">Nợ & Khoản phải thu</h1>
        <p className="text-sm text-muted">
          Đang nợ: <span className="font-semibold text-danger">{formatMoney(totalDebt)}</span> · Đang cho vay:{" "}
          <span className="font-semibold text-success">{formatMoney(totalReceivable)}</span>
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2 rounded-xl bg-black/5 p-1 dark:bg-white/5">
          <button
            onClick={() => setTab("DEBT")}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium ${tab === "DEBT" ? "bg-surface shadow-sm" : "text-muted"}`}
          >
            Đang vay ({debts.length})
          </button>
          <button
            onClick={() => setTab("RECEIVABLE")}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium ${tab === "RECEIVABLE" ? "bg-surface shadow-sm" : "text-muted"}`}
          >
            Cho vay ({receivables.length})
          </button>
        </div>
        <Button size="sm" onClick={() => (tab === "DEBT" ? setDebtFormOpen(true) : setReceivableFormOpen(true))}>
          <Icon name="Plus" size={14} /> Thêm
        </Button>
      </div>

      {tab === "DEBT" ? (
        <div className="space-y-3">
          {debts.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">Chưa có khoản nợ nào.</p>
          ) : (
            debts.map((d) => (
              <Card key={d.id}>
                <CardContent className="p-4 sm:p-5">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <p className="font-medium">{d.name}</p>
                      <p className="text-xs text-muted">
                        {d.lender} · {DEBT_SCHEDULE_LABEL[d.paymentSchedule as DebtSchedule]}
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      {d.status === "PAID_OFF" ? <Badge tone="success">Đã trả hết</Badge> : null}
                      {d.isOverdue ? <Badge tone="danger">Quá hạn</Badge> : null}
                      {d.isDueSoon && !d.isOverdue ? <Badge tone="warning">Sắp đến hạn</Badge> : null}
                    </div>
                  </div>
                  <div className="mb-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-muted">Dư nợ hiện tại</p>
                      <p className="font-semibold text-danger">{formatMoney(d.remainingBalance)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted">Đã trả gốc</p>
                      <p className="font-medium">{formatMoney(d.principalPaid)}</p>
                    </div>
                    {d.nextPaymentDate ? (
                      <div>
                        <p className="text-xs text-muted">Ngày trả tiếp theo</p>
                        <p className="font-medium">{formatDate(d.nextPaymentDate)}</p>
                      </div>
                    ) : null}
                  </div>
                  {d.status === "ACTIVE" && d.remainingBalance > 0 ? (
                    <Button size="sm" variant="outline" onClick={() => setPayingDebt(d)}>
                      Trả nợ
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {receivables.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">Chưa có khoản cho vay nào.</p>
          ) : (
            receivables.map((r) => (
              <Card key={r.id}>
                <CardContent className="p-4 sm:p-5">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <p className="font-medium">{r.borrowerName}</p>
                      <p className="text-xs text-muted">
                        Cho vay ngày {formatDate(r.lentDate)}
                        {r.dueDate ? ` · Hạn ${formatDate(r.dueDate)}` : ""}
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      <Badge
                        tone={
                          r.status === "COLLECTED" ? "success" : r.status === "WRITTEN_OFF" ? "muted" : r.isOverdue ? "danger" : "brand"
                        }
                      >
                        {RECEIVABLE_STATUS_LABEL[r.status as ReceivableStatus]}
                      </Badge>
                      {r.isDueSoon && !r.isOverdue ? <Badge tone="warning">Sắp đến hạn</Badge> : null}
                    </div>
                  </div>
                  <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-muted">Còn phải thu</p>
                      <p className="font-semibold text-success">{formatMoney(r.outstanding)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted">Đã thu hồi</p>
                      <p className="font-medium">{formatMoney(r.collected)}</p>
                    </div>
                  </div>
                  {r.outstanding > 0 ? (
                    <Button size="sm" variant="outline" onClick={() => setCollectingReceivable(r)}>
                      Thu hồi
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      <DebtFormModal open={debtFormOpen} onClose={() => setDebtFormOpen(false)} members={members} accounts={accounts} />
      <ReceivableFormModal
        open={receivableFormOpen}
        onClose={() => setReceivableFormOpen(false)}
        members={members}
        accounts={accounts}
      />
      {payingDebt ? (
        <DebtPaymentModal
          open={!!payingDebt}
          onClose={() => setPayingDebt(null)}
          debtId={payingDebt.id}
          debtName={payingDebt.name}
          remainingBalance={payingDebt.remainingBalance}
          accounts={accounts}
        />
      ) : null}
      {collectingReceivable ? (
        <ReceivableCollectModal
          open={!!collectingReceivable}
          onClose={() => setCollectingReceivable(null)}
          receivableId={collectingReceivable.id}
          borrowerName={collectingReceivable.borrowerName}
          outstanding={collectingReceivable.outstanding}
          accounts={accounts}
        />
      ) : null}
    </div>
  );
}
