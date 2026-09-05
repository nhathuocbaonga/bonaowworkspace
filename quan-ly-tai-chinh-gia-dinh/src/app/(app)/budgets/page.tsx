import Link from "next/link";
import { requireSession } from "@/lib/session";
import { getBudgetProgress } from "@/lib/finance";
import { getCategories, getFamilyMembers, getJars } from "@/lib/data";
import { BudgetsClient } from "@/components/budgets/budgets-client";
import { Icon } from "@/components/icon";
import { monthLabel } from "@/lib/format";

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const now = new Date();
  const month = Number(params.month) || now.getMonth() + 1;
  const year = Number(params.year) || now.getFullYear();

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  const [budgets, categories, members, jars] = await Promise.all([
    getBudgetProgress(session.familyId, month, year),
    getCategories(session.familyId, "EXPENSE"),
    getFamilyMembers(session.familyId),
    getJars(session.familyId),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Ngân sách</h1>
          <p className="text-sm text-muted">Theo dõi chi tiêu theo tháng</p>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-border px-1 py-1">
          <Link
            href={`/budgets?month=${prevMonth}&year=${prevYear}`}
            className="rounded-lg p-1.5 hover:bg-black/5 dark:hover:bg-white/10"
          >
            <Icon name="ChevronLeft" size={16} />
          </Link>
          <span className="min-w-28 text-center text-sm font-medium">{monthLabel(month, year)}</span>
          <Link
            href={`/budgets?month=${nextMonth}&year=${nextYear}`}
            className="rounded-lg p-1.5 hover:bg-black/5 dark:hover:bg-white/10"
          >
            <Icon name="ChevronRight" size={16} />
          </Link>
        </div>
      </div>

      <BudgetsClient
        budgets={budgets}
        month={month}
        year={year}
        categories={categories}
        members={members}
        jars={jars}
      />
    </div>
  );
}
