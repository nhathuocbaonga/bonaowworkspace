"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { writeAuditLog } from "@/lib/audit";

const rowSchema = z.object({
  "Ngày": z.string(),
  "Loại giao dịch": z.string(),
  "Số tiền": z.string(),
  "Danh mục": z.string(),
  "Thành viên": z.string().optional().default(""),
  "Chi cho ai": z.string().optional().default(""),
  "Tài khoản": z.string(),
  "Chiếc lọ": z.string().optional().default(""),
  "Nội dung": z.string().optional().default(""),
  "Ghi chú": z.string().optional().default(""),
});
export type ImportRow = z.infer<typeof rowSchema>;

function parseVietnameseDate(raw: string): Date | null {
  const m = raw.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const [, d, mo, y] = m;
  const date = new Date(Number(y), Number(mo) - 1, Number(d));
  return isNaN(date.getTime()) ? null : date;
}

function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/[^\d.-]/g, "");
  const n = Number(cleaned);
  return isNaN(n) || n <= 0 ? null : n;
}

export async function importTransactionsAction(rows: ImportRow[]) {
  const session = await requireSession();

  const [categories, accounts, jars, members] = await Promise.all([
    prisma.category.findMany({ where: { familyId: session.familyId } }),
    prisma.account.findMany({ where: { familyId: session.familyId } }),
    prisma.jar.findMany({ where: { familyId: session.familyId } }),
    prisma.familyMember.findMany({ where: { familyId: session.familyId } }),
  ]);

  const findByName = <T extends { name: string }>(list: T[], name: string) =>
    list.find((x) => x.name.trim().toLowerCase() === name.trim().toLowerCase());

  const results: { row: number; status: "OK" | "SKIPPED"; reason?: string }[] = [];
  let imported = 0;

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i];
    const parsed = rowSchema.safeParse(raw);
    if (!parsed.success) {
      results.push({ row: i + 1, status: "SKIPPED", reason: "Thiếu dữ liệu bắt buộc" });
      continue;
    }
    const r = parsed.data;

    const date = parseVietnameseDate(r["Ngày"]);
    if (!date) {
      results.push({ row: i + 1, status: "SKIPPED", reason: `Ngày không hợp lệ: "${r["Ngày"]}" (định dạng: dd/mm/yyyy)` });
      continue;
    }

    const amount = parseAmount(r["Số tiền"]);
    if (!amount) {
      results.push({ row: i + 1, status: "SKIPPED", reason: `Số tiền không hợp lệ: "${r["Số tiền"]}"` });
      continue;
    }

    const typeRaw = r["Loại giao dịch"].trim().toLowerCase();
    const isIncome = ["thu", "thu nhập", "income"].includes(typeRaw);
    const isExpense = ["chi", "chi tiêu", "expense"].includes(typeRaw);
    if (!isIncome && !isExpense) {
      results.push({ row: i + 1, status: "SKIPPED", reason: `Loại giao dịch không hợp lệ: "${r["Loại giao dịch"]}" (chỉ hỗ trợ Thu/Chi)` });
      continue;
    }

    const category = findByName(
      categories.filter((c) => c.type === (isIncome ? "INCOME" : "EXPENSE")),
      r["Danh mục"]
    );
    if (!category) {
      results.push({ row: i + 1, status: "SKIPPED", reason: `Không tìm thấy danh mục: "${r["Danh mục"]}"` });
      continue;
    }

    const account = findByName(accounts, r["Tài khoản"]);
    if (!account) {
      results.push({ row: i + 1, status: "SKIPPED", reason: `Không tìm thấy tài khoản: "${r["Tài khoản"]}"` });
      continue;
    }

    const payer = r["Thành viên"] ? findByName(members, r["Thành viên"]) : undefined;

    let jarId: string | null = null;
    if (isExpense) {
      const jarName = r["Chiếc lọ"];
      const jar = jarName ? findByName(jars, jarName) : undefined;
      jarId = jar?.id ?? jars.find((j) => j.code === category.defaultJar)?.id ?? jars[0]?.id ?? null;
    }

    const isShared = r["Chi cho ai"].trim().toLowerCase() === "cả gia đình";
    const beneficiaryNames = isShared
      ? []
      : r["Chi cho ai"]
          .split(",")
          .map((n) => n.trim())
          .filter(Boolean);
    const beneficiaryIds = beneficiaryNames
      .map((n) => findByName(members, n)?.id)
      .filter((id): id is string => !!id);

    const note = [r["Nội dung"], r["Ghi chú"]].filter(Boolean).join(" — ") || undefined;

    await prisma.transaction.create({
      data: {
        familyId: session.familyId,
        type: isIncome ? "INCOME" : "EXPENSE",
        amount,
        date,
        categoryId: category.id,
        accountId: account.id,
        jarId,
        createdByMemberId: session.memberId,
        payerMemberId: payer?.id ?? session.memberId,
        isShared,
        necessity: isExpense ? category.defaultNecessity : null,
        note,
        beneficiaries: beneficiaryIds.length > 0 ? { create: beneficiaryIds.map((id) => ({ memberId: id })) } : undefined,
      },
    });

    imported++;
    results.push({ row: i + 1, status: "OK" });
  }

  await writeAuditLog({
    familyId: session.familyId,
    memberId: session.memberId,
    entityType: "TRANSACTION",
    entityId: "bulk-import",
    action: "CREATE",
    summary: `Nhập ${imported}/${rows.length} giao dịch từ file CSV`,
  });

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  revalidatePath("/jars");
  revalidatePath("/budgets");
  revalidatePath("/accounts");

  return { imported, total: rows.length, results };
}
