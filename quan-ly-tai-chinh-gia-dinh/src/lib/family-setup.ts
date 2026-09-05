import type { Prisma } from "@prisma/client";
import { JAR_CODES, JAR_DEFAULTS } from "@/lib/enums";
import { DEFAULT_CATEGORIES } from "@/lib/default-categories";

/** Tạo 6 lọ mặc định + bộ danh mục thu/chi + settings cho 1 gia đình mới.
 *  Dùng chung giữa luồng đăng ký và script seed dữ liệu mẫu. */
export async function setupDefaultFamilyData(
  tx: Prisma.TransactionClient,
  familyId: string
) {
  await tx.settings.create({ data: { familyId } });

  await tx.jar.createMany({
    data: JAR_CODES.map((code) => {
      const def = JAR_DEFAULTS[code];
      return {
        familyId,
        code,
        name: def.name,
        percentage: def.percentage,
        color: def.color,
        icon: def.icon,
      };
    }),
  });

  await tx.category.createMany({
    data: DEFAULT_CATEGORIES.map((cat) => ({
      familyId,
      type: cat.type,
      name: cat.name,
      group: cat.group,
      defaultJar: cat.defaultJar,
      defaultNecessity: cat.defaultNecessity,
      icon: cat.icon ?? "Wallet",
    })),
  });
}
