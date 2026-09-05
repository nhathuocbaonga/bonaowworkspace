import { getCurrentFamily } from "@/lib/session";
import { Sidebar } from "@/components/nav/sidebar";
import { BottomNav } from "@/components/nav/bottom-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { QuickAddProvider } from "@/components/quick-add/context";
import { QuickAddButton } from "@/components/quick-add/quick-add-button";
import { Icon } from "@/components/icon";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { session, family } = await getCurrentFamily();

  return (
    <QuickAddProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar session={session} familyName={family.name} />

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-brand-foreground">
                <Icon name="PiggyBank" size={16} />
              </div>
              <p className="text-sm font-bold">{family.name}</p>
            </div>
            <ThemeToggle />
          </header>

          <header className="hidden items-center justify-end gap-2 border-b border-border bg-surface px-6 py-3 md:flex">
            <ThemeToggle />
            <QuickAddButton
              label="Thêm giao dịch"
              className="flex h-10 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-brand-foreground hover:opacity-90"
            />
          </header>

          <main className="flex-1 overflow-y-auto bg-background px-4 pb-24 pt-4 sm:px-6 sm:pb-8 md:pt-6">
            {children}
          </main>
        </div>

        <BottomNav />
      </div>
    </QuickAddProvider>
  );
}
