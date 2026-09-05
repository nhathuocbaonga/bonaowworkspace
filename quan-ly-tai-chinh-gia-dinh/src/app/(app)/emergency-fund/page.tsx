import { requireSession } from "@/lib/session";
import { getEmergencyFundStatus } from "@/lib/debts-goals";
import { getFamilyMembers } from "@/lib/data";
import { EmergencyFundClient } from "@/components/goals/emergency-fund-client";

export default async function EmergencyFundPage() {
  const session = await requireSession();
  const [status, members] = await Promise.all([
    getEmergencyFundStatus(session.familyId),
    getFamilyMembers(session.familyId),
  ]);

  return <EmergencyFundClient status={status} members={members} />;
}
