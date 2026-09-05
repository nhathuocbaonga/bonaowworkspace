"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { writeAuditLog } from "@/lib/audit";
import { formatMoney } from "@/lib/format";

function revalidateReceivablePages() {
  revalidatePath("/receivables");
  revalidatePath("/dashboard");
  revalidatePath("/accounts");
  revalidatePath("/transactions");
}

const createReceivableSchema = z.object({
  borrowerName: z.string().min(1, "Vui lòng nhập tên người vay"),
  lentByMemberId: z.string().optional(),
  amount: z.number().positive("Số tiền cho vay phải lớn hơn 0"),
  lentDate: z.string().min(1),
  dueDate: z.string().optional(),
  interestRate: z.number().optional(),
  note: z.string().optional(),
  fromAccountId: z.string().min(1, "Vui lòng chọn tài khoản chi tiền cho vay"),
});
export type CreateReceivableInput = z.infer<typeof createReceivableSchema>;

export async function createReceivableAction(input: CreateReceivableInput) {
  const session = await requireSession();
  const parsed = createReceivableSchema.parse(input);

  const receivable = await prisma.receivable.create({
    data: {
      familyId: session.familyId,
      borrowerName: parsed.borrowerName,
      lentByMemberId: parsed.lentByMemberId || null,
      amount: parsed.amount,
      lentDate: new Date(parsed.lentDate),
      dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
      interestRate: parsed.interestRate,
      note: parsed.note,
    },
  });

  await prisma.transaction.create({
    data: {
      familyId: session.familyId,
      type: "LOAN_OUT",
      amount: parsed.amount,
      date: new Date(parsed.lentDate),
      accountId: parsed.fromAccountId,
      createdByMemberId: session.memberId,
      receivableId: receivable.id,
      note: `Cho ${parsed.borrowerName} vay`,
    },
  });

  await writeAuditLog({
    familyId: session.familyId,
    memberId: session.memberId,
    entityType: "RECEIVABLE",
    entityId: receivable.id,
    action: "CREATE",
    summary: `Cho "${parsed.borrowerName}" vay ${formatMoney(parsed.amount)}`,
  });

  revalidateReceivablePages();
}

const collectSchema = z.object({
  receivableId: z.string().min(1),
  amount: z.number().positive("Số tiền thu hồi phải lớn hơn 0"),
  accountId: z.string().min(1),
  date: z.string().min(1),
  note: z.string().optional(),
});
export type CollectReceivableInput = z.infer<typeof collectSchema>;

export async function collectReceivableAction(input: CollectReceivableInput) {
  const session = await requireSession();
  const parsed = collectSchema.parse(input);

  const receivable = await prisma.receivable.findFirst({
    where: { id: parsed.receivableId, familyId: session.familyId },
  });
  if (!receivable) throw new Error("Không tìm thấy khoản cho vay");

  await prisma.transaction.create({
    data: {
      familyId: session.familyId,
      type: "LOAN_COLLECT",
      amount: parsed.amount,
      date: new Date(parsed.date),
      accountId: parsed.accountId,
      createdByMemberId: session.memberId,
      receivableId: receivable.id,
      note: parsed.note || `Thu hồi nợ từ ${receivable.borrowerName}`,
    },
  });

  const collectedAgg = await prisma.transaction.aggregate({
    where: { familyId: session.familyId, receivableId: receivable.id, type: "LOAN_COLLECT", isDeleted: false },
    _sum: { amount: true },
  });
  const totalCollected = collectedAgg._sum.amount ?? 0;
  const status = totalCollected >= receivable.amount ? "COLLECTED" : totalCollected > 0 ? "PARTIALLY_COLLECTED" : "OUTSTANDING";
  await prisma.receivable.update({ where: { id: receivable.id }, data: { status } });

  await writeAuditLog({
    familyId: session.familyId,
    memberId: session.memberId,
    entityType: "RECEIVABLE",
    entityId: receivable.id,
    action: "UPDATE",
    summary: `Thu hồi ${formatMoney(parsed.amount)} từ "${receivable.borrowerName}"`,
  });

  revalidateReceivablePages();
}

const writeOffSchema = z.object({ receivableId: z.string().min(1) });

export async function writeOffReceivableAction(input: z.infer<typeof writeOffSchema>) {
  const session = await requireSession();
  const parsed = writeOffSchema.parse(input);
  await prisma.receivable.update({
    where: { id: parsed.receivableId, familyId: session.familyId },
    data: { status: "WRITTEN_OFF" },
  });
  revalidateReceivablePages();
}
