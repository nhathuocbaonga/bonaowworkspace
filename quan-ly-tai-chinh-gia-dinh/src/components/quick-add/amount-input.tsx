"use client";

function formatDigits(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return new Intl.NumberFormat("vi-VN").format(Number(digits));
}

export function AmountInput({
  value,
  onChange,
  autoFocus,
  placeholder = "0",
}: {
  value: number;
  onChange: (value: number) => void;
  autoFocus?: boolean;
  placeholder?: string;
}) {
  const display = value > 0 ? new Intl.NumberFormat("vi-VN").format(value) : "";

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 focus-within:ring-2 focus-within:ring-brand/40 focus-within:border-brand">
      <input
        inputMode="numeric"
        autoFocus={autoFocus}
        value={display}
        placeholder={placeholder}
        onChange={(e) => {
          const formatted = formatDigits(e.target.value);
          const numeric = Number(formatted.replace(/\D/g, "")) || 0;
          onChange(numeric);
        }}
        className="w-full bg-transparent text-3xl font-bold tracking-tight text-foreground outline-none placeholder:text-muted/50"
      />
      <span className="text-lg font-semibold text-muted">đ</span>
    </div>
  );
}
