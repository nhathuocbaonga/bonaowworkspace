import "server-only";
import { prisma } from "./prisma";
import { getExpenseLines, getMonthlySummary, getBudgetProgress, getJarBalances, getCategoryBreakdown } from "./finance";
import { formatMoney } from "./format";

export type Insight = { text: string; tone: "success" | "warning" | "danger" | "info" };

/** Sinh nhận xét bằng tiếng Việt dựa hoàn toàn trên dữ liệu thật của gia đình trong tháng —
 *  không suy diễn, không cam kết đầu tư/lợi nhuận. */
export async function generateInsights(familyId: string, month: number, year: number): Promise<Insight[]> {
  const insights: Insight[] = [];

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;

  const [thisMonth, lastMonth, budgets, jars, categoryBreakdown] = await Promise.all([
    getMonthlySummary(familyId, month, year),
    getMonthlySummary(familyId, prevMonth, prevYear),
    getBudgetProgress(familyId, month, year),
    getJarBalances(familyId),
    getCategoryBreakdown(
      familyId,
      new Date(year, month - 1, 1),
      new Date(year, month, 0, 23, 59, 59, 999)
    ),
  ]);

  if (lastMonth.totalExpense > 0) {
    const change = ((thisMonth.totalExpense - lastMonth.totalExpense) / lastMonth.totalExpense) * 100;
    if (Math.abs(change) >= 5) {
      insights.push({
        text: `Chi tiêu tháng này ${change > 0 ? "tăng" : "giảm"} ${Math.abs(change).toFixed(0)}% so với tháng trước.`,
        tone: change > 15 ? "warning" : "info",
      });
    }
  }

  for (const b of budgets) {
    const label = b.category?.name ?? b.member?.name ?? b.jar?.name ?? "Ngân sách";
    if (b.status === "OVER") {
      insights.push({
        text: `${label} đã vượt ngân sách ${formatMoney(b.spent - b.amount)}.`,
        tone: "danger",
      });
    } else if (b.status === "DANGER") {
      insights.push({ text: `${label} đã sử dụng ${Math.round(b.percent)}% ngân sách tháng này.`, tone: "warning" });
    }
  }

  for (const jar of jars) {
    const allocated = jar.balance + jar.spent;
    if (allocated > 0) {
      const percent = (jar.spent / allocated) * 100;
      if (percent >= 95) {
        insights.push({ text: `Lọ "${jar.name}" đã sử dụng ${Math.round(percent)}%.`, tone: "warning" });
      }
    }
    if (jar.balance < 0) {
      insights.push({ text: `Lọ "${jar.name}" đang âm ${formatMoney(-jar.balance)}.`, tone: "danger" });
    }
  }

  if (thisMonth.totalIncome > 0) {
    if (thisMonth.savingsRate < 20) {
      insights.push({
        text: `Tỷ lệ tiết kiệm tháng này chỉ đạt ${thisMonth.savingsRate.toFixed(0)}%, thấp hơn mục tiêu tham khảo 20%.`,
        tone: "warning",
      });
    } else {
      insights.push({
        text: `Tỷ lệ tiết kiệm tháng này đạt ${thisMonth.savingsRate.toFixed(0)}%, một kết quả tốt.`,
        tone: "success",
      });
    }
  }

  if (categoryBreakdown.length > 0 && categoryBreakdown[0].amount > 0) {
    insights.push({
      text: `Gia đình đang chi nhiều nhất cho nhóm "${categoryBreakdown[0].name}" (${formatMoney(categoryBreakdown[0].amount)}).`,
      tone: "info",
    });
  }

  const lines = await getExpenseLines(familyId, {
    from: new Date(year, month - 1, 1),
    to: new Date(year, month, 0, 23, 59, 59, 999),
  });
  const cuttable = lines
    .filter((l) => l.necessity === "CO_THE_CAT_GIAM" || l.necessity === "KHONG_CAN_THIET")
    .reduce((s, l) => s + l.amount, 0);
  if (cuttable > 0) {
    insights.push({
      text: `Chi phí được đánh giá "có thể cắt giảm" hoặc "không cần thiết" trong tháng là ${formatMoney(cuttable)}.`,
      tone: "info",
    });
  }

  return insights.slice(0, 8);
}

export async function getTopExpenses(familyId: string, month: number, year: number, limit = 3) {
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 0, 23, 59, 59, 999);
  const lines = await getExpenseLines(familyId, { from, to });
  const categories = await prisma.category.findMany({ where: { familyId } });
  const catMap = new Map(categories.map((c) => [c.id, c.name]));

  return [...lines]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit)
    .map((l) => ({
      amount: l.amount,
      categoryName: l.categoryId ? (catMap.get(l.categoryId) ?? "—") : "—",
      date: l.date,
    }));
}
