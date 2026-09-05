import { requireSession } from "@/lib/session";
import { getFamilyMembers } from "@/lib/data";
import { MembersClient } from "@/components/members/members-client";

export default async function MembersPage() {
  const session = await requireSession();
  const members = await getFamilyMembers(session.familyId);
  return <MembersClient members={members} currentMemberId={session.memberId} />;
}
