"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { JAR_MODES, CATEGORY_TYPES, JAR_CODES } from "@/lib/enums";

const familySchema = z.object({
  name: z.string().min(1),
  currency: z.string().min(1),
  jarMode: z.enum(JAR_MODES),
});

export async function updateFamilySettingsAction(input: z.infer<typeof familySchema>) {
  const session = await requireAdmin();
  const parsed = familySchema.parse(input);

  await prisma.$transaction([
    prisma.family.update({ where: { id: session.familyId }, data: { name: parsed.name, currency: parsed.currency } }),
    prisma.settings.upsert({
      where: { familyId: session.familyId },
      update: { currency: parsed.currency, jarMode: parsed.jarMode },
      create: { familyId: session.familyId, currency: parsed.currency, jarMode: parsed.jarMode },
    }),
  ]);

  revalidatePath("/settings");
  revalidatePath("/dashboard");
}

const categorySchema = z.object({
  type: z.enum(CATEGORY_TYPES),
  name: z.string().min(1, "Vui lòng nhập tên danh mục"),
  group: z.string().min(1, "Vui lòng nhập nhóm"),
  defaultJar: z.enum(JAR_CODES).optional(),
  icon: z.string().default("Wallet"),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export async function createCategoryAction(input: CategoryInput) {
  const session = await requireAdmin();
  const parsed = categorySchema.parse(input);
  await prisma.category.create({
    data: {
      familyId: session.familyId,
      type: parsed.type,
      name: parsed.name,
      group: parsed.group,
      defaultJar: parsed.type === "EXPENSE" ? parsed.defaultJar : null,
      icon: parsed.icon,
    },
  });
  revalidatePath("/settings");
}

export async function toggleCategoryActiveAction(id: string, isActive: boolean) {
  const session = await requireAdmin();
  await prisma.category.update({
    where: { id, familyId: session.familyId },
    data: { isActive },
  });
  revalidatePath("/settings");
}
