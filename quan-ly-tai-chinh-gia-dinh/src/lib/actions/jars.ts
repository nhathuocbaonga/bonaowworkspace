"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { sumPercentage } from "@/lib/jar-math";

const jarUpdateSchema = z.array(
  z.object({ id: z.string().min(1), percentage: z.number().min(0).max(100) })
);
export type JarUpdateInput = z.infer<typeof jarUpdateSchema>;

export async function updateJarPercentagesAction(input: JarUpdateInput) {
  const session = await requireAdmin();
  const parsed = jarUpdateSchema.parse(input);

  const total = sumPercentage(parsed);
  if (Math.abs(total - 100) > 0.01) {
    throw new Error(`Tổng tỷ lệ 6 lọ phải bằng 100%. Hiện tại: ${total}%`);
  }

  await prisma.$transaction(
    parsed.map((jar) =>
      prisma.jar.update({
        where: { id: jar.id, familyId: session.familyId },
        data: { percentage: jar.percentage },
      })
    )
  );

  revalidatePath("/jars");
  revalidatePath("/dashboard");
}
