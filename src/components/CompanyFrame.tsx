import { useState } from "react";
import { ExternalLink, Loader2, RotateCw } from "lucide-react";
import type { Company } from "@/data/mock";

export function CompanyFrame({ company }: { company: Company }) {
  const [key, setKey] = useState(0);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    setLoading(true);
    setKey((k) => k + 1);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-6 py-3">
        <div className="flex items-center gap-2.5">
          <span className="size-3 rounded-[3px]" style={{ backgroundColor: company.color }} />
          <h1 className="text-[15px] font-semibold text-foreground">{company.name}</h1>
          <span className="text-xs text-text-tertiary">dashboard completo</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={reload}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-sunken px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <RotateCw className="size-3.5" /> Atualizar
          </button>
          <a
            href={company.dashboardUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-sunken px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ExternalLink className="size-3.5" /> Abrir original
          </a>
        </div>
      </div>

      <div className="relative flex-1 bg-surface-sunken">
        <iframe
          key={key}
          src={company.dashboardUrl}
          title={`Dashboard ${company.name}`}
          onLoad={() => setLoading(false)}
          className="size-full border-0"
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-sunken">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="size-6 animate-spin" style={{ color: company.color }} />
              <p className="text-xs text-muted-foreground">Carregando dashboard…</p>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border bg-surface px-6 py-2 text-[11px] text-text-tertiary">
        {company.sourceNote} · Origem: {company.repo}
      </div>
    </div>
  );
}
