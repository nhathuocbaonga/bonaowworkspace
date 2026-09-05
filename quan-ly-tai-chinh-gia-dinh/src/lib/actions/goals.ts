"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { writeAuditLog } from "@/lib/audit";
import { formatMoney } from "@/lib/format";

function revalidateGoalPages() {
  revalidatePath("/goals");
  revalidatePath("/emergency-fund");
  revalidatePath("/dashboard");
}

const goalSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên mục tiêu"),
  ownerMemberId: z.string().optional(),
  targetAmount: z.number().positive("Số tiền mục tiêu phải lớn hơn 0"),
  currentAmount: z.number().min(0).default(0),
  startDate: z.string().optional(),
  targetDate: z.string().optional(),
  note: z.string().optional(),
  isEmergencyFund: z.boolean().default(false),
});
export type GoalInput = z.infer<typeof goalSchema>;

export async function createGoalAction(input: GoalInput) {
  const session = await requireSession();
  const parsed = goalSchema.parse(input);

  if (parsed.isEmergencyFund) {
    const existing = await prisma.savingsGoal.findFirst({
      where: { familyId: session.familyId, isEmergencyFund: true },
    });
    if (existing) throw new Error("Gia đình đã có Quỹ dự phòng — chỉ có thể có một quỹ dự phòng");
  }

  const goal = await prisma.savingsGoal.create({
    data: {
      familyId: session.familyId,
      name: parsed.name,
      ownerMemberId: parsed.ownerMemberId || null,
      targetAmount: parsed.targetAmount,
      currentAmount: parsed.currentAmount,
      startDate: parsed.startDate ? new Date(parsed.startDate) : new Date(),
      targetDate: parsed.targetDate ? new Date(parsed.targetDate) : null,
      note: parsed.note,
      isEmergencyFund: parsed.isEmergencyFund,
    },
  });

  await writeAuditLog({
    familyId: session.familyId,
    memberId: session.memberId,
    entityType: "GOAL",
    entityId: goal.id,
    action: "CREATE",
    summary: `Tạo mục tiêu "${parsed.name}" — ${formatMoney(parsed.targetAmount)}`,
  });

  revalidateGoalPages();
}

const updateGoalSchema = goalSchema.partial().extend({ goalId: z.string().min(1) });
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;

export async function updateGoalAction(input: UpdateGoalInput) {
  const session = await requireSession();
  const parsed = updateGoalSchema.parse(input);
  const { goalId, startDate, targetDate, ...rest } = parsed;

  await prisma.savingsGoal.update({
    where: { id: goalId, familyId: session.familyId },
    data: {
      ...rest,
      ...(startDate ? { startDate: new Date(startDate) } : {}),
      ...(targetDate ? { targetDate: new Date(targetDate) } : {}),
    },
  });

  revalidateGoalPages();
}

const contributeSchema = z.object({
  goalId: z.string().min(1),
  amount: z.number(),
  note: z.string().optional(),
});
export type ContributeInput = z.infer<typeof contributeSchema>;

export async function contributeToGoalAction(input: ContributeInput) {
  const session = await requireSession();
  const parsed = contributeSchema.parse(input);
  if (parsed.amount === 0) throw new Error("Vui lòng nhập số tiền khác 0");

  const goal = await prisma.savingsGoal.findFirst({ where: { id: parsed.goalId, familyId: session.familyId } });
  if (!goal) throw new Error("Không tìm thấy mục tiêu");

  const newAmount = Math.max(0, goal.currentAmount + parsed.amount);

  await prisma.$transaction([
    prisma.goalContribution.create({
      data: { goalId: goal.id, amount: parsed.amount, note: parsed.note },
    }),
    prisma.savingsGoal.update({
      where: { id: goal.id },
      data: {
        currentAmount: newAmount,
        status: newAmount >= goal.targetAmount ? "COMPLETED" : goal.status === "COMPLETED" ? "ACTIVE" : goal.status,
      },
    }),
  ]);

  await writeAuditLog({
    familyId: session.familyId,
    memberId: session.memberId,
    entityType: "GOAL",
    entityId: goal.id,
    action: "UPDATE",
    summary: `${parsed.amount > 0 ? "Nạp thêm" : "Rút bớt"} ${formatMoney(Math.abs(parsed.amount))} cho mục tiêu "${goal.name}"`,
  });

  revalidateGoalPages();
}

export async function deleteGoalAction(goalId: string) {
  const session = await requireSession();
  const goal = await prisma.savingsGoal.delete({ where: { id: goalId, familyId: session.familyId } });

  await writeAuditLog({
    familyId: session.familyId,
    memberId: session.memberId,
    entityType: "GOAL",
    entityId: goalId,
    action: "DELETE",
    summary: `Xóa mục tiêu "${goal.name}"`,
  });

  revalidateGoalPages();
}
