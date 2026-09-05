import "server-only";
import { prisma } from "./prisma";
import type { JarCode } from "./enums";
export { suggestJarAllocation } from "./jar-math";

export type ExpenseLine = {
  transactionId: string;
  date: Date;
  categoryId: string | null;
  jarId: string | null;
  amount: number;
  payerMemberId: string | null;
  beneficiaryMemberIds: string[];
  isShared: boolean;
  necessity: string | null;
};

/** Chuyển giao dịch chi tiêu thành các "dòng chi" phẳng — ưu tiên transaction_splits nếu có,
 *  đảm bảo báo cáo/ngân sách không tính trùng và phản ánh đúng khi 1 hóa đơn chia nhiều danh mục/lọ. */
export async function getExpenseLines(
  familyId: string,
  opts?: { from?: Date; to?: Date }
): Promise<ExpenseLine[]> {
  const transactions = await prisma.transaction.findMany({
    where: {
      familyId,
      type: "EXPENSE",
      isDeleted: false,
      ...(opts?.from || opts?.to
        ? { date: { gte: opts?.from, lte: opts?.to } }
        : {}),
    },
    include: { splits: true, beneficiaries: true },
  });

  const lines: ExpenseLine[] = [];
  for (const tx of transactions) {
    const beneficiaryMemberIds = tx.beneficiaries.map((b) => b.memberId);
    if (tx.splits.length > 0) {
      for (const split of tx.splits) {
        lines.push({
          transactionId: tx.id,
          date: tx.date,
          categoryId: split.categoryId,
          jarId: split.jarId,
          amount: split.amount,
          payerMemberId: tx.payerMemberId,
          beneficiaryMemberIds,
          isShared: tx.isShared,
          necessity: tx.necessity,
        });
      }
    } else {
      lines.push({
        transactionId: tx.id,
        date: tx.date,
        categoryId: tx.categoryId,
        jarId: tx.jarId,
        amount: tx.amount,
        payerMemberId: tx.payerMemberId,
        beneficiaryMemberIds,
        isShared: tx.isShared,
        necessity: tx.necessity,
      });
    }
  }
  return lines;
}

export type AccountWithBalance = Awaited<ReturnType<typeof getAccountBalances>>[number];

/** Số dư tài khoản = số dư đầu kỳ + thu − chi ± chuyển khoản (không tính giao dịch đã xóa mềm).
 *  Với thẻ tín dụng: balance sẽ âm khi có dư nợ — hiển thị dạng "Dư nợ" = -balance ở tầng UI. */
export async function getAccountBalances(familyId: string) {
  const [accounts, txs] = await Promise.all([
    prisma.account.findMany({ where: { familyId }, orderBy: { createdAt: "asc" } }),
    prisma.transaction.findMany({ where: { familyId, isDeleted: false } }),
  ]);

  const map = new Map<string, number>();
  for (const acc of accounts) map.set(acc.id, acc.openingBalance);

  for (const tx of txs) {
    if (tx.type === "INCOME" && tx.accountId) {
      map.set(tx.accountId, (map.get(tx.accountId) ?? 0) + tx.amount);
    } else if (tx.type === "EXPENSE" && tx.accountId) {
      map.set(tx.accountId, (map.get(tx.accountId) ?? 0) - tx.amount);
    } else if (tx.type === "ACCOUNT_TRANSFER") {
      if (tx.accountId) map.set(tx.accountId, (map.get(tx.accountId) ?? 0) - tx.amount);
      if (tx.toAccountId) map.set(tx.toAccountId, (map.get(tx.toAccountId) ?? 0) + tx.amount);
    } else if ((tx.type === "DEBT_BORROW" || tx.type === "LOAN_COLLECT") && tx.accountId) {
      // Đi vay hoặc thu hồi nợ cho vay: tăng tiền, không phải thu nhập.
      map.set(tx.accountId, (map.get(tx.accountId) ?? 0) + tx.amount);
    } else if ((tx.type === "DEBT_PRINCIPAL" || tx.type === "LOAN_OUT") && tx.accountId) {
      // Trả nợ gốc hoặc cho người khác vay: giảm tiền, không phải chi phí.
      map.set(tx.accountId, (map.get(tx.accountId) ?? 0) - tx.amount);
    }
  }

  return accounts.map((acc) => ({ ...acc, balance: map.get(acc.id) ?? acc.openingBalance }));
}

export type JarWithBalance = Awaited<ReturnType<typeof getJarBalances>>[number];

/** Số dư lọ = tổng đã phân bổ từ thu nhập + chuyển vào − chuyển ra − đã chi từ lọ đó. */
export async function getJarBalances(familyId: string) {
  const [jars, allocations, transfers, expenseLines] = await Promise.all([
    prisma.jar.findMany({ where: { familyId }, orderBy: { createdAt: "asc" } }),
    prisma.jarAllocation.findMany({ where: { jar: { familyId } } }),
    prisma.transaction.findMany({
      where: { familyId, type: "JAR_TRANSFER", isDeleted: false },
    }),
    getExpenseLines(familyId),
  ]);

  const map = new Map<string, number>();
  for (const jar of jars) map.set(jar.id, 0);
  for (const a of allocations) map.set(a.jarId, (map.get(a.jarId) ?? 0) + a.amount);
  for (const t of transfers) {
    if (t.jarId) map.set(t.jarId, (map.get(t.jarId) ?? 0) - t.amount);
    if (t.toJarId) map.set(t.toJarId, (map.get(t.toJarId) ?? 0) + t.amount);
  }
  for (const line of expenseLines) {
    if (line.jarId) map.set(line.jarId, (map.get(line.jarId) ?? 0) - line.amount);
  }

  const totalSpent = new Map<string, number>();
  for (const line of expenseLines) {
    if (line.jarId) totalSpent.set(line.jarId, (totalSpent.get(line.jarId) ?? 0) + line.amount);
  }

  return jars.map((jar) => ({
    ...jar,
    code: jar.code as JarCode,
    balance: map.get(jar.id) ?? 0,
    spent: totalSpent.get(jar.id) ?? 0,
  }));
}

export async function getBudgetProgress(familyId: string, month: number, year: number) {
  const budgets = await prisma.budget.findMany({
    where: { familyId, month, year },
    include: { category: true, member: true, jar: true },
    orderBy: { createdAt: "asc" },
  });

  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 0, 23, 59, 59, 999);
  const lines = await getExpenseLines(familyId, { from, to });

  const today = new Date();
  const daysInMonth = to.getDate();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
  const daysPassed = isCurrentMonth ? today.getDate() : daysInMonth;
  const daysLeft = isCurrentMonth ? Math.max(daysInMonth - daysPassed, 0) : 0;

  return budgets.map((b) => {
    let spent = 0;
    for (const line of lines) {
      if (b.scope === "CATEGORY" && b.categoryId && line.categoryId === b.categoryId) spent += line.amount;
      if (
        b.scope === "MEMBER" &&
        b.memberId &&
        (line.payerMemberId === b.memberId || line.beneficiaryMemberIds.includes(b.memberId))
      )
        spent += line.amount;
      if (b.scope === "JAR" && b.jarId && line.jarId === b.jarId) spent += line.amount;
    }
    const percent = b.amount > 0 ? (spent / b.amount) * 100 : 0;
    const avgPerDay = daysPassed > 0 ? spent / daysPassed : 0;
    const projected = isCurrentMonth ? avgPerDay * daysInMonth : spent;

    return {
      ...b,
      spent,
      remaining: b.amount - spent,
      percent,
      daysLeft,
      avgPerDay,
      projected,
      status: percent >= 100 ? "OVER" : percent >= 90 ? "DANGER" : percent >= 70 ? "WARNING" : "OK",
    } as const;
  });
}

export async function getMonthlySummary(familyId: string, month: number, year: number) {
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 0, 23, 59, 59, 999);

  const [incomeTx, expenseLines] = await Promise.all([
    prisma.transaction.findMany({
      where: { familyId, type: "INCOME", isDeleted: false, date: { gte: from, lte: to } },
    }),
    getExpenseLines(familyId, { from, to }),
  ]);

  const totalIncome = incomeTx.reduce((s, t) => s + t.amount, 0);
  const totalExpense = expenseLines.reduce((s, l) => s + l.amount, 0);

  return {
    totalIncome,
    totalExpense,
    net: totalIncome - totalExpense,
    savingsRate: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0,
  };
}

export async function getCategoryBreakdown(familyId: string, from: Date, to: Date) {
  const [lines, categories] = await Promise.all([
    getExpenseLines(familyId, { from, to }),
    prisma.category.findMany({ where: { familyId } }),
  ]);
  const catMap = new Map(categories.map((c) => [c.id, c]));
  const totals = new Map<string, number>();
  for (const line of lines) {
    const key = line.categoryId ?? "unclassified";
    totals.set(key, (totals.get(key) ?? 0) + line.amount);
  }
  return Array.from(totals.entries())
    .map(([categoryId, amount]) => ({
      categoryId,
      name: categoryId === "unclassified" ? "Chưa phân loại" : (catMap.get(categoryId)?.name ?? "Không rõ"),
      icon: catMap.get(categoryId)?.icon ?? "Wallet",
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export async function getJarBreakdown(familyId: string, from: Date, to: Date) {
  const [lines, jars] = await Promise.all([
    getExpenseLines(familyId, { from, to }),
    prisma.jar.findMany({ where: { familyId } }),
  ]);
  const totals = new Map<string, number>();
  for (const line of lines) {
    if (!line.jarId) continue;
    totals.set(line.jarId, (totals.get(line.jarId) ?? 0) + line.amount);
  }
  return jars.map((jar) => ({
    jarId: jar.id,
    name: jar.name,
    color: jar.color,
    percentage: jar.percentage,
    amount: totals.get(jar.id) ?? 0,
  }));
}

export async function getMemberBreakdown(familyId: string, from: Date, to: Date) {
  const [lines, members] = await Promise.all([
    getExpenseLines(familyId, { from, to }),
    prisma.familyMember.findMany({ where: { familyId, isActive: true } }),
  ]);
  const memberMap = new Map(members.map((m) => [m.id, m]));
  const totals = new Map<string, number>();
  for (const line of lines) {
    const key = line.payerMemberId ?? "unknown";
    totals.set(key, (totals.get(key) ?? 0) + line.amount);
  }
  return Array.from(totals.entries())
    .map(([memberId, amount]) => ({
      memberId,
      name: memberId === "unknown" ? "Không xác định" : (memberMap.get(memberId)?.name ?? "?"),
      color: memberMap.get(memberId)?.avatarColor ?? "#6b7280",
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export async function getMonthlyTrend(familyId: string, monthsBack = 6) {
  const now = new Date();
  const result: { month: number; year: number; label: string; income: number; expense: number }[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const summary = await getMonthlySummary(familyId, month, year);
    result.push({ month, year, label: `T${month}/${String(year).slice(2)}`, income: summary.totalIncome, expense: summary.totalExpense });
  }
  return result;
}
