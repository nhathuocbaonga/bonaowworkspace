import "server-only";
import { prisma } from "./prisma";
import { getExpenseLines } from "./finance";

export async function getDebtsWithBalance(familyId: string) {
  const debts = await prisma.debt.findMany({
    where: { familyId },
    include: { borrower: true, responsible: true },
    orderBy: { createdAt: "desc" },
  });
  const payments = await prisma.transaction.findMany({
    where: { familyId, debtId: { not: null }, isDeleted: false },
  });

  return debts.map((debt) => {
    const linked = payments.filter((p) => p.debtId === debt.id);
    const principalPaid = linked
      .filter((p) => p.type === "DEBT_PRINCIPAL")
      .reduce((s, p) => s + p.amount, 0);
    const interestPaid = linked
      .filter((p) => p.type === "EXPENSE")
      .reduce((s, p) => s + p.amount, 0);
    const remainingBalance = Math.max(0, debt.principalAmount - principalPaid);

    return {
      ...debt,
      principalPaid,
      interestPaid,
      remainingBalance,
      isOverdue: !!debt.nextPaymentDate && debt.nextPaymentDate < new Date() && remainingBalance > 0,
      isDueSoon:
        !!debt.nextPaymentDate &&
        debt.nextPaymentDate >= new Date() &&
        debt.nextPaymentDate.getTime() - Date.now() <= 7 * 24 * 60 * 60 * 1000 &&
        remainingBalance > 0,
    };
  });
}

export async function getReceivablesWithBalance(familyId: string) {
  const receivables = await prisma.receivable.findMany({
    where: { familyId },
    include: { lentBy: true },
    orderBy: { createdAt: "desc" },
  });
  const collections = await prisma.transaction.findMany({
    where: { familyId, receivableId: { not: null }, type: "LOAN_COLLECT", isDeleted: false },
  });

  return receivables.map((r) => {
    const collected = collections
      .filter((c) => c.receivableId === r.id)
      .reduce((s, c) => s + c.amount, 0);
    const outstanding = Math.max(0, r.amount - collected);
    return {
      ...r,
      collected,
      outstanding,
      isOverdue: !!r.dueDate && r.dueDate < new Date() && outstanding > 0,
      isDueSoon:
        !!r.dueDate &&
        r.dueDate >= new Date() &&
        r.dueDate.getTime() - Date.now() <= 7 * 24 * 60 * 60 * 1000 &&
        outstanding > 0,
    };
  });
}

export async function getGoalsWithProgress(familyId: string) {
  const goals = await prisma.savingsGoal.findMany({
    where: { familyId },
    include: { owner: true },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  return goals.map((goal) => {
    const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
    const percent = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;

    let monthsLeft: number | null = null;
    let requiredMonthly = 0;
    let isOnTrack = true;
    if (goal.targetDate) {
      const msLeft = goal.targetDate.getTime() - now.getTime();
      monthsLeft = Math.max(1, Math.ceil(msLeft / (1000 * 60 * 60 * 24 * 30)));
      requiredMonthly = remaining / monthsLeft;

      const totalMonths = Math.max(
        1,
        Math.ceil((goal.targetDate.getTime() - goal.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
      );
      const monthsElapsed = Math.max(
        0,
        Math.ceil((now.getTime() - goal.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
      );
      const expectedByNow = (goal.targetAmount / totalMonths) * monthsElapsed;
      isOnTrack = goal.currentAmount >= expectedByNow * 0.9; // cho phép lệch nhẹ 10%
    }

    return {
      ...goal,
      remaining,
      percent,
      monthsLeft,
      requiredMonthly,
      isOnTrack,
      isCompleted: goal.currentAmount >= goal.targetAmount,
    };
  });
}

/** Quỹ dự phòng: chi phí thiết yếu trung bình/tháng (3 tháng gần nhất, mức độ Bắt buộc)
 *  và hiện đủ sống bao nhiêu tháng dựa trên mục tiêu được đánh dấu isEmergencyFund. */
export async function getEmergencyFundStatus(familyId: string) {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const lines = await getExpenseLines(familyId, { from, to: now });
  const essentialTotal = lines
    .filter((l) => l.necessity === "BAT_BUOC")
    .reduce((s, l) => s + l.amount, 0);
  const avgMonthlyEssential = essentialTotal / 3;

  const fund = await prisma.savingsGoal.findFirst({ where: { familyId, isEmergencyFund: true } });
  const currentAmount = fund?.currentAmount ?? 0;
  const monthsCovered = avgMonthlyEssential > 0 ? currentAmount / avgMonthlyEssential : 0;

  return {
    fund,
    avgMonthlyEssential,
    currentAmount,
    monthsCovered,
    target3: avgMonthlyEssential * 3,
    target6: avgMonthlyEssential * 6,
    target12: avgMonthlyEssential * 12,
  };
}
