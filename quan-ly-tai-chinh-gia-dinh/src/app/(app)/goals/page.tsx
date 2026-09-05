import { requireSession } from "@/lib/session";
import { getGoalsWithProgress } from "@/lib/debts-goals";
import { getFamilyMembers } from "@/lib/data";
import { GoalsClient } from "@/components/goals/goals-client";

export default async function GoalsPage() {
  const session = await requireSession();
  const [goals, members] = await Promise.all([
    getGoalsWithProgress(session.familyId),
    getFamilyMembers(session.familyId),
  ]);

  return <GoalsClient goals={goals} members={members} />;
}
