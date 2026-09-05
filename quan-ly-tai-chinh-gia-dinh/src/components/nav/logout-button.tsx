"use client";

import { logoutAction } from "@/lib/actions/auth";
import { Icon } from "@/components/icon";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-black/5 hover:text-danger dark:hover:bg-white/10"
        title="Đăng xuất"
        aria-label="Đăng xuất"
      >
        <Icon name="LogOut" size={16} />
      </button>
    </form>
  );
}
