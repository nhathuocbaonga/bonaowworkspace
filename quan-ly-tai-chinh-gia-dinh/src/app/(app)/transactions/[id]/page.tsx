import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { formatMoney, formatDateTime } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/icon";
import {
  TRANSACTION_TYPE_LABEL,
  NECESSITY_LABEL,
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_LABEL,
  type TransactionType,
  type NecessityLevel,
  type PaymentMethod,
  type PaymentStatus,
} from "@/lib/enums";
import { TransactionDetailActions } from "@/components/transactions/transaction-detail-actions";
import { AttachmentSection } from "@/components/transactions/attachment-section";
import { isGoogleDriveConfigured } from "@/lib/google-drive";

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  const tx = await prisma.transaction.findFirst({
    where: { id, familyId: session.familyId },
    include: {
      category: true,
      account: true,
      toAccount: true,
      jar: true,
      toJar: true,
      payer: true,
      createdBy: true,
      beneficiaries: { include: { member: true } },
      splits: { include: { category: true } },
      jarAllocations: { include: { jar: true } },
    },
  });
  if (!tx) notFound();

  const isIncome = tx.type === "INCOME";
  const isExpense = tx.type === "EXPENSE";
  const isTransfer = tx.type === "ACCOUNT_TRANSFER" || tx.type === "JAR_TRANSFER";

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <Link href="/transactions" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <Icon name="ChevronLeft" size={16} /> Quay lại danh sách
      </Link>

      <Card>
        <CardContent className="p-5 sm:p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <Badge tone={isIncome ? "success" : isExpense ? "danger" : "brand"}>
                {TRANSACTION_TYPE_LABEL[tx.type as TransactionType]}
              </Badge>
              {tx.isDeleted ? (
                <Badge tone="muted" className="ml-2">
                  Đã xóa
                </Badge>
              ) : null}
            </div>
            <p className="text-xs text-muted">{formatDateTime(tx.date)}</p>
          </div>

          <p
            className={`mb-1 text-3xl font-bold ${
              isIncome ? "text-success" : isExpense ? "text-danger" : "text-foreground"
            }`}
          >
            {isIncome ? "+" : isExpense ? "-" : ""}
            {formatMoney(tx.amount)}
          </p>
          {tx.category ? <p className="mb-4 text-sm text-muted">{tx.category.name}</p> : null}

          <dl className="space-y-2.5 border-t border-border pt-4 text-sm">
            {isExpense || isIncome ? (
              <>
                <Row label="Tài khoản" value={tx.account?.name ?? "—"} />
                {isExpense ? <Row label="Chiếc lọ" value={tx.jar?.name ?? (tx.splits.length ? "Chia nhiều lọ" : "—")} /> : null}
                <Row label={isIncome ? "Người tạo thu nhập" : "Người chi"} value={tx.payer?.name ?? "—"} />
                {isExpense ? (
                  <Row
                    label="Chi cho"
                    value={
                      tx.isShared
                        ? "Cả gia đình"
                        : tx.beneficiaries.map((b) => b.member.name).join(", ") || "—"
                    }
                  />
                ) : null}
                {isExpense ? (
                  <Row
                    label="Mức độ cần thiết"
                    value={tx.necessity ? NECESSITY_LABEL[tx.necessity as NecessityLevel] : "—"}
                  />
                ) : null}
                <Row label="Hình thức thanh toán" value={PAYMENT_METHOD_LABEL[tx.paymentMethod as PaymentMethod]} />
                <Row label="Trạng thái" value={PAYMENT_STATUS_LABEL[tx.status as PaymentStatus]} />
                <Row label="Loại chi phí" value={tx.isFixed ? "Cố định" : "Phát sinh"} />
                {tx.location ? <Row label="Địa điểm" value={tx.location} /> : null}
              </>
            ) : null}

            {tx.type === "ACCOUNT_TRANSFER" ? (
              <>
                <Row label="Từ tài khoản" value={tx.account?.name ?? "—"} />
                <Row label="Đến tài khoản" value={tx.toAccount?.name ?? "—"} />
              </>
            ) : null}
            {tx.type === "JAR_TRANSFER" ? (
              <>
                <Row label="Từ lọ" value={tx.jar?.name ?? "—"} />
                <Row label="Đến lọ" value={tx.toJar?.name ?? "—"} />
              </>
            ) : null}

            <Row label="Người nhập" value={tx.createdBy.name} />
            {tx.note ? <Row label="Ghi chú" value={tx.note} /> : null}
          </dl>

          {tx.splits.length > 0 ? (
            <div className="mt-4 border-t border-border pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Chia nhỏ giao dịch</p>
              <div className="space-y-1.5">
                {tx.splits.map((s) => (
                  <div key={s.id} className="flex justify-between text-sm">
                    <span className="text-muted">{s.category?.name ?? "—"}</span>
                    <span className="font-medium">{formatMoney(s.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {tx.jarAllocations.length > 0 ? (
            <div className="mt-4 border-t border-border pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Đã phân bổ vào 6 lọ</p>
              <div className="space-y-1.5">
                {tx.jarAllocations.map((a) => (
                  <div key={a.id} className="flex justify-between text-sm">
                    <span className="text-muted">{a.jar.name}</span>
                    <span className="font-medium">{formatMoney(a.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <AttachmentSection
            transactionId={tx.id}
            attachmentUrl={tx.attachmentUrl}
            driveConfigured={isGoogleDriveConfigured()}
          />
        </CardContent>
      </Card>

      <TransactionDetailActions
        transaction={{
          id: tx.id,
          isDeleted: tx.isDeleted,
          canEditCore: tx.splits.length === 0,
          note: tx.note,
          necessity: tx.necessity,
          paymentMethod: tx.paymentMethod,
          status: tx.status,
          isFixed: tx.isFixed,
          location: tx.location,
          isShared: tx.isShared,
          beneficiaryIds: tx.beneficiaries.map((b) => b.memberId),
        }}
        isExpense={isExpense}
        isTransfer={isTransfer}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
