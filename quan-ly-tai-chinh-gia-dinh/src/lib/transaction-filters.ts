import type { Prisma } from "@prisma/client";

export type TransactionFilterParams = {
  type?: string;
  memberId?: string;
  from?: string;
  to?: string;
  q?: string;
};

export function buildTransactionWhere(
  familyId: string,
  params: TransactionFilterParams
): Prisma.TransactionWhereInput {
  const where: Prisma.TransactionWhereInput = {
    familyId,
    isDeleted: false,
  };
  if (params.type) where.type = params.type;
  if (params.memberId) {
    where.OR = [{ payerMemberId: params.memberId }, { beneficiaries: { some: { memberId: params.memberId } } }];
  }
  if (params.from || params.to) {
    where.date = {
      ...(params.from ? { gte: new Date(params.from) } : {}),
      ...(params.to ? { lte: new Date(params.to + "T23:59:59") } : {}),
    };
  }
  if (params.q) {
    where.note = { contains: params.q };
  }
  return where;
}
