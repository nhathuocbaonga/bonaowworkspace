import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { buildTransactionWhere } from "@/lib/transaction-filters";
import { formatDate } from "@/lib/format";
import {
  TRANSACTION_TYPE_LABEL,
  PAYMENT_METHOD_LABEL,
  NECESSITY_LABEL,
  type TransactionType,
  type PaymentMethod,
  type NecessityLevel,
} from "@/lib/enums";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());
  const format = params.format === "csv" ? "csv" : "xlsx";

  const where = buildTransactionWhere(session.familyId, params);
  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { date: "desc" },
    include: { category: true, account: true, toAccount: true, jar: true, toJar: true, payer: true, createdBy: true },
  });

  const rows = transactions.map((tx) => ({
    date: formatDate(tx.date),
    type: TRANSACTION_TYPE_LABEL[tx.type as TransactionType] ?? tx.type,
    amount: tx.amount,
    category: tx.category?.name ?? "",
    account: tx.account?.name ?? "",
    toAccount: tx.toAccount?.name ?? "",
    jar: tx.jar?.name ?? "",
    toJar: tx.toJar?.name ?? "",
    payer: tx.payer?.name ?? "",
    necessity: tx.necessity ? NECESSITY_LABEL[tx.necessity as NecessityLevel] : "",
    paymentMethod: PAYMENT_METHOD_LABEL[tx.paymentMethod as PaymentMethod] ?? tx.paymentMethod,
    note: tx.note ?? "",
    createdBy: tx.createdBy.name,
  }));

  const filename = `giao-dich-${new Date().toISOString().slice(0, 10)}`;

  if (format === "csv") {
    const headers = [
      "Ngày",
      "Loại giao dịch",
      "Số tiền",
      "Danh mục",
      "Tài khoản",
      "Tài khoản đích",
      "Lọ",
      "Lọ đích",
      "Người chi/thu",
      "Mức độ cần thiết",
      "Hình thức thanh toán",
      "Ghi chú",
      "Người nhập",
    ];
    const csvLines = [
      headers.join(","),
      ...rows.map((r) =>
        [
          r.date,
          r.type,
          r.amount,
          r.category,
          r.account,
          r.toAccount,
          r.jar,
          r.toJar,
          r.payer,
          r.necessity,
          r.paymentMethod,
          r.note,
          r.createdBy,
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ];
    const csv = "﻿" + csvLines.join("\r\n"); // BOM để Excel hiển thị đúng tiếng Việt
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}.csv"`,
      },
    });
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "So Thu Chi Gia Dinh";
  const sheet = workbook.addWorksheet("Giao dịch");
  sheet.columns = [
    { header: "Ngày", key: "date", width: 12 },
    { header: "Loại giao dịch", key: "type", width: 20 },
    { header: "Số tiền", key: "amount", width: 15 },
    { header: "Danh mục", key: "category", width: 22 },
    { header: "Tài khoản", key: "account", width: 18 },
    { header: "Tài khoản đích", key: "toAccount", width: 18 },
    { header: "Lọ", key: "jar", width: 16 },
    { header: "Lọ đích", key: "toJar", width: 16 },
    { header: "Người chi/thu", key: "payer", width: 16 },
    { header: "Mức độ cần thiết", key: "necessity", width: 16 },
    { header: "Hình thức thanh toán", key: "paymentMethod", width: 18 },
    { header: "Ghi chú", key: "note", width: 28 },
    { header: "Người nhập", key: "createdBy", width: 16 },
  ];
  sheet.getRow(1).font = { bold: true };
  sheet.addRows(rows);
  sheet.getColumn("amount").numFmt = "#,##0";

  const summarySheet = workbook.addWorksheet("Tóm tắt");
  const totalIncome = transactions.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
  summarySheet.addRows([
    ["Tổng số giao dịch", transactions.length],
    ["Tổng thu", totalIncome],
    ["Tổng chi", totalExpense],
    ["Dòng tiền ròng", totalIncome - totalExpense],
    ["Xuất lúc", new Date().toLocaleString("vi-VN")],
  ]);
  summarySheet.getColumn(1).width = 24;
  summarySheet.getColumn(2).width = 20;

  const buffer = await workbook.xlsx.writeBuffer();

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
    },
  });
}
