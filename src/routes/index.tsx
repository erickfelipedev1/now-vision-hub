import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar, type View } from "@/components/Sidebar";
import { Overview } from "@/components/Overview";
import { CompanyFrame } from "@/components/CompanyFrame";
import { companies, periods, type Period } from "@/data/mock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Portal Grupo Now — Painel executivo" },
      {
        name: "description",
        content:
          "Painel executivo do Grupo Now: KPIs consolidados, receita por unidade e dashboards da NLG Comex e Jornada 4S em um só lugar.",
      },
      { property: "og:title", content: "Portal Grupo Now — Painel executivo" },
      {
        property: "og:description",
        content:
          "Acompanhe receita, pipeline e desempenho das empresas do Grupo Now em um painel executivo único.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Portal,
});

function Portal() {
  const [view, setView] = useState<View>("overview");
  const [period, setPeriod] = useState<Period>("30 dias");
  const [menuOpen, setMenuOpen] = useState(false);

  const company = companies.find((c) => c.id === view);
  const navigate = (v: View) => {
    setView(v);
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar view={view} onNavigate={navigate} open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex min-h-screen flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-surface px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              className="text-muted-foreground lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="size-5" />
            </button>
            <div>
              <h1 className="text-sm font-semibold text-foreground">
                {company ? company.name : "Visão geral"}
              </h1>
              <p className="text-[11px] text-text-tertiary">
                {company ? "Dashboard embedado" : "Consolidado do grupo"}
              </p>
            </div>
          </div>

          {!company && (
            <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-sunken p-1">
              {periods.map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
                    period === p
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto">
          {company ? (
            <div className="h-[calc(100vh-4rem)]">
              <CompanyFrame company={company} />
            </div>
          ) : (
            <Overview period={period} onOpenCompany={(id) => setView(id)} />
          )}
        </main>
      </div>
    </div>
  );
}
