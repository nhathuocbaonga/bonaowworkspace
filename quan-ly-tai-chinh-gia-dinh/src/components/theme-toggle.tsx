"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  // Đọc class do ThemeScript gắn trước hydrate (tránh nháy sáng/tối) — cố ý đặt
  // state ban đầu là false ở server rồi đồng bộ lại ở client để không lệch hydrate.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      className="flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:bg-black/5 dark:hover:bg-white/10"
      aria-label="Đổi giao diện sáng/tối"
      title="Đổi giao diện sáng/tối"
    >
      <Icon name={isDark ? "Sun" : "Moon"} size={18} />
    </button>
  );
}
