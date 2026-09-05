import { requireSession } from "@/lib/session";
import { getAccountBalances } from "@/lib/finance";
import { getFamilyMembers } from "@/lib/data";
import { AccountsClient } from "@/components/accounts/accounts-client";

export default async function AccountsPage() {
  const session = await requireSession();
  const [accounts, members] = await Promise.all([
    getAccountBalances(session.familyId),
    getFamilyMembers(session.familyId),
  ]);

  return <AccountsClient accounts={accounts} members={members} />;
}
