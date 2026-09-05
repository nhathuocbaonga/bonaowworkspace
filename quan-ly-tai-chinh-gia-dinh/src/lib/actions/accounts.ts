"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession, requireAdmin } from "@/lib/session";
import { ACCOUNT_TYPES } from "@/lib/enums";
import { writeAuditLog } from "@/lib/audit";

const accountSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên tài khoản"),
  type: z.enum(ACCOUNT_TYPES),
  ownerMemberId: z.string().optional(),
  openingBalance: z.number().default(0),
  creditLimit: z.number().optional(),
  statementDate: z.number().optional(),
  dueDate: z.number().optional(),
  note: z.string().optional(),
});
export type AccountInput = z.infer<typeof accountSchema>;

export async function createAccountAction(input: AccountInput) {
  const session = await requireSession();
  const parsed = accountSchema.parse(input);
  const account = await prisma.account.create({
    data: {
      familyId: session.familyId,
      name: parsed.name,
      type: parsed.type,
      ownerMemberId: parsed.ownerMemberId || null,
      openingBalance: parsed.openingBalance,
      creditLimit: parsed.creditLimit,
      statementDate: parsed.statementDate,
      dueDate: parsed.dueDate,
      note: parsed.note || null,
    },
  });
  await writeAuditLog({
    familyId: session.familyId,
    memberId: session.memberId,
    entityType: "ACCOUNT",
    entityId: account.id,
    action: "CREATE",
    summary: `Tạo tài khoản "${account.name}"`,
  });
  revalidatePath("/accounts");
  revalidatePath("/dashboard");
}

export async function updateAccountAction(id: string, input: AccountInput) {
  const session = await requireSession();
  const parsed = accountSchema.parse(input);
  await prisma.account.update({
    where: { id, familyId: session.familyId },
    data: {
      name: parsed.name,
      type: parsed.type,
      ownerMemberId: parsed.ownerMemberId || null,
      openingBalance: parsed.openingBalance,
      creditLimit: parsed.creditLimit,
      statementDate: parsed.statementDate,
      dueDate: parsed.dueDate,
      note: parsed.note || null,
    },
  });
  revalidatePath("/accounts");
  revalidatePath("/dashboard");
}

export async function archiveAccountAction(id: string) {
  const session = await requireAdmin();
  const account = await prisma.account.update({
    where: { id, familyId: session.familyId },
    data: { isActive: false },
  });
  await writeAuditLog({
    familyId: session.familyId,
    memberId: session.memberId,
    entityType: "ACCOUNT",
    entityId: id,
    action: "DELETE",
    summary: `Ẩn tài khoản "${account.name}"`,
  });
  revalidatePath("/accounts");
  revalidatePath("/dashboard");
}
