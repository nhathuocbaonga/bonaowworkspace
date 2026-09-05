"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { RECURRING_FREQUENCIES } from "@/lib/enums";
import { addByFrequency } from "@/lib/recurring-date";
import { writeAuditLog } from "@/lib/audit";
import { formatMoney } from "@/lib/format";

function revalidateRecurringPages() {
  revalidatePath("/recurring");
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
}

const ruleSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên giao dịch định kỳ"),
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.number().positive("Số tiền phải lớn hơn 0"),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  accountId: z.string().min(1, "Vui lòng chọn tài khoản"),
  jarId: z.string().optional(),
  payerMemberId: z.string().optional(),
  isShared: z.boolean().default(false),
  necessity: z.string().optional(),
  frequency: z.enum(RECURRING_FREQUENCIES),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  note: z.string().optional(),
});
export type RecurringRuleInput = z.infer<typeof ruleSchema>;

export async function createRecurringRuleAction(input: RecurringRuleInput) {
  const session = await requireSession();
  const parsed = ruleSchema.parse(input);

  const rule = await prisma.recurringRule.create({
    data: {
      familyId: session.familyId,
      name: parsed.name,
      type: parsed.type,
      amount: parsed.amount,
      categoryId: parsed.categoryId,
      accountId: parsed.accountId,
      jarId: parsed.jarId || null,
      payerMemberId: parsed.payerMemberId || null,
      isShared: parsed.isShared,
      necessity: parsed.necessity || null,
      frequency: parsed.frequency,
      startDate: new Date(parsed.startDate),
      endDate: parsed.endDate ? new Date(parsed.endDate) : null,
      nextRunDate: new Date(parsed.startDate),
      note: parsed.note,
    },
  });

  await writeAuditLog({
    familyId: session.familyId,
    memberId: session.memberId,
    entityType: "RECURRING_RULE",
    entityId: rule.id,
    action: "CREATE",
    summary: `Tạo giao dịch định kỳ "${parsed.name}" — ${formatMoney(parsed.amount)}`,
  });

  revalidateRecurringPages();
}

export async function toggleRecurringRuleActiveAction(ruleId: string, isActive: boolean) {
  const session = await requireSession();
  await prisma.recurringRule.update({
    where: { id: ruleId, familyId: session.familyId },
    data: { isActive },
  });
  revalidateRecurringPages();
}

export async function deleteRecurringRuleAction(ruleId: string) {
  const session = await requireSession();
  await prisma.recurringRule.delete({ where: { id: ruleId, familyId: session.familyId } });
  revalidateRecurringPages();
}

export async function confirmRecurringPaymentAction(ruleId: string) {
  const session = await requireSession();
  const rule = await prisma.recurringRule.findFirst({ where: { id: ruleId, familyId: session.familyId } });
  if (!rule) throw new Error("Không tìm thấy giao dịch định kỳ");

  const tx = await prisma.transaction.create({
    data: {
      familyId: session.familyId,
      type: rule.type,
      amount: rule.amount,
      date: rule.nextRunDate,
      categoryId: rule.categoryId,
      accountId: rule.accountId,
      jarId: rule.type === "EXPENSE" ? rule.jarId : null,
      createdByMemberId: session.memberId,
      payerMemberId: rule.payerMemberId,
      isShared: rule.isShared,
      necessity: rule.necessity,
      isFixed: true,
      recurringRuleId: rule.id,
      note: rule.note || `Định kỳ: ${rule.name}`,
    },
  });

  await prisma.recurringRule.update({
    where: { id: rule.id },
    data: {
      lastRunDate: rule.nextRunDate,
      nextRunDate: addByFrequency(rule.nextRunDate, rule.frequency as Parameters<typeof addByFrequency>[1]),
    },
  });

  await writeAuditLog({
    familyId: session.familyId,
    memberId: session.memberId,
    entityType: "TRANSACTION",
    entityId: tx.id,
    action: "CREATE",
    summary: `Xác nhận thanh toán định kỳ "${rule.name}" — ${formatMoney(rule.amount)}`,
  });

  revalidateRecurringPages();
}

export async function skipRecurringPaymentAction(ruleId: string) {
  const session = await requireSession();
  const rule = await prisma.recurringRule.findFirst({ where: { id: ruleId, familyId: session.familyId } });
  if (!rule) throw new Error("Không tìm thấy giao dịch định kỳ");

  await prisma.recurringRule.update({
    where: { id: rule.id },
    data: { nextRunDate: addByFrequency(rule.nextRunDate, rule.frequency as Parameters<typeof addByFrequency>[1]) },
  });

  revalidateRecurringPages();
}
