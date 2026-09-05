export function formatMoney(amount: number, currency = "VND"): string {
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat("vi-VN").format(Math.abs(rounded));
  const sign = rounded < 0 ? "-" : "";
  if (currency === "VND") return `${sign}${formatted} đ`;
  return `${sign}${formatted} ${currency}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(d);
}

export function toDateInputValue(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 10);
}

export function monthLabel(month: number, year: number): string {
  return `Tháng ${month}/${year}`;
}

export const VIETNAM_MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
