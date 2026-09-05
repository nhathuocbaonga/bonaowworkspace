import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getFamilyMembers, getAccounts, getCategories, getJars } from "@/lib/data";
import { RecurringClient } from "@/components/recurring/recurring-client";

export default async function RecurringPage() {
  const session = await requireSession();

  const [rules, incomeCategories, expenseCategories, accounts, jars, members] = await Promise.all([
    prisma.recurringRule.findMany({
      where: { familyId: session.familyId },
      orderBy: { nextRunDate: "asc" },
    }),
    getCategories(session.familyId, "INCOME"),
    getCategories(session.familyId, "EXPENSE"),
    getAccounts(session.familyId),
    getJars(session.familyId),
    getFamilyMembers(session.familyId),
  ]);

  const categories = [
    ...incomeCategories.map((c) => ({ id: c.id, name: c.name, type: "INCOME" })),
    ...expenseCategories.map((c) => ({ id: c.id, name: c.name, type: "EXPENSE" })),
  ];

  return (
    <RecurringClient
      rules={rules}
      categories={categories}
      accounts={accounts}
      jars={jars}
      members={members}
    />
  );
}
