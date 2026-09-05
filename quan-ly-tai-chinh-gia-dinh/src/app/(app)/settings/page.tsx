import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { FamilySettingsForm } from "@/components/settings/family-settings-form";
import { CategoryManager } from "@/components/settings/category-manager";
import { TelegramLinkCard } from "@/components/settings/telegram-link-card";

export default async function SettingsPage() {
  const session = await requireSession();

  const [family, categories, telegramLink] = await Promise.all([
    prisma.family.findUniqueOrThrow({ where: { id: session.familyId }, include: { settings: true } }),
    prisma.category.findMany({
      where: { familyId: session.familyId },
      orderBy: [{ group: "asc" }, { name: "asc" }],
    }),
    prisma.telegramLink.findFirst({ where: { familyId: session.familyId, memberId: session.memberId } }),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">Cài đặt</h1>
        <p className="text-sm text-muted">Quản lý thông tin gia đình và danh mục thu chi</p>
      </div>

      <FamilySettingsForm
        familyName={family.name}
        currency={family.settings?.currency ?? "VND"}
        jarMode={family.settings?.jarMode ?? "AUTO_ADJUSTABLE"}
      />

      <TelegramLinkCard isLinked={!!telegramLink} />

      <CategoryManager categories={categories} />
    </div>
  );
}
