import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function Delta({ value, className = "" }: { value: number; className?: string }) {
  const up = value >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium tabular-nums ${className}`}
      style={{ color: up ? "var(--good)" : "var(--bad)" }}
    >
      <Icon className="size-3.5" />
      {up ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}
