"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { writeAuditLog } from "@/lib/audit";
import { formatMoney } from "@/lib/format";

function revalidateAllMoneyPages() {
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/jars");
  revalidatePath("/budgets");
  revalidatePath("/accounts");
  revalidatePath("/reports");
}

const splitSchema = z.object({
  categoryId: z.string().min(1),
  jarId: z.string().min(1).nullable().optional(),
  amount: z.number().positive(),
  note: z.string().optional(),
});

const createExpenseSchema = z.object({
  amount: z.number().positive("Số tiền phải lớn hơn 0"),
  date: z.string().min(1),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  accountId: z.string().min(1, "Vui lòng chọn tài khoản thanh toán"),
  jarId: z.string().min(1, "Vui lòng chọn lọ"),
  payerMemberId: z.string().min(1, "Vui lòng chọn người chi"),
  beneficiaryMemberIds: z.array(z.string()).default([]),
  isShared: z.boolean().default(false),
  paymentMethod: z.string().default("TIEN_MAT"),
  necessity: z.string().nullable().optional(),
  note: z.string().optional(),
  isFixed: z.boolean().default(false),
  location: z.string().optional(),
  splits: z.array(splitSchema).optional(),
});
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

export async function createExpenseAction(input: CreateExpenseInput) {
  const session = await requireSession();
  const parsed = createExpenseSchema.parse(input);
  const hasSplits = (parsed.splits?.length ?? 0) > 0;

  if (hasSplits) {
    const sum = parsed.splits!.reduce((s, x) => s + x.amount, 0);
    if (Math.abs(sum - parsed.amount) > 1) {
      throw new Error(
        `Tổng các khoản chia nhỏ (${sum.toLocaleString("vi-VN")} đ) phải khớp với số tiền giao dịch (${parsed.amount.toLocaleString("vi-VN")} đ)`
      );
    }
  }

  const tx = await prisma.transaction.create({
    data: {
      familyId: session.familyId,
      type: "EXPENSE",
      amount: parsed.amount,
      date: new Date(parsed.date),
      categoryId: hasSplits ? null : parsed.categoryId,
      accountId: parsed.accountId,
      jarId: hasSplits ? null : parsed.jarId,
      createdByMemberId: session.memberId,
      payerMemberId: parsed.payerMemberId,
      isShared: parsed.isShared,
      paymentMethod: parsed.paymentMethod,
      necessity: parsed.necessity || null,
      note: parsed.note || null,
      isFixed: parsed.isFixed,
      location: parsed.location || null,
      beneficiaries: { create: parsed.beneficiaryMemberIds.map((id) => ({ memberId: id })) },
      splits: hasSplits ? { create: parsed.splits } : undefined,
    },
    include: { category: true },
  });

  await writeAuditLog({
    familyId: session.familyId,
    memberId: session.memberId,
    entityType: "TRANSACTION",
    entityId: tx.id,
    action: "CREATE",
    summary: `Thêm khoản chi "${tx.category?.name ?? "Chia nhỏ"}" — ${formatMoney(tx.amount)}`,
  });

  revalidateAllMoneyPages();
}

const jarAllocationSchema = z.object({
  jarId: z.string().min(1),
  amount: z.number().min(0),
  percentage: z.number(),
});

const createIncomeSchema = z.object({
  amount: z.number().positive("Số tiền phải lớn hơn 0"),
  date: z.string().min(1),
  categoryId: z.string().min(1, "Vui lòng chọn nguồn thu"),
  accountId: z.string().min(1, "Vui lòng chọn tài khoản nhận tiền"),
  payerMemberId: z.string().min(1, "Vui lòng chọn người tạo ra thu nhập"),
  incomeKind: z.enum(["FIXED", "VARIABLE"]).default("VARIABLE"),
  recurrenceKind: z.enum(["ONE_TIME", "RECURRING"]).default("ONE_TIME"),
  note: z.string().optional(),
  allocations: z.array(jarAllocationSchema),
});
export type CreateIncomeInput = z.infer<typeof createIncomeSchema>;

export async function createIncomeAction(input: CreateIncomeInput) {
  const session = await requireSession();
  const parsed = createIncomeSchema.parse(input);

  const allocSum = parsed.allocations.reduce((s, a) => s + a.amount, 0);
  if (Math.abs(allocSum - parsed.amount) > 1) {
    throw new Error(
      `Tổng phân bổ vào 6 lọ (${allocSum.toLocaleString("vi-VN")} đ) phải bằng số tiền thu nhập (${parsed.amount.toLocaleString("vi-VN")} đ)`
    );
  }

  const tx = await prisma.transaction.create({
    data: {
      familyId: session.familyId,
      type: "INCOME",
      amount: parsed.amount,
      date: new Date(parsed.date),
      categoryId: parsed.categoryId,
      accountId: parsed.accountId,
      createdByMemberId: session.memberId,
      payerMemberId: parsed.payerMemberId,
      incomeKind: parsed.incomeKind,
      recurrenceKind: parsed.recurrenceKind,
      note: parsed.note || null,
      jarAllocations: {
        create: parsed.allocations
          .filter((a) => a.amount > 0)
          .map((a) => ({ jarId: a.jarId, amount: a.amount, percentage: a.percentage })),
      },
    },
    include: { category: true },
  });

  await writeAuditLog({
    familyId: session.familyId,
    memberId: session.memberId,
    entityType: "TRANSACTION",
    entityId: tx.id,
    action: "CREATE",
    summary: `Thêm khoản thu "${tx.category?.name ?? ""}" — ${formatMoney(tx.amount)}`,
  });

  revalidateAllMoneyPages();
}

const accountTransferSchema = z.object({
  amount: z.number().positive(),
  date: z.string().min(1),
  accountId: z.string().min(1),
  toAccountId: z.string().min(1),
  note: z.string().optional(),
});
export type AccountTransferInput = z.infer<typeof accountTransferSchema>;

export async function createAccountTransferAction(input: AccountTransferInput) {
  const session = await requireSession();
  const parsed = accountTransferSchema.parse(input);
  if (parsed.accountId === parsed.toAccountId) {
    throw new Error("Tài khoản nguồn và tài khoản đích phải khác nhau");
  }

  const tx = await prisma.transaction.create({
    data: {
      familyId: session.familyId,
      type: "ACCOUNT_TRANSFER",
      amount: parsed.amount,
      date: new Date(parsed.date),
      accountId: parsed.accountId,
      toAccountId: parsed.toAccountId,
      createdByMemberId: session.memberId,
      note: parsed.note || null,
    },
  });

  await writeAuditLog({
    familyId: session.familyId,
    memberId: session.memberId,
    entityType: "TRANSACTION",
    entityId: tx.id,
    action: "CREATE",
    summary: `Chuyển tiền giữa tài khoản — ${formatMoney(tx.amount)}`,
  });

  revalidateAllMoneyPages();
}

const jarTransferSchema = z.object({
  amount: z.number().positive(),
  date: z.string().min(1),
  jarId: z.string().min(1),
  toJarId: z.string().min(1),
  note: z.string().optional(),
});
export type JarTransferInput = z.infer<typeof jarTransferSchema>;

export async function createJarTransferAction(input: JarTransferInput) {
  const session = await requireSession();
  const parsed = jarTransferSchema.parse(input);
  if (parsed.jarId === parsed.toJarId) {
    throw new Error("Lọ nguồn và lọ đích phải khác nhau");
  }

  const tx = await prisma.transaction.create({
    data: {
      familyId: session.familyId,
      type: "JAR_TRANSFER",
      amount: parsed.amount,
      date: new Date(parsed.date),
      jarId: parsed.jarId,
      toJarId: parsed.toJarId,
      createdByMemberId: session.memberId,
      note: parsed.note || null,
    },
  });

  await writeAuditLog({
    familyId: session.familyId,
    memberId: session.memberId,
    entityType: "TRANSACTION",
    entityId: tx.id,
    action: "CREATE",
    summary: `Chuyển tiền giữa lọ — ${formatMoney(tx.amount)}`,
  });

  revalidateAllMoneyPages();
}

export async function softDeleteTransactionAction(transactionId: string) {
  const session = await requireSession();
  const tx = await prisma.transaction.findFirst({
    where: { id: transactionId, familyId: session.familyId },
  });
  if (!tx) throw new Error("Không tìm thấy giao dịch");
  if (session.role !== "ADMIN" && tx.createdByMemberId !== session.memberId) {
    throw new Error("Bạn không có quyền xóa giao dịch này");
  }

  await prisma.transaction.update({
    where: { id: transactionId },
    data: { isDeleted: true, deletedAt: new Date() },
  });

  await writeAuditLog({
    familyId: session.familyId,
    memberId: session.memberId,
    entityType: "TRANSACTION",
    entityId: transactionId,
    action: "DELETE",
    summary: `Xóa giao dịch — ${formatMoney(tx.amount)}`,
  });

  revalidateAllMoneyPages();
}

export async function restoreTransactionAction(transactionId: string) {
  const session = await requireSession();
  await prisma.transaction.update({
    where: { id: transactionId, familyId: session.familyId },
    data: { isDeleted: false, deletedAt: null },
  });

  await writeAuditLog({
    familyId: session.familyId,
    memberId: session.memberId,
    entityType: "TRANSACTION",
    entityId: transactionId,
    action: "RESTORE",
    summary: "Khôi phục giao dịch",
  });

  revalidateAllMoneyPages();
}

const updateBasicFieldsSchema = z.object({
  transactionId: z.string().min(1),
  amount: z.number().positive().optional(),
  date: z.string().optional(),
  categoryId: z.string().optional(),
  accountId: z.string().optional(),
  jarId: z.string().optional(),
  payerMemberId: z.string().optional(),
  beneficiaryMemberIds: z.array(z.string()).optional(),
  isShared: z.boolean().optional(),
  paymentMethod: z.string().optional(),
  necessity: z.string().nullable().optional(),
  status: z.string().optional(),
  note: z.string().optional(),
  isFixed: z.boolean().optional(),
  location: z.string().optional(),
});
export type UpdateTransactionInput = z.infer<typeof updateBasicFieldsSchema>;

export async function updateTransactionAction(input: UpdateTransactionInput) {
  const session = await requireSession();
  const parsed = updateBasicFieldsSchema.parse(input);
  const existing = await prisma.transaction.findFirst({
    where: { id: parsed.transactionId, familyId: session.familyId },
    include: { splits: true },
  });
  if (!existing) throw new Error("Không tìm thấy giao dịch");

  const { transactionId, beneficiaryMemberIds, ...rest } = parsed;
  const data: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rest)) {
    if (value === undefined) continue;
    if (key === "date") {
      data.date = new Date(value as string);
    } else if (key === "note") {
      data.note = value || null;
    } else if (key === "necessity") {
      data.necessity = value || null;
    } else if ((key === "categoryId" || key === "jarId") && existing.splits.length > 0) {
      continue; // giao dịch đã chia nhỏ: không đổi danh mục/lọ gốc
    } else {
      data[key] = value;
    }
  }

  await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      ...data,
      ...(beneficiaryMemberIds
        ? {
            beneficiaries: {
              deleteMany: {},
              create: beneficiaryMemberIds.map((id) => ({ memberId: id })),
            },
          }
        : {}),
    },
  });

  await writeAuditLog({
    familyId: session.familyId,
    memberId: session.memberId,
    entityType: "TRANSACTION",
    entityId: transactionId,
    action: "UPDATE",
    summary: `Sửa giao dịch: ${Object.keys(rest).join(", ") || "ghi chú"}`,
  });

  revalidateAllMoneyPages();
}
