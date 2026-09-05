import Link from "next/link";
import { requireSession } from "@/lib/session";
import {
  getMonthlyTrend,
  getCategoryBreakdown,
  getJarBreakdown,
  getMemberBreakdown,
  getMonthlySummary,
} from "@/lib/finance";
import { generateInsights, getTopExpenses } from "@/lib/insights";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { formatMoney, formatDate, monthLabel } from "@/lib/format";
import { TrendChart, CategoryPieChart, HorizontalBarChart } from "@/components/reports/reports-charts";
import { PrintButton } from "@/components/reports/print-button";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const now = new Date();
  const month = Number(params.month) || now.getMonth() + 1;
  const year = Number(params.year) || now.getFullYear();
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 0, 23, 59, 59, 999);

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  const [trend, categoryBreakdown, jarBreakdown, memberBreakdown, summary, insights, topExpenses] = await Promise.all([
    getMonthlyTrend(session.familyId, 6),
    getCategoryBreakdown(session.familyId, from, to),
    getJarBreakdown(session.familyId, from, to),
    getMemberBreakdown(session.familyId, from, to),
    getMonthlySummary(session.familyId, month, year),
    generateInsights(session.familyId, month, year),
    getTopExpenses(session.familyId, month, year, 3),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Báo cáo & Phân tích</h1>
          <p className="text-sm text-muted">Dữ liệu {monthLabel(month, year)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <div className="flex items-center gap-1 rounded-xl border border-border px-1 py-1">
            <Link href={`/reports?month=${prevMonth}&year=${prevYear}`} className="rounded-lg p-1.5 hover:bg-black/5 dark:hover:bg-white/10">
              <Icon name="ChevronLeft" size={16} />
            </Link>
            <span className="min-w-28 text-center text-sm font-medium">{monthLabel(month, year)}</span>
            <Link href={`/reports?month=${nextMonth}&year=${nextYear}`} className="rounded-lg p-1.5 hover:bg-black/5 dark:hover:bg-white/10">
              <Icon name="ChevronRight" size={16} />
            </Link>
          </div>
          <a href={`/api/export/transactions?format=xlsx&from=${from.toISOString().slice(0, 10)}&to=${to.toISOString().slice(0, 10)}`}>
            <Button size="sm" variant="outline">
              <Icon name="Receipt" size={14} /> Xuất Excel
            </Button>
          </a>
          <PrintButton />
        </div>
      </div>

      {insights.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Nhận xét nhanh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {insights.map((ins, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <Icon
                  name={ins.tone === "danger" ? "AlertTriangle" : ins.tone === "warning" ? "AlertTriangle" : ins.tone === "success" ? "CheckCircle2" : "BarChart3"}
                  size={15}
                  className={`mt-0.5 shrink-0 ${
                    ins.tone === "danger" ? "text-danger" : ins.tone === "warning" ? "text-warning" : ins.tone === "success" ? "text-success" : "text-brand"
                  }`}
                />
                <span>{ins.text}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted">Tổng thu</p>
            <p className="mt-1 text-lg font-bold text-success">{formatMoney(summary.totalIncome)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted">Tổng chi</p>
            <p className="mt-1 text-lg font-bold text-danger">{formatMoney(summary.totalExpense)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted">Dòng tiền ròng</p>
            <p className={`mt-1 text-lg font-bold ${summary.net >= 0 ? "text-success" : "text-danger"}`}>
              {formatMoney(summary.net)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Xu hướng thu — chi 6 tháng gần nhất</CardTitle>
        </CardHeader>
        <CardContent>
          <TrendChart data={trend} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Chi tiêu theo danh mục</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={categoryBreakdown} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Chi tiêu theo 6 chiếc lọ</CardTitle>
          </CardHeader>
          <CardContent>
            <HorizontalBarChart data={jarBreakdown} colorKey />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Chi tiêu theo thành viên</CardTitle>
          </CardHeader>
          <CardContent>
            <HorizontalBarChart data={memberBreakdown} colorKey />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>3 khoản chi lớn nhất tháng này</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topExpenses.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">Chưa có dữ liệu</p>
            ) : (
              topExpenses.map((e, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{e.categoryName}</p>
                    <p className="text-xs text-muted">{formatDate(e.date)}</p>
                  </div>
                  <p className="font-semibold text-danger">{formatMoney(e.amount)}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
