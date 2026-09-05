"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { createLinkCode } from "@/lib/telegram/link";

export async function generateTelegramLinkCodeAction() {
  const session = await requireSession();
  const code = await createLinkCode(session.familyId, session.memberId);
  return { code };
}

export async function unlinkTelegramAction() {
  const session = await requireSession();
  await prisma.telegramLink.deleteMany({ where: { familyId: session.familyId, memberId: session.memberId } });
  revalidatePath("/settings");
}
