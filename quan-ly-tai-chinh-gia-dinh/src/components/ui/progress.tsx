import { clsx } from "clsx";

export function ProgressBar({
  percent,
  colorClass,
  trackClassName,
  className,
}: {
  percent: number;
  colorClass?: string;
  trackClassName?: string;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  const tone = colorClass ?? (percent >= 100 ? "bg-danger" : percent >= 90 ? "bg-warning" : "bg-brand");
  return (
    <div className={clsx("h-2 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10", trackClassName, className)}>
      <div
        className={clsx("h-full rounded-full transition-all", tone)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
