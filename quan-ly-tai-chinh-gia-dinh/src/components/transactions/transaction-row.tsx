import Link from "next/link";
import { Icon } from "@/components/icon";
import { formatMoney, formatDate } from "@/lib/format";
import { TRANSACTION_TYPE_LABEL, type TransactionType } from "@/lib/enums";

export type TransactionRowData = {
  id: string;
  type: string;
  amount: number;
  date: Date | string;
  isDeleted?: boolean;
  category?: { name: string; icon: string } | null;
  account?: { name: string } | null;
  toAccount?: { name: string } | null;
  jar?: { name: string; icon: string; color: string } | null;
  toJar?: { name: string; icon: string; color: string } | null;
  payer?: { name: string } | null;
  note?: string | null;
};

export function TransactionRow({ tx }: { tx: TransactionRowData }) {
  const isIncome = tx.type === "INCOME";
  const isExpense = tx.type === "EXPENSE";
  const isTransfer = tx.type === "ACCOUNT_TRANSFER" || tx.type === "JAR_TRANSFER";

  const title = isTransfer
    ? tx.type === "ACCOUNT_TRANSFER"
      ? `${tx.account?.name ?? "?"} → ${tx.toAccount?.name ?? "?"}`
      : `${tx.jar?.name ?? "?"} → ${tx.toJar?.name ?? "?"}`
    : tx.category?.name ?? TRANSACTION_TYPE_LABEL[tx.type as TransactionType];

  const iconName = isTransfer
    ? "ArrowLeftRight"
    : tx.category?.icon ?? (isIncome ? "TrendingUp" : "Wallet");

  const subtitle = isTransfer
    ? tx.note || "Chuyển tiền nội bộ"
    : [tx.payer?.name, tx.account?.name].filter(Boolean).join(" · ");

  return (
    <Link
      href={`/transactions/${tx.id}`}
      className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          isIncome
            ? "bg-success-soft text-success"
            : isExpense
              ? "bg-danger-soft text-danger"
              : "bg-brand-soft text-brand"
        }`}
      >
        <Icon name={iconName} size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="truncate text-xs text-muted">
          {formatDate(tx.date)}
          {subtitle ? ` · ${subtitle}` : ""}
        </p>
      </div>
      <p
        className={`shrink-0 text-sm font-semibold ${
          isIncome ? "text-success" : isExpense ? "text-danger" : "text-foreground"
        }`}
      >
        {isIncome ? "+" : isExpense ? "-" : ""}
        {formatMoney(tx.amount)}
      </p>
    </Link>
  );
}
