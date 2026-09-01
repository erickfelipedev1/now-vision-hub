import { ArrowRight } from "lucide-react";
import { companies, kpis, type Period } from "@/data/mock";
import { Delta } from "./Delta";
import { RevenueChart } from "./RevenueChart";

const statusColor: Record<string, string> = {
  Saudável: "var(--good)",
  Atenção: "var(--warn)",
  Crítico: "var(--bad)",
};

export function Overview({
  period,
  onOpenCompany,
}: {
  period: Period;
  onOpenCompany: (id: "nlg" | "j4s") => void;
}) {
  return (
    <div className="space-y-5 p-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis[period].map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tabular-nums text-foreground">{k.value}</span>
              <Delta value={k.delta} />
            </div>
            <p className="mt-2 text-[11px] text-text-tertiary">{k.detail}</p>
          </div>
        ))}
      </div>

      <RevenueChart />

      <div className="grid gap-4 lg:grid-cols-2">
        {companies.map((c) => (
          <div key={c.id} className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="h-1" style={{ backgroundColor: c.color }} />
            <div className="p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[15px] font-semibold text-foreground">{c.name}</h3>
                <span
                  className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                  style={{ color: statusColor[c.status], backgroundColor: `${statusColor[c.status]}1A` }}
                >
                  {c.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {c.metrics.map((m) => (
                  <div key={m.label} className="rounded-lg bg-surface-sunken p-3">
                    <p className="text-[11px] text-text-tertiary">{m.label}</p>
                    <p className="mt-1 text-sm font-medium tabular-nums text-foreground">{m.value}</p>
                    <Delta value={m.delta} />
                  </div>
                ))}
              </div>

              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{c.context}</p>

              <button
                onClick={() => onOpenCompany(c.id)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
              >
                Abrir dashboard completo
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
