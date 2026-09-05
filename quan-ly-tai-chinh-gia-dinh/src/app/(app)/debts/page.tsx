import { requireSession } from "@/lib/session";
import { getDebtsWithBalance, getReceivablesWithBalance } from "@/lib/debts-goals";
import { getFamilyMembers, getAccounts } from "@/lib/data";
import { DebtsClient } from "@/components/debts/debts-client";

export default async function DebtsPage() {
  const session = await requireSession();
  const [debts, receivables, members, accounts] = await Promise.all([
    getDebtsWithBalance(session.familyId),
    getReceivablesWithBalance(session.familyId),
    getFamilyMembers(session.familyId),
    getAccounts(session.familyId),
  ]);

  return <DebtsClient debts={debts} receivables={receivables} members={members} accounts={accounts} />;
}
