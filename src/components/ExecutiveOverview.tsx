import { useState } from "react";
import {
  Bell,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronRight,
  CircleDollarSign,
  Gauge,
  Menu,
  RefreshCw,
  Search,
  TrendingUp,
  TriangleAlert,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UnidadeId } from "@/config/dashboards";
import type { ResumoGrupo } from "@/hooks/useResumoGrupo";
import { useVisaoGrupo } from "@/hooks/useVisaoGrupo";
import { CREAM, MainChart, MapaExecutivo, Sparkline, Vazio, brl, dataHora, pct, statusCor } from "@/components/executive-shared";

type Visualizacao = "consolidada" | "empresa" | "area";

interface ExecutiveOverviewProps {
  resumo: ResumoGrupo;
  onNavigate: (id: UnidadeId) => void;
  onOpenMenu: () => void;
}

function SkeletonDashboard() {
  return (
    <div className="min-h-full space-y-4 p-4 lg:p-6" style={{ backgroundColor: CREAM.bg }}>
      <div className="h-16 animate-pulse rounded-xl" style={{ backgroundColor: CREAM.card }} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <div key={item} className="h-32 animate-pulse rounded-xl" style={{ backgroundColor: CREAM.card }} />)}
      </div>
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.8fr)_minmax(300px,0.8fr)]">
        <div className="h-80 animate-pulse rounded-xl" style={{ backgroundColor: CREAM.card }} />
        <div className="h-80 animate-pulse rounded-xl" style={{ backgroundColor: CREAM.card }} />
      </div>
    </div>
  );
}

export default function ExecutiveOverview({ resumo, onNavigate, onOpenMenu }: ExecutiveOverviewProps) {
  const [view, setView] = useState<Visualizacao>("consolidada");
  const [search, setSearch] = useState("");

  const {
    sources, companies, chartValues, realizado, meta, progresso, saldo, comMeta, abaixoDaMeta,
    lider, aoVivo, mesesComDados, mesesRestantes, projecaoAnual, ritmoAtual, ritmoNecessario,
    ultimaAtualizacao, saudeTexto,
  } = useVisaoGrupo(resumo);

  const filteredCompanies = companies.filter((company) => company.nome.toLowerCase().includes(search.toLowerCase()));

  const refresh = () => resumo.recarregar();

  const selectView = (next: Visualizacao) => {
    setView(next);
    if (next === "empresa") document.querySelector("#performance-empresas")?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (next === "area") document.querySelector("#atencao-diretoria")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  if (resumo.carregando) return <SkeletonDashboard />;

  const saudeTextoCompleto = `O Grupo NOW está ${pct(progresso ?? 0)} da meta anual, ${saudeTexto}.`;

  const kpis = [
    { label: "Receita realizada no ano", value: brl(realizado), note: `${sources.length} empresas consolidadas`, icon: CircleDollarSign, progress: undefined as number | undefined },
    { label: "% da meta anual", value: progresso !== undefined ? pct(progresso) : "—", note: progresso !== undefined ? (progresso >= 100 ? "meta atingida" : `${pct(100 - progresso)} para a meta`) : "sem meta", icon: Gauge, progress: progresso },
    { label: "Projeção anual", value: projecaoAnual !== undefined ? brl(projecaoAnual, true) : "—", note: projecaoAnual !== undefined && meta > 0 ? `${projecaoAnual >= meta ? "+" : ""}${brl(projecaoAnual - meta, true)} vs. meta` : `${mesesComDados} mês(es) com dados`, icon: TrendingUp, progress: meta > 0 && projecaoAnual !== undefined ? (projecaoAnual / meta) * 100 : undefined },
    { label: "Falta para a meta", value: meta > 0 ? brl(saldo) : "—", note: saldo === 0 && meta > 0 ? "meta anual atingida" : "ainda restante no ano", icon: WalletCards, progress: progresso },
  ];

  return (
    <div className="min-h-full" style={{ backgroundColor: CREAM.bg, color: CREAM.text }}>
      <div className="sticky top-0 z-20 border-b backdrop-blur" style={{ borderColor: CREAM.border, backgroundColor: `${CREAM.bg}F2` }}>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 lg:px-6">
          <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2 lg:block">
            <Button variant="ghost" size="icon" onClick={onOpenMenu} aria-label="Abrir menu" title="Abrir menu" className="lg:hidden"><Menu className="size-5" /></Button>
            <label className="relative block min-w-0 max-w-xl">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2" style={{ color: CREAM.muted }} aria-hidden="true" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por empresa..."
                className="h-10 w-full rounded-md border pl-10 pr-3 text-sm outline-none transition-colors"
                style={{ borderColor: CREAM.border, backgroundColor: CREAM.card, color: CREAM.text }}
              />
            </label>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" size="sm" className="hidden gap-2 md:flex" style={{ borderColor: CREAM.border, backgroundColor: CREAM.card, color: CREAM.text }}><CalendarDays className="size-4" />Ano corrente</Button>
            {ultimaAtualizacao && (
              <span className="hidden items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-medium md:flex" style={{ borderColor: `${CREAM.accent}4D`, backgroundColor: `${CREAM.accent}1A`, color: CREAM.accent }}>
                <span className="size-1.5 rounded-full" style={{ backgroundColor: CREAM.accent }} />Atualizado às {dataHora(ultimaAtualizacao).split(" ").pop()}
              </span>
            )}
            <Button variant="outline" size="icon" onClick={refresh} disabled={resumo.carregando} aria-label="Atualizar dados" title="Atualizar dados" style={{ borderColor: CREAM.border, backgroundColor: CREAM.card, color: CREAM.text }}><RefreshCw className={`size-4 ${resumo.carregando ? "animate-spin" : ""}`} /></Button>
            <Button variant="ghost" size="icon" aria-label="Notificações" title="Notificações" className="relative" style={{ color: CREAM.text }}><Bell className="size-4" /></Button>
            <Button variant="secondary" size="icon" aria-label="Perfil" title="Perfil" className="rounded-full text-xs font-semibold" style={{ backgroundColor: CREAM.dark, color: CREAM.card }}>GR</Button>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4 lg:p-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold lg:text-2xl">Visão geral</h1>
            <p className="mt-1 text-sm" style={{ color: CREAM.muted }}>Acompanhe os principais indicadores e o desempenho das empresas do grupo.</p>
          </div>
          <div className="hidden rounded-md border p-1 sm:flex" style={{ borderColor: CREAM.border, backgroundColor: CREAM.card }}>
            {(["consolidada", "empresa", "area"] as const).map((option) => (
              <Button
                key={option}
                size="sm"
                variant="ghost"
                onClick={() => selectView(option)}
                className="h-8 text-xs"
                style={view === option ? { backgroundColor: CREAM.dark, color: CREAM.card } : { color: CREAM.muted }}
              >
                {option === "consolidada" ? "Visão consolidada" : option === "empresa" ? "Por empresa" : "Atenção"}
              </Button>
            ))}
          </div>
        </div>

        {/* Saúde do grupo — resumo textual calculado sobre os números reais */}
        <div className="relative overflow-hidden rounded-2xl border p-4 shadow-[0_1px_3px_rgba(43,42,33,0.06)]" style={{ borderColor: CREAM.border, backgroundColor: CREAM.card }}>
          <svg className="pointer-events-none absolute inset-y-0 right-0 h-full w-2/3 opacity-[0.08]" viewBox="0 0 600 140" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0,90 C80,40 160,130 240,80 C320,30 400,110 480,60 C540,25 580,55 600,40" fill="none" stroke={CREAM.accent} strokeWidth="3" />
            <path d="M0,110 C90,70 170,140 260,100 C340,65 420,120 500,85 C550,60 580,80 600,70" fill="none" stroke={CREAM.accent} strokeWidth="2" opacity="0.6" />
          </svg>
          <div className="relative flex items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-full shadow-sm" style={{ backgroundColor: CREAM.accent, color: CREAM.card }}>
              <ChartNoAxesCombined className="size-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: CREAM.accent }}>Saúde do Grupo NOW</h2>
              <p className="mt-1 text-sm" style={{ color: CREAM.text }}>{saudeTextoCompleto}</p>
            </div>
            <ChevronRight className="ml-auto hidden size-5 shrink-0 sm:block" style={{ color: CREAM.muted }} aria-hidden="true" />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((item) => (
            <article
              key={item.label}
              className="group min-w-0 rounded-2xl border p-4 shadow-[0_1px_3px_rgba(43,42,33,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(43,42,33,0.08)]"
              style={{ borderColor: CREAM.border, backgroundColor: CREAM.card }}
            >
              <div className="flex items-center gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-full" style={{ backgroundColor: `${CREAM.accent}17`, color: CREAM.accent }}><item.icon className="size-5" /></div>
                <p className="min-w-0 flex-1 text-[11px] font-semibold uppercase leading-snug" style={{ color: CREAM.muted }}>{item.label}</p>
                <ChevronRight className="size-4 shrink-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100" style={{ color: CREAM.muted }} aria-hidden="true" />
              </div>
              <div className="mt-4 min-w-0">
                <strong className="block truncate text-xl tabular-nums" style={{ color: CREAM.text }}>{item.value}</strong>
                <p className="mt-2 text-[11px]" style={{ color: CREAM.muted }}>{item.note}</p>
                {item.progress !== undefined && (
                  <div className="mt-3 h-1 w-full overflow-hidden rounded-full" style={{ backgroundColor: CREAM.border }}>
                    <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${Math.min(100, Math.max(0, item.progress))}%`, backgroundColor: CREAM.accent }} />
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.72fr)_minmax(330px,0.78fr)]">
          <section className="rounded-2xl border p-4 shadow-[0_1px_3px_rgba(43,42,33,0.06)] lg:p-5" style={{ borderColor: CREAM.border, backgroundColor: CREAM.card }}>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold"><ChartNoAxesCombined className="size-4" style={{ color: CREAM.accent }} />Evolução do grupo</h2>
                <p className="mt-1 text-xs" style={{ color: CREAM.muted }}>Realizado x meta — somente empresas que publicam série mensal.</p>
              </div>
              <div className="flex items-center gap-3 text-[11px]" style={{ color: CREAM.muted }}>
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm" style={{ backgroundColor: CREAM.accent }} />Realizado</span>
                <span className="flex items-center gap-1.5"><span className="h-0.5 w-3" style={{ backgroundImage: `repeating-linear-gradient(90deg,${CREAM.dark} 0 3px,transparent 3px 6px)` }} />Meta</span>
              </div>
            </div>
            {chartValues.length > 1 ? <MainChart values={chartValues} metaAno={meta} /> : <Vazio texto="Nenhuma empresa publica série mensal no momento." />}
          </section>

          <section id="atencao-diretoria" className="rounded-2xl border p-4 shadow-[0_1px_3px_rgba(43,42,33,0.06)] lg:p-5" style={{ borderColor: CREAM.border, backgroundColor: CREAM.card }}>
            <h2 className="flex items-center gap-2 text-sm font-semibold"><TriangleAlert className="size-4" style={{ color: CREAM.warn }} />Atenção da diretoria</h2>
            <p className="mt-1 text-xs" style={{ color: CREAM.muted }}>{abaixoDaMeta.length} ponto(s) de atenção — empresas abaixo da meta.</p>
            <div className="mt-4 space-y-1">
              {comMeta.length === 0 && <Vazio texto="Nenhuma empresa com meta cadastrada." />}
              {[...comMeta].sort((a, b) => (a.source?.progresso ?? 0) - (b.source?.progresso ?? 0)).map((company) => {
                const progressoEmpresa = company.source?.progresso ?? 0;
                const cor = statusCor(progressoEmpresa);
                return (
                  <button key={company.id} onClick={() => onNavigate(company.id)} className="group grid w-full grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 rounded-lg p-2 text-left transition-colors" style={{ backgroundColor: "transparent" }}>
                    <span className="grid size-8 shrink-0 place-items-center rounded-full" style={{ backgroundColor: `${cor}1F` }}>
                      <span className="size-2.5 rounded-full" style={{ backgroundColor: cor }} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-medium" style={{ color: CREAM.text }}>{company.nome}</span>
                      <span className="block truncate text-[10px]" style={{ color: CREAM.muted }}>{brl(company.value, true)} de {brl(company.meta ?? 0, true)}</span>
                    </span>
                    <strong className="shrink-0 text-xs tabular-nums" style={{ color: cor }}>{pct(progressoEmpresa)}</strong>
                    <ChevronRight className="size-4 shrink-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100" style={{ color: CREAM.muted }} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <section id="performance-empresas" className="rounded-2xl border p-4 shadow-[0_1px_3px_rgba(43,42,33,0.06)] lg:p-5" style={{ borderColor: CREAM.border, backgroundColor: CREAM.card }}>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div>
              <h2 className="text-sm font-semibold">Performance por empresa</h2>
              <p className="mt-1 text-xs" style={{ color: CREAM.muted }}>Resultado real no ano corrente, empresa a empresa.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {filteredCompanies.length ? filteredCompanies.map((company) => {
              const progressoEmpresa = company.source?.progresso;
              const cor = statusCor(progressoEmpresa);
              const statusLabel = progressoEmpresa === undefined ? "sem meta" : progressoEmpresa >= 100 ? "Acima da meta" : progressoEmpresa >= 70 ? "Em atenção" : "Abaixo da meta";
              return (
                <button key={company.id} onClick={() => onNavigate(company.id)} className="group min-w-0 rounded-xl border p-3 text-left shadow-[0_1px_2px_rgba(43,42,33,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(43,42,33,0.08)]" style={{ borderColor: CREAM.border, backgroundColor: CREAM.cardSoft }}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2 text-xs font-medium" style={{ color: CREAM.text }}>
                      <span className="grid size-6 shrink-0 place-items-center rounded-full" style={{ backgroundColor: `${company.cor}26` }}>
                        <span className="size-2 rounded-full" style={{ backgroundColor: company.cor }} />
                      </span>
                      <span className="truncate">{company.nome}</span>
                    </span>
                    <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ color: cor, backgroundColor: `${cor}24` }}>{statusLabel}</span>
                  </div>
                  <p className="mt-3 text-lg font-semibold tabular-nums" style={{ color: CREAM.text }}>{progressoEmpresa !== undefined ? pct(progressoEmpresa) : "—"}</p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: CREAM.border }}>
                    <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${Math.min(100, progressoEmpresa ?? 0)}%`, backgroundColor: cor }} />
                  </div>
                  <p className="mt-2 text-[11px] tabular-nums" style={{ color: CREAM.muted }}>{brl(company.value, true)} / {company.meta ? brl(company.meta, true) : "sem meta"}</p>
                  <Sparkline values={company.serie} color={company.cor} />
                </button>
              );
            }) : <div className="col-span-full py-10 text-center text-sm" style={{ color: CREAM.muted }}>Nenhuma empresa encontrada.</div>}
          </div>
        </section>

        <section className="rounded-2xl border p-4 shadow-[0_1px_3px_rgba(43,42,33,0.06)] lg:p-5" style={{ borderColor: CREAM.border, backgroundColor: CREAM.card }}>
          <h2 className="text-sm font-semibold">Receita e faturamento</h2>
          <p className="mt-1 text-xs" style={{ color: CREAM.muted }}>Ritmo real contra o necessário para bater a meta.</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Receita acumulada", value: brl(realizado, true), sub: meta > 0 ? `${pct(progresso ?? 0)} da meta` : "sem meta" },
              { label: "Meta anual", value: meta > 0 ? brl(meta, true) : "sem meta", sub: `${comMeta.length} empresa(s) com meta` },
              { label: "Projeção anual", value: projecaoAnual !== undefined ? brl(projecaoAnual, true) : "—", sub: `${mesesComDados} mês(es) com dados` },
              { label: "Falta para a meta", value: meta > 0 ? brl(saldo, true) : "—", sub: `${mesesRestantes} mês(es) restantes` },
            ].map((item) => (
              <div key={item.label} className="min-w-0 rounded-xl border p-3" style={{ borderColor: CREAM.border, backgroundColor: CREAM.cardSoft }}>
                <p className="truncate text-[10px] uppercase" style={{ color: CREAM.muted }}>{item.label}</p>
                <strong className="mt-1 block truncate text-sm tabular-nums" style={{ color: CREAM.text }}>{item.value}</strong>
                <p className="mt-1 truncate text-[10px]" style={{ color: CREAM.muted }}>{item.sub}</p>
              </div>
            ))}
          </div>
          {mesesRestantes > 0 && (
            <div className="mt-4 rounded-xl border p-3" style={{ borderColor: CREAM.border, backgroundColor: CREAM.cardSoft }}>
              <div className="flex items-center justify-between text-[11px]" style={{ color: CREAM.muted }}><span>Ritmo atual</span><span>Ritmo necessário</span></div>
              <div className="relative mt-2 h-2.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: CREAM.border }}>
                <div className="h-full rounded-full" style={{ width: `${Math.min(100, (ritmoAtual / Math.max(ritmoAtual, ritmoNecessario, 1)) * 100)}%`, backgroundColor: CREAM.accent }} />
                <div className="absolute inset-y-0 w-px" style={{ left: `${Math.min(100, (ritmoNecessario / Math.max(ritmoAtual, ritmoNecessario, 1)) * 100)}%`, backgroundColor: CREAM.dark }} />
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[11px] tabular-nums"><span style={{ color: CREAM.accent }}>{brl(ritmoAtual, true)}/mês</span><span style={{ color: CREAM.muted }}>{brl(ritmoNecessario, true)}/mês</span></div>
            </div>
          )}
        </section>

        <MapaExecutivo
          companies={companies}
          progresso={progresso}
          aoVivo={aoVivo}
          totalFontes={sources.length}
          liderNome={lider?.nome}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}
