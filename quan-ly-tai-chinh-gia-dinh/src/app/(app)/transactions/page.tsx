import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { getFamilyMembers } from "@/lib/data";
import { TransactionRow } from "@/components/transactions/transaction-row";
import { Select, Input } from "@/components/ui/form-controls";
import { Button } from "@/components/ui/button";
import { TRANSACTION_TYPES, TRANSACTION_TYPE_LABEL, type TransactionType } from "@/lib/enums";
import { Icon } from "@/components/icon";
import { buildTransactionWhere } from "@/lib/transaction-filters";

const PAGE_SIZE = 25;

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    memberId?: string;
    from?: string;
    to?: string;
    q?: string;
    page?: string;
  }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const where = buildTransactionWhere(session.familyId, params);
  const exportQuery = new URLSearchParams(
    Object.entries(params).filter(([k, v]) => k !== "page" && !!v) as [string, string][]
  ).toString();

  const [transactions, total, members] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { category: true, account: true, toAccount: true, jar: true, toJar: true, payer: true },
    }),
    prisma.transaction.count({ where }),
    getFamilyMembers(session.familyId),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Giao dịch</h1>
          <p className="text-sm text-muted">{total} giao dịch</p>
        </div>
        <div className="flex gap-2">
          <Link href="/import">
            <Button size="sm" variant="outline">
              <Icon name="ArrowLeftRight" size={14} /> Nhập dữ liệu
            </Button>
          </Link>
          <a href={`/api/export/transactions?format=xlsx${exportQuery ? `&${exportQuery}` : ""}`}>
            <Button size="sm" variant="outline">
              <Icon name="Receipt" size={14} /> Xuất Excel
            </Button>
          </a>
        </div>
      </div>

      <form method="get" className="mb-5 grid grid-cols-2 gap-2 rounded-2xl border border-border bg-surface p-3 sm:grid-cols-5">
        <Select name="type" defaultValue={params.type ?? ""} className="sm:col-span-1">
          <option value="">Tất cả loại</option>
          {TRANSACTION_TYPES.map((t) => (
            <option key={t} value={t}>
              {TRANSACTION_TYPE_LABEL[t as TransactionType]}
            </option>
          ))}
        </Select>
        <Select name="memberId" defaultValue={params.memberId ?? ""} className="sm:col-span-1">
          <option value="">Tất cả thành viên</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </Select>
        <Input type="date" name="from" defaultValue={params.from ?? ""} className="sm:col-span-1" />
        <Input type="date" name="to" defaultValue={params.to ?? ""} className="sm:col-span-1" />
        <div className="col-span-2 flex gap-2 sm:col-span-1">
          <Input name="q" placeholder="Tìm ghi chú..." defaultValue={params.q ?? ""} />
          <button
            type="submit"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-brand-foreground"
            aria-label="Lọc"
          >
            <Icon name="Filter" size={16} />
          </button>
        </div>
      </form>

      <div className="divide-y divide-border rounded-2xl border border-border bg-surface">
        {transactions.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted">Không có giao dịch nào khớp bộ lọc.</p>
        ) : (
          transactions.map((tx) => (
            <div key={tx.id} className="px-2">
              <TransactionRow tx={tx} />
            </div>
          ))
        )}
      </div>

      {totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/transactions?${new URLSearchParams({ ...params, page: String(p) } as Record<string, string>).toString()}`}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm ${
                p === page ? "bg-brand text-brand-foreground" : "text-muted hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
