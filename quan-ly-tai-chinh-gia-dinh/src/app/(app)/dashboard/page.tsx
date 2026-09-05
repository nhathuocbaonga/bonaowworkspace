import Link from "next/link";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  getAccountBalances,
  getJarBalances,
  getBudgetProgress,
  getMonthlySummary,
} from "@/lib/finance";
import { formatMoney, formatDate, monthLabel } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { Icon } from "@/components/icon";
import { Badge } from "@/components/ui/badge";
import { TransactionRow } from "@/components/transactions/transaction-row";
import { ACCOUNT_TYPE_LABEL, type AccountType } from "@/lib/enums";
import { getDebtsWithBalance, getReceivablesWithBalance } from "@/lib/debts-goals";

export default async function DashboardPage() {
  const session = await requireSession();
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [summary, accounts, jars, budgets, recentTx, family, debts, receivables, recurringDue] = await Promise.all([
    getMonthlySummary(session.familyId, month, year),
    getAccountBalances(session.familyId),
    getJarBalances(session.familyId),
    getBudgetProgress(session.familyId, month, year),
    prisma.transaction.findMany({
      where: { familyId: session.familyId, isDeleted: false },
      orderBy: { date: "desc" },
      take: 6,
      include: { category: true, account: true, toAccount: true, jar: true, toJar: true, payer: true },
    }),
    prisma.family.findUniqueOrThrow({ where: { id: session.familyId } }),
    getDebtsWithBalance(session.familyId),
    getReceivablesWithBalance(session.familyId),
    prisma.recurringRule.findMany({
      where: { familyId: session.familyId, isActive: true, nextRunDate: { lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) } },
      orderBy: { nextRunDate: "asc" },
    }),
  ]);

  const upcomingItems = [
    ...debts
      .filter((d) => d.isDueSoon || d.isOverdue)
      .map((d) => ({ label: `Trả nợ: ${d.name}`, date: d.nextPaymentDate!, overdue: d.isOverdue })),
    ...receivables
      .filter((r) => r.isDueSoon || r.isOverdue)
      .map((r) => ({ label: `Thu hồi: ${r.borrowerName}`, date: r.dueDate!, overdue: r.isOverdue })),
    ...recurringDue.map((r) => ({ label: r.name, date: r.nextRunDate, overdue: r.nextRunDate < now })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  const totalAssets = accounts
    .filter((a) => a.type !== "CREDIT_CARD")
    .reduce((s, a) => s + a.balance, 0);
  const totalCreditOwed = accounts
    .filter((a) => a.type === "CREDIT_CARD")
    .reduce((s, a) => s + Math.max(0, -a.balance), 0);
  const totalDebt = debts.filter((d) => d.status === "ACTIVE").reduce((s, d) => s + d.remainingBalance, 0);
  const totalReceivable = receivables.reduce((s, r) => s + r.outstanding, 0);
  const netWorth = totalAssets + totalReceivable - totalCreditOwed - totalDebt;

  const worstBudgets = [...budgets].sort((a, b) => b.percent - a.percent).slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">Chào {session.name.split(" ").pop()}! 👋</h1>
        <p className="text-sm text-muted">Tổng quan tài chính {monthLabel(month, year)} — {family.name}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Tổng thu tháng" value={summary.totalIncome} tone="success" icon="TrendingUp" />
        <StatCard label="Tổng chi tháng" value={summary.totalExpense} tone="danger" icon="Wallet" />
        <StatCard label="Dòng tiền ròng" value={summary.net} tone={summary.net >= 0 ? "success" : "danger"} icon="ArrowLeftRight" />
        <StatCard
          label="Tỷ lệ tiết kiệm"
          value={summary.savingsRate}
          tone={summary.savingsRate >= 20 ? "success" : "warning"}
          icon="PiggyBank"
          isPercent
        />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs text-muted">Tổng tài sản</p>
            <p className="mt-1 text-xl font-bold text-foreground sm:text-2xl">{formatMoney(totalAssets)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs text-muted">Tổng nợ (thẻ TD + vay)</p>
            <p className="mt-1 text-xl font-bold text-danger sm:text-2xl">{formatMoney(totalCreditOwed + totalDebt)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs text-muted">Đang cho vay</p>
            <p className="mt-1 text-xl font-bold text-success sm:text-2xl">{formatMoney(totalReceivable)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-5">
            <p className="text-xs text-muted">Tài sản ròng</p>
            <p className={`mt-1 text-xl font-bold sm:text-2xl ${netWorth >= 0 ? "text-brand" : "text-danger"}`}>
              {formatMoney(netWorth)}
            </p>
          </CardContent>
        </Card>
      </div>

      {upcomingItems.length > 0 ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Sắp đến hạn trong 7 ngày ({upcomingItems.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingItems.slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Icon name={item.overdue ? "AlertTriangle" : "History"} size={14} className={item.overdue ? "text-danger" : "text-warning"} />
                  {item.label}
                </span>
                <Badge tone={item.overdue ? "danger" : "warning"}>{formatDate(item.date)}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Tài khoản tiền</CardTitle>
            <Link href="/accounts" className="text-xs font-medium text-brand hover:underline">
              Xem tất cả
            </Link>
          </CardHeader>
          <CardContent className="space-y-1">
            {accounts.length === 0 ? (
              <EmptyRow text="Chưa có tài khoản nào" />
            ) : (
              accounts.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl px-2 py-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-brand">
                      <Icon name={a.type === "CREDIT_CARD" ? "CreditCard" : "Banknote"} size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{a.name}</p>
                      <p className="text-xs text-muted">{ACCOUNT_TYPE_LABEL[a.type as AccountType]}</p>
                    </div>
                  </div>
                  {a.type === "CREDIT_CARD" ? (
                    <p className="text-sm font-semibold text-danger">
                      Dư nợ {formatMoney(Math.max(0, -a.balance))}
                    </p>
                  ) : (
                    <p className={`text-sm font-semibold ${a.balance < 0 ? "text-danger" : ""}`}>
                      {formatMoney(a.balance)}
                    </p>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Giao dịch gần đây</CardTitle>
            <Link href="/transactions" className="text-xs font-medium text-brand hover:underline">
              Xem tất cả
            </Link>
          </CardHeader>
          <CardContent className="space-y-0.5">
            {recentTx.length === 0 ? (
              <EmptyRow text="Chưa có giao dịch nào" />
            ) : (
              recentTx.map((tx) => <TransactionRow key={tx.id} tx={tx} />)
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>6 Chiếc lọ</CardTitle>
            <Link href="/jars" className="text-xs font-medium text-brand hover:underline">
              Quản lý lọ
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {jars.map((jar) => (
              <div key={jar.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Icon name={jar.icon} size={14} />
                    {jar.name}
                  </span>
                  <span className="text-muted">{formatMoney(jar.balance)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ngân sách cần chú ý</CardTitle>
            <Link href="/budgets" className="text-xs font-medium text-brand hover:underline">
              Xem tất cả
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {worstBudgets.length === 0 ? (
              <EmptyRow text="Chưa thiết lập ngân sách nào" />
            ) : (
              worstBudgets.map((b) => (
                <div key={b.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {b.category?.name ?? b.member?.name ?? b.jar?.name ?? "Ngân sách"}
                    </span>
                    <div className="flex items-center gap-2">
                      {b.status === "OVER" ? <Badge tone="danger">Vượt</Badge> : null}
                      {b.status === "DANGER" ? <Badge tone="warning">Sắp hết</Badge> : null}
                      <span className="text-muted">{Math.round(b.percent)}%</span>
                    </div>
                  </div>
                  <ProgressBar percent={b.percent} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
  icon,
  isPercent,
}: {
  label: string;
  value: number;
  tone: "success" | "danger" | "warning";
  icon: string;
  isPercent?: boolean;
}) {
  const toneClass =
    tone === "success" ? "text-success bg-success-soft" : tone === "danger" ? "text-danger bg-danger-soft" : "text-warning bg-warning-soft";
  return (
    <Card>
      <CardContent className="p-4">
        <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${toneClass}`}>
          <Icon name={icon} size={16} />
        </div>
        <p className="text-xs text-muted">{label}</p>
        <p className="mt-0.5 truncate text-lg font-bold sm:text-xl">
          {isPercent ? `${value.toFixed(1)}%` : formatMoney(value)}
        </p>
      </CardContent>
    </Card>
  );
}

function EmptyRow({ text }: { text: string }) {
  return <p className="py-6 text-center text-sm text-muted">{text}</p>;
}
