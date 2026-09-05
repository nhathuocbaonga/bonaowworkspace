import "server-only";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { formatMoney } from "@/lib/format";
import { suggestJarAllocation } from "@/lib/jar-math";
import type { ParsedTransaction } from "./ai-parser";

/** Lỗi có thông điệp tiếng Việt rõ ràng, an toàn để gửi thẳng cho người dùng qua Telegram
 *  (khác với lỗi hệ thống chung chung — webhook sẽ ưu tiên hiển thị message của lỗi này). */
export class TelegramTransactionError extends Error {}

// Sau khi .normalize("NFD"), mỗi ký tự có dấu tách thành chữ cái gốc + 1 dấu tổ hợp riêng
// (Unicode "combining diacritical marks", khối U+0300–U+036F) — xoá khối này để bỏ dấu tiếng Việt.
const COMBINING_DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

function normalizeVN(s: string): string {
  return s.normalize("NFD").replace(COMBINING_DIACRITICS, "").toLowerCase().trim();
}

/** Tìm tài khoản theo tên, không phân biệt hoa/thường và có/không dấu. Nếu không có gợi ý tên,
 *  dùng tài khoản đầu tiên (mặc định) của gia đình. Báo lỗi rõ ràng nếu không tìm thấy hoặc
 *  khớp nhiều hơn 1 tài khoản. */
async function findAccount(familyId: string, hint: string | null) {
  const accounts = await prisma.account.findMany({
    where: { familyId, isActive: true },
    orderBy: { createdAt: "asc" },
  });
  if (accounts.length === 0) {
    throw new TelegramTransactionError("Gia đình chưa có tài khoản tiền nào, vui lòng tạo tài khoản trong app trước.");
  }
  if (!hint) return accounts[0];

  const normHint = normalizeVN(hint);
  const matches = accounts.filter((a) => {
    const normName = normalizeVN(a.name);
    return normName === normHint || normName.includes(normHint) || normHint.includes(normName);
  });
  if (matches.length === 1) return matches[0];
  if (matches.length > 1) {
    throw new TelegramTransactionError(
      `Có nhiều tài khoản khớp với "${hint}": ${matches.map((a) => a.name).join(", ")}. Vui lòng nói rõ tên tài khoản.`
    );
  }
  throw new TelegramTransactionError(`Không tìm thấy tài khoản "${hint}".`);
}

/** Tìm khoản nợ đang vay còn hoạt động theo tên chủ nợ, không phân biệt hoa/thường và dấu. */
async function findActiveDebtByLender(familyId: string, lenderHint: string) {
  const debts = await prisma.debt.findMany({ where: { familyId, status: "ACTIVE" } });
  const normHint = normalizeVN(lenderHint);
  const matches = debts.filter((d) => {
    const normLender = normalizeVN(d.lender);
    return normLender === normHint || normLender.includes(normHint) || normHint.includes(normLender);
  });
  if (matches.length === 1) return matches[0];
  if (matches.length > 1) {
    throw new TelegramTransactionError(
      `Có nhiều khoản nợ đang vay khớp với "${lenderHint}". Vui lòng vào app > Nợ & Phải thu để trả nợ cho chính xác.`
    );
  }
  throw new TelegramTransactionError(`Không tìm thấy khoản nợ đang vay nào từ "${lenderHint}".`);
}

type LoanTransaction = Extract<ParsedTransaction, { success: true; kind: "LOAN_BORROW" | "LOAN_REPAY" }>;
type MoneyTransaction = Extract<ParsedTransaction, { success: true; kind: "EXPENSE" | "INCOME" }>;

function isLoanTransaction(p: Extract<ParsedTransaction, { success: true }>): p is LoanTransaction {
  return p.kind === "LOAN_BORROW" || p.kind === "LOAN_REPAY";
}

/** Vay tiền (LOAN_BORROW) hoặc trả nợ (LOAN_REPAY) — ghi Debt + Transaction trong 1
 *  prisma.$transaction để không bao giờ lệch số dư nếu có lỗi giữa chừng. */
async function createLoanTransaction(
  familyId: string,
  memberId: string,
  parsed: LoanTransaction
): Promise<{ summary: string; transactionId: string }> {
  if (parsed.kind === "LOAN_BORROW") {
    const account = await findAccount(familyId, parsed.accountHint);
    const note = parsed.note ? `Vay ${parsed.counterpartyName} — ${parsed.note}` : `Vay ${parsed.counterpartyName}`;

    const { debtId, transactionId } = await prisma.$transaction(async (tx) => {
      const debt = await tx.debt.create({
        data: {
          familyId,
          name: `Vay ${parsed.counterpartyName}`,
          lender: parsed.counterpartyName,
          borrowerMemberId: memberId,
          responsibleMemberId: memberId,
          principalAmount: parsed.amount,
          startDate: new Date(),
        },
      });
      const created = await tx.transaction.create({
        data: {
          familyId,
          type: "DEBT_BORROW",
          amount: parsed.amount,
          date: new Date(),
          accountId: account.id,
          createdByMemberId: memberId,
          debtId: debt.id,
          note,
        },
      });
      return { debtId: debt.id, transactionId: created.id };
    });

    await writeAuditLog({
      familyId,
      memberId,
      entityType: "DEBT",
      entityId: debtId,
      action: "CREATE",
      summary: `Vay "${parsed.counterpartyName}" — ${formatMoney(parsed.amount)} (qua Telegram)`,
    });

    return {
      summary: `Vay ${parsed.counterpartyName} ${formatMoney(parsed.amount)} — đã cộng vào ${account.name} và tạo khoản nợ phải trả`,
      transactionId,
    };
  }

  const account = await findAccount(familyId, parsed.accountHint);
  const debt = await findActiveDebtByLender(familyId, parsed.counterpartyName);
  const note = parsed.note ? `Trả nợ ${debt.lender} — ${parsed.note}` : `Trả nợ ${debt.lender}`;

  const { newStatus, transactionId } = await prisma.$transaction(async (tx) => {
    const created = await tx.transaction.create({
      data: {
        familyId,
        type: "DEBT_PRINCIPAL",
        amount: parsed.amount,
        date: new Date(),
        accountId: account.id,
        createdByMemberId: memberId,
        debtId: debt.id,
        note,
      },
    });

    const paidAgg = await tx.transaction.aggregate({
      where: { familyId, debtId: debt.id, type: "DEBT_PRINCIPAL", isDeleted: false },
      _sum: { amount: true },
    });
    const totalPaid = paidAgg._sum.amount ?? 0;
    const status = totalPaid >= debt.principalAmount ? "PAID_OFF" : "ACTIVE";
    if (status !== debt.status) {
      await tx.debt.update({ where: { id: debt.id }, data: { status } });
    }
    return { newStatus: status, transactionId: created.id };
  });

  await writeAuditLog({
    familyId,
    memberId,
    entityType: "DEBT",
    entityId: debt.id,
    action: "UPDATE",
    summary: `Trả nợ "${debt.lender}" — ${formatMoney(parsed.amount)} (qua Telegram)`,
  });

  return {
    summary: `Trả nợ ${debt.lender} ${formatMoney(parsed.amount)} từ ${account.name}${newStatus === "PAID_OFF" ? " — đã trả hết nợ 🎉" : ""}`,
    transactionId,
  };
}

/** Chi tiêu (EXPENSE) hoặc thu nhập (INCOME) — hành vi giống hệt Quick Add trong app. */
async function createMoneyTransaction(
  familyId: string,
  memberId: string,
  parsed: MoneyTransaction
): Promise<{ summary: string; transactionId: string }> {
  const [category, account] = await Promise.all([
    prisma.category.findFirst({ where: { familyId, name: parsed.categoryName, type: parsed.kind } }),
    findAccount(familyId, parsed.accountHint),
  ]);
  if (!category) throw new TelegramTransactionError(`Không tìm thấy danh mục "${parsed.categoryName}"`);

  const note = [parsed.merchant, parsed.note].filter(Boolean).join(" — ") || null;

  if (parsed.kind === "EXPENSE") {
    const jar = category.defaultJar
      ? await prisma.jar.findFirst({ where: { familyId, code: category.defaultJar } })
      : null;
    const fallbackJar = jar ?? (await prisma.jar.findFirst({ where: { familyId, code: "NEC" } }));
    if (!fallbackJar) throw new TelegramTransactionError("Gia đình chưa thiết lập 6 chiếc lọ");

    const tx = await prisma.transaction.create({
      data: {
        familyId,
        type: "EXPENSE",
        amount: parsed.amount,
        date: new Date(),
        categoryId: category.id,
        accountId: account.id,
        jarId: fallbackJar.id,
        createdByMemberId: memberId,
        payerMemberId: memberId,
        isShared: false,
        paymentMethod: "KHAC",
        necessity: category.defaultNecessity,
        note,
        beneficiaries: { create: [{ memberId }] },
      },
    });

    await writeAuditLog({
      familyId,
      memberId,
      entityType: "TRANSACTION",
      entityId: tx.id,
      action: "CREATE",
      summary: `Thêm khoản chi "${category.name}" — ${formatMoney(tx.amount)} (qua Telegram)`,
    });

    return { summary: `Chi ${formatMoney(tx.amount)} — ${category.name}${parsed.merchant ? ` tại ${parsed.merchant}` : ""}`, transactionId: tx.id };
  }

  const jars = await prisma.jar.findMany({ where: { familyId } });
  const allocations = suggestJarAllocation(parsed.amount, jars);

  const tx = await prisma.transaction.create({
    data: {
      familyId,
      type: "INCOME",
      amount: parsed.amount,
      date: new Date(),
      categoryId: category.id,
      accountId: account.id,
      createdByMemberId: memberId,
      payerMemberId: memberId,
      incomeKind: "VARIABLE",
      recurrenceKind: "ONE_TIME",
      note,
      jarAllocations: {
        create: allocations.filter((a) => a.amount > 0).map((a) => ({ jarId: a.jarId, amount: a.amount, percentage: a.percentage })),
      },
    },
  });

  await writeAuditLog({
    familyId,
    memberId,
    entityType: "TRANSACTION",
    entityId: tx.id,
    action: "CREATE",
    summary: `Thêm khoản thu "${category.name}" — ${formatMoney(tx.amount)} (qua Telegram)`,
  });

  return { summary: `Thu ${formatMoney(tx.amount)} — ${category.name}, đã tự phân bổ vào 6 lọ`, transactionId: tx.id };
}

/** Ghi nhận giao dịch từ Telegram (ảnh hóa đơn hoặc tin nhắn) — không có session trình
 *  duyệt nên nhận thẳng familyId/memberId đã xác định qua TelegramLink. Hỗ trợ 4 loại:
 *  EXPENSE, INCOME, LOAN_BORROW (vay), LOAN_REPAY (trả nợ). */
export async function createTransactionFromTelegram(
  familyId: string,
  memberId: string,
  parsed: Extract<ParsedTransaction, { success: true }>
): Promise<{ summary: string; transactionId: string }> {
  if (isLoanTransaction(parsed)) {
    return createLoanTransaction(familyId, memberId, parsed);
  }
  return createMoneyTransaction(familyId, memberId, parsed);
}
