"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { QuickAddModal } from "./quick-add-modal";

type QuickAddContextValue = {
  open: (type?: "EXPENSE" | "INCOME") => void;
};

const QuickAddContext = createContext<QuickAddContextValue | null>(null);

export function QuickAddProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialType, setInitialType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  // Tăng mỗi lần mở modal để ép QuickAddModal remount — có state khởi tạo mới hoàn
  // toàn (số tiền, bước, dữ liệu tham chiếu...) thay vì phải reset bằng effect.
  const [openKey, setOpenKey] = useState(0);

  const open = useCallback((type: "EXPENSE" | "INCOME" = "EXPENSE") => {
    setInitialType(type);
    setIsOpen(true);
    setOpenKey((k) => k + 1);
  }, []);

  const value = useMemo(() => ({ open }), [open]);

  return (
    <QuickAddContext.Provider value={value}>
      {children}
      <QuickAddModal key={openKey} open={isOpen} onClose={() => setIsOpen(false)} initialType={initialType} />
    </QuickAddContext.Provider>
  );
}

export function useQuickAdd() {
  const ctx = useContext(QuickAddContext);
  if (!ctx) throw new Error("useQuickAdd phải được dùng trong QuickAddProvider");
  return ctx;
}
