"use client";

import { useQuickAdd } from "./context";
import { Icon } from "@/components/icon";

export function QuickAddButton({ className, label }: { className?: string; label?: string }) {
  const { open } = useQuickAdd();
  return (
    <button
      onClick={() => open("EXPENSE")}
      className={
        className ??
        "flex h-14 w-14 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-lg shadow-brand/30 transition-transform hover:scale-105 active:scale-95"
      }
      aria-label="Thêm giao dịch"
    >
      <Icon name="Plus" size={label ? 18 : 26} />
      {label}
    </button>
  );
}
