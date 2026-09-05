"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { DEBT_SCHEDULES } from "@/lib/enums";
import { writeAuditLog } from "@/lib/audit";
import { formatMoney } from "@/lib/format";

function revalidateDebtPages() {
  revalidatePath("/debts");
  revalidatePath("/dashboard");
  revalidatePath("/accounts");
  revalidatePath("/transactions");
}

const createDebtSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên khoản nợ"),
  lender: z.string().min(1, "Vui lòng nhập tên chủ nợ / ngân hàng"),
  borrowerMemberId: z.string().optional(),
  responsibleMemberId: z.string().optional(),
  principalAmount: z.number().positive("Số tiền vay phải lớn hơn 0"),
  interestRate: z.number().optional(),
  startDate: z.string().min(1),
  dueDate: z.string().optional(),
  paymentSchedule: z.enum(DEBT_SCHEDULES),
  installmentAmount: z.number().optional(),
  nextPaymentDate: z.string().optional(),
  collateral: z.string().optional(),
  purpose: z.string().optional(),
  note: z.string().optional(),
  receiveIntoAccountId: z.string().optional(), // nếu có -> ghi nhận đã nhận tiền vay
});
export type CreateDebtInput = z.infer<typeof createDebtSchema>;

export async function createDebtAction(input: CreateDebtInput) {
  const session = await requireSession();
  const parsed = createDebtSchema.parse(input);

  const debt = await prisma.debt.create({
    data: {
      familyId: session.familyId,
      name: parsed.name,
      lender: parsed.lender,
      borrowerMemberId: parsed.borrowerMemberId || null,
      responsibleMemberId: parsed.responsibleMemberId || null,
      principalAmount: parsed.principalAmount,
      interestRate: parsed.interestRate,
      startDate: new Date(parsed.startDate),
      dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
      paymentSchedule: parsed.paymentSchedule,
      installmentAmount: parsed.installmentAmount,
      nextPaymentDate: parsed.nextPaymentDate ? new Date(parsed.nextPaymentDate) : null,
      collateral: parsed.collateral,
      purpose: parsed.purpose,
      note: parsed.note,
    },
  });

  if (parsed.receiveIntoAccountId) {
    await prisma.transaction.create({
      data: {
        familyId: session.familyId,
        type: "DEBT_BORROW",
        amount: parsed.principalAmount,
        date: new Date(parsed.startDate),
        accountId: parsed.receiveIntoAccountId,
        createdByMemberId: session.memberId,
        debtId: debt.id,
        note: `Nhận tiền vay: ${parsed.name}`,
      },
    });
  }

  await writeAuditLog({
    familyId: session.familyId,
    memberId: session.memberId,
    entityType: "DEBT",
    entityId: debt.id,
    action: "CREATE",
    summary: `Tạo khoản nợ "${parsed.name}" — ${formatMoney(parsed.principalAmount)}`,
  });

  revalidateDebtPages();
}

const recordPaymentSchema = z.object({
  debtId: z.string().min(1),
  principalAmount: z.number().min(0),
  interestAmount: z.number().min(0),
  accountId: z.string().min(1),
  date: z.string().min(1),
  note: z.string().optional(),
});
export type RecordDebtPaymentInput = z.infer<typeof recordPaymentSchema>;

export async function recordDebtPaymentAction(input: RecordDebtPaymentInput) {
  const session = await requireSession();
  const parsed = recordPaymentSchema.parse(input);

  if (parsed.principalAmount <= 0 && parsed.interestAmount <= 0) {
    throw new Error("Vui lòng nhập số tiền trả gốc hoặc lãi");
  }

  const debt = await prisma.debt.findFirst({ where: { id: parsed.debtId, familyId: session.familyId } });
  if (!debt) throw new Error("Không tìm thấy khoản nợ");

  const interestCategory = await prisma.category.findFirst({
    where: { familyId: session.familyId, name: "Trả lãi ngân hàng" },
  });

  if (parsed.principalAmount > 0) {
    await prisma.transaction.create({
      data: {
        familyId: session.familyId,
        type: "DEBT_PRINCIPAL",
        amount: parsed.principalAmount,
        date: new Date(parsed.date),
        accountId: parsed.accountId,
        createdByMemberId: session.memberId,
        debtId: debt.id,
        note: parsed.note || `Trả nợ gốc: ${debt.name}`,
      },
    });
  }

  if (parsed.interestAmount > 0) {
    await prisma.transaction.create({
      data: {
        familyId: session.familyId,
        type: "EXPENSE",
        amount: parsed.interestAmount,
        date: new Date(parsed.date),
        accountId: parsed.accountId,
        categoryId: interestCategory?.id,
        createdByMemberId: session.memberId,
        payerMemberId: session.memberId,
        necessity: "BAT_BUOC",
        debtId: debt.id,
        note: parsed.note || `Trả lãi vay: ${debt.name}`,
      },
    });
  }

  // Cập nhật trạng thái nếu đã trả hết gốc
  const paidSoFar = await prisma.transaction.aggregate({
    where: { familyId: session.familyId, debtId: debt.id, type: "DEBT_PRINCIPAL", isDeleted: false },
    _sum: { amount: true },
  });
  const totalPaid = paidSoFar._sum.amount ?? 0;
  if (totalPaid >= debt.principalAmount) {
    await prisma.debt.update({ where: { id: debt.id }, data: { status: "PAID_OFF" } });
  }

  await writeAuditLog({
    familyId: session.familyId,
    memberId: session.memberId,
    entityType: "DEBT",
    entityId: debt.id,
    action: "UPDATE",
    summary: `Trả nợ "${debt.name}": gốc ${formatMoney(parsed.principalAmount)}, lãi ${formatMoney(parsed.interestAmount)}`,
  });

  revalidateDebtPages();
}

const updateDebtSchema = createDebtSchema.omit({ receiveIntoAccountId: true }).partial().extend({
  debtId: z.string().min(1),
});
export type UpdateDebtInput = z.infer<typeof updateDebtSchema>;

export async function updateDebtAction(input: UpdateDebtInput) {
  const session = await requireSession();
  const parsed = updateDebtSchema.parse(input);
  const { debtId, startDate, dueDate, nextPaymentDate, ...rest } = parsed;

  await prisma.debt.update({
    where: { id: debtId, familyId: session.familyId },
    data: {
      ...rest,
      ...(startDate ? { startDate: new Date(startDate) } : {}),
      ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
      ...(nextPaymentDate ? { nextPaymentDate: new Date(nextPaymentDate) } : {}),
    },
  });

  revalidateDebtPages();
}

export async function deleteDebtAction(debtId: string) {
  const session = await requireSession();
  const linkedCount = await prisma.transaction.count({ where: { debtId, isDeleted: false } });
  if (linkedCount > 0) {
    throw new Error("Không thể xóa khoản nợ đã có lịch sử thanh toán. Có thể đánh dấu Đã trả hết.");
  }
  const debt = await prisma.debt.delete({ where: { id: debtId, familyId: session.familyId } });

  await writeAuditLog({
    familyId: session.familyId,
    memberId: session.memberId,
    entityType: "DEBT",
    entityId: debtId,
    action: "DELETE",
    summary: `Xóa khoản nợ "${debt.name}"`,
  });

  revalidateDebtPages();
}
