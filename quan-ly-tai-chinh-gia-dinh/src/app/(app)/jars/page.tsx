import { requireSession } from "@/lib/session";
import { getJarBalances } from "@/lib/finance";
import { JarsClient } from "@/components/jars/jars-client";

export default async function JarsPage() {
  const session = await requireSession();
  const jars = await getJarBalances(session.familyId);
  return <JarsClient jars={jars} />;
}
