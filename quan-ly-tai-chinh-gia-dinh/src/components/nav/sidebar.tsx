import { Icon } from "@/components/icon";
import { PRIMARY_NAV, SECONDARY_NAV } from "./nav-items";
import { NavLink } from "./nav-link";
import { LogoutButton } from "./logout-button";
import type { SessionPayload } from "@/lib/session";
import { MEMBER_ROLE_LABEL } from "@/lib/enums";

export function Sidebar({ session, familyName }: { session: SessionPayload; familyName: string }) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface md:flex">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-brand-foreground">
          <Icon name="PiggyBank" size={20} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{familyName}</p>
          <p className="text-xs text-muted">Sổ Thu Chi Gia Đình</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-1">
        {PRIMARY_NAV.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
        <div className="my-3 border-t border-border" />
        {SECONDARY_NAV.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
            style={{ background: "var(--brand)" }}
          >
            {session.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{session.name}</p>
            <p className="truncate text-xs text-muted">{MEMBER_ROLE_LABEL[session.role]}</p>
          </div>
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
