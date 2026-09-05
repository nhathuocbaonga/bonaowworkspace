"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Icon } from "@/components/icon";
import { PRIMARY_NAV, SECONDARY_NAV } from "./nav-items";
import { useQuickAdd } from "@/components/quick-add/context";
import { Modal } from "@/components/ui/modal";
import { ThemeToggle } from "@/components/theme-toggle";
import { logoutAction } from "@/lib/actions/auth";

export function BottomNav() {
  const pathname = usePathname();
  const { open } = useQuickAdd();
  const [moreOpen, setMoreOpen] = useState(false);
  const tabs = [PRIMARY_NAV[0], PRIMARY_NAV[1]];
  const tabsRight = [PRIMARY_NAV[2], PRIMARY_NAV[3]];

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-surface/95 backdrop-blur px-2 pb-[env(safe-area-inset-bottom)] pt-1.5 md:hidden">
        {tabs.map((item) => (
          <MobileTab key={item.href} href={item.href} label={item.label} icon={item.icon} active={pathname.startsWith(item.href)} />
        ))}

        <button
          onClick={() => open("EXPENSE")}
          className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-lg shadow-brand/30"
          aria-label="Thêm giao dịch"
        >
          <Icon name="Plus" size={26} />
        </button>

        {tabsRight.map((item) => (
          <MobileTab key={item.href} href={item.href} label={item.label} icon={item.icon} active={pathname.startsWith(item.href)} />
        ))}

        <button
          onClick={() => setMoreOpen(true)}
          className="flex flex-col items-center gap-1 px-2 py-1.5 text-[11px] font-medium text-muted"
        >
          <Icon name="Menu" size={22} />
          Khác
        </button>
      </nav>

      <Modal open={moreOpen} onClose={() => setMoreOpen(false)} title="Menu">
        <div className="grid grid-cols-2 gap-2">
          {SECONDARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMoreOpen(false)}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border p-4 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5"
            >
              <Icon name={item.icon} size={22} />
              {item.label}
            </Link>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-border p-3">
          <span className="text-sm font-medium">Giao diện sáng / tối</span>
          <ThemeToggle />
        </div>
        <form action={logoutAction} className="mt-3">
          <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border py-3 text-sm font-medium text-danger">
            <Icon name="LogOut" size={16} />
            Đăng xuất
          </button>
        </form>
      </Modal>
    </>
  );
}

function MobileTab({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "flex flex-col items-center gap-1 px-2 py-1.5 text-[11px] font-medium",
        active ? "text-brand" : "text-muted"
      )}
    >
      <Icon name={icon} size={22} />
      {label}
    </Link>
  );
}
