"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Icon } from "@/components/icon";
import type { NavItem } from "./nav-items";

export function NavLink({ item, compact = false }: { item: NavItem; compact?: boolean }) {
  const pathname = usePathname();
  const active = pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <Link
      href={item.href}
      className={clsx(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-brand-soft text-brand"
          : "text-muted hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5",
        compact && "flex-col gap-1 px-2 py-1.5 text-[11px]"
      )}
    >
      <Icon name={item.icon} size={compact ? 22 : 18} />
      <span className={compact ? "" : ""}>{item.label}</span>
    </Link>
  );
}
