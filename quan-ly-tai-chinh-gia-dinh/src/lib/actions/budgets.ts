"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { BUDGET_SCOPES } from "@/lib/enums";

const budgetSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2000),
  scope: z.enum(BUDGET_SCOPES),
  categoryId: z.string().optional(),
  memberId: z.string().optional(),
  jarId: z.string().optional(),
  amount: z.number().positive("Số tiền ngân sách phải lớn hơn 0"),
});
export type BudgetInput = z.infer<typeof budgetSchema>;

export async function createBudgetAction(input: BudgetInput) {
  const session = await requireSession();
  const parsed = budgetSchema.parse(input);

  if (parsed.scope === "CATEGORY" && !parsed.categoryId) throw new Error("Vui lòng chọn danh mục");
  if (parsed.scope === "MEMBER" && !parsed.memberId) throw new Error("Vui lòng chọn thành viên");
  if (parsed.scope === "JAR" && !parsed.jarId) throw new Error("Vui lòng chọn lọ");

  await prisma.budget.create({
    data: {
      familyId: session.familyId,
      month: parsed.month,
      year: parsed.year,
      scope: parsed.scope,
      categoryId: parsed.scope === "CATEGORY" ? parsed.categoryId : null,
      memberId: parsed.scope === "MEMBER" ? parsed.memberId : null,
      jarId: parsed.scope === "JAR" ? parsed.jarId : null,
      amount: parsed.amount,
    },
  });

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
}

export async function deleteBudgetAction(id: string) {
  const session = await requireSession();
  await prisma.budget.delete({ where: { id, familyId: session.familyId } });
  revalidatePath("/budgets");
  revalidatePath("/dashboard");
}

export async function copyBudgetsFromPreviousMonthAction(month: number, year: number) {
  const session = await requireSession();
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;

  const prevBudgets = await prisma.budget.findMany({
    where: { familyId: session.familyId, month: prevMonth, year: prevYear },
  });

  const existing = await prisma.budget.findMany({
    where: { familyId: session.familyId, month, year },
  });
  const existingKeys = new Set(
    existing.map((b) => `${b.scope}-${b.categoryId}-${b.memberId}-${b.jarId}`)
  );

  const toCreate = prevBudgets.filter(
    (b) => !existingKeys.has(`${b.scope}-${b.categoryId}-${b.memberId}-${b.jarId}`)
  );

  if (toCreate.length > 0) {
    await prisma.budget.createMany({
      data: toCreate.map((b) => ({
        familyId: session.familyId,
        month,
        year,
        scope: b.scope,
        categoryId: b.categoryId,
        memberId: b.memberId,
        jarId: b.jarId,
        amount: b.amount,
      })),
    });
  }

  revalidatePath("/budgets");
}
