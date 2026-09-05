"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { formatMoney } from "@/lib/format";
import { ACCOUNT_TYPE_LABEL, type AccountType } from "@/lib/enums";
import { AccountFormModal } from "./account-form-modal";
import { AccountTransferModal } from "./account-transfer-modal";
import type { AccountWithBalance } from "@/lib/finance";

type Member = { id: string; name: string };

export function AccountsClient({
  accounts,
  members,
}: {
  accounts: AccountWithBalance[];
  members: Member[];
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [editing, setEditing] = useState<AccountWithBalance | null>(null);

  const totalAssets = accounts.filter((a) => a.type !== "CREDIT_CARD").reduce((s, a) => s + a.balance, 0);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Tài khoản tiền</h1>
          <p className="text-sm text-muted">Tổng tài sản: {formatMoney(totalAssets)}</p>
        </div>
        <div className="flex gap-2">
          {accounts.length >= 2 ? (
            <Button variant="outline" size="sm" onClick={() => setTransferOpen(true)}>
              <Icon name="ArrowLeftRight" size={14} /> Chuyển tiền
            </Button>
          ) : null}
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Icon name="Plus" size={14} /> Thêm tài khoản
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {accounts.map((a) => (
          <Card key={a.id}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                <Icon name={a.type === "CREDIT_CARD" ? "CreditCard" : "Banknote"} size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{a.name}</p>
                <p className="text-xs text-muted">{ACCOUNT_TYPE_LABEL[a.type as AccountType]}</p>
              </div>
              <div className="text-right">
                {a.type === "CREDIT_CARD" ? (
                  <p className="font-semibold text-danger">Dư nợ {formatMoney(Math.max(0, -a.balance))}</p>
                ) : (
                  <p className={`font-semibold ${a.balance < 0 ? "text-danger" : ""}`}>{formatMoney(a.balance)}</p>
                )}
              </div>
              <button
                onClick={() => {
                  setEditing(a);
                  setFormOpen(true);
                }}
                className="rounded-lg p-2 text-muted hover:bg-black/5 dark:hover:bg-white/10"
                aria-label="Sửa"
              >
                <Icon name="Pencil" size={16} />
              </button>
            </CardContent>
          </Card>
        ))}
        {accounts.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">Chưa có tài khoản nào. Thêm tài khoản đầu tiên của bạn.</p>
        ) : null}
      </div>

      <AccountFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        members={members}
        initial={
          editing
            ? {
                id: editing.id,
                name: editing.name,
                type: editing.type as AccountType,
                ownerMemberId: editing.ownerMemberId ?? undefined,
                openingBalance: editing.openingBalance,
                note: editing.note ?? undefined,
              }
            : undefined
        }
      />
      <AccountTransferModal open={transferOpen} onClose={() => setTransferOpen(false)} accounts={accounts} />
    </div>
  );
}
