"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/icon";

export function Modal({
  open,
  onClose,
  title,
  children,
  widthClassName = "max-w-md",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  widthClassName?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        className={`relative z-10 w-full ${widthClassName} max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-surface border border-border shadow-xl animate-in`}
      >
        {title ? (
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface px-5 py-4 rounded-t-3xl sm:rounded-t-3xl">
            <h2 className="text-base font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-muted hover:bg-black/5 dark:hover:bg-white/10"
              aria-label="Đóng"
            >
              <Icon name="X" size={18} />
            </button>
          </div>
        ) : null}
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
