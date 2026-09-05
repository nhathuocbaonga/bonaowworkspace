"use server";

import { requireSession } from "@/lib/session";
import { getFamilyMembers, getAccounts, getCategories, getJars } from "@/lib/data";

export async function getQuickAddRefDataAction() {
  const session = await requireSession();
  const [members, accounts, incomeCategories, expenseCategories, jars] = await Promise.all([
    getFamilyMembers(session.familyId),
    getAccounts(session.familyId),
    getCategories(session.familyId, "INCOME"),
    getCategories(session.familyId, "EXPENSE"),
    getJars(session.familyId),
  ]);

  return {
    session,
    members,
    accounts,
    incomeCategories,
    expenseCategories,
    jars,
  };
}
