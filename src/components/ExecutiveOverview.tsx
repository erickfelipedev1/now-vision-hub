import { useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  ChartNoAxesCombined,
  CircleDollarSign,
  Gauge,
  Map,
  Menu,
  RefreshCw,
  Search,
  Target,
  TrendingUp,
  TriangleAlert,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UNIDADES, type UnidadeId } from "@/config/dashboards";
import type { ResumoGrupo } from "@/hooks/useResumoGrupo";

type Visualizacao = "consolidada" | "empresa" | "area";

interface ExecutiveOverviewProps {
  resumo: ResumoGrupo;
  onNavigate: (id: UnidadeId) => void;
  onOpenMenu: () => void;
}

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const brl = (value: number, compact = false) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    ...(compact
      ? { notation: "compact", maximumFractionDigits: 1 }
      : { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  });

const pct = (value: number) =>
  `${value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

const dataHora = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
};

/** Verde/âmbar/vermelho a partir do progresso real contra a meta — mesma régua do app inteiro. */
function statusCor(progresso: number | undefined) {
  if (progresso === undefined) return "var(--muted-foreground)";
  if (progresso >= 100) return "var(--good)";
  if (progresso >= 70) return "var(--warn)";
  return "var(--bad)";
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = Math.max(1, max - min);
  const points = values
    .map((value, index) => `${(index / (values.length - 1)) * 96 + 2},${31 - ((value - min) / span) * 25}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 36" className="h-9 w-24" aria-hidden="true">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SkeletonDashboard() {
  return (
    <div className="min-h-full space-y-4 bg-background p-4 lg:p-6">
      <div className="h-16 animate-pulse rounded-xl bg-card" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <div key={item} className="h-32 animate-pulse rounded-xl bg-card" />)}
      </div>
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.8fr)_minmax(300px,0.8fr)]">
        <div className="h-80 animate-pulse rounded-xl bg-card" />
        <div className="h-80 animate-pulse rounded-xl bg-card" />
      </div>
    </div>
  );
}

/**
 * Barras de receita realizada por mês + linha pontilhada de meta (ritmo linear
 * da meta anual real ao longo dos 12 meses). Sem dado fabricado: a meta vem
 * do total anual real já consolidado; só a distribuição mensal é projetada.
 */
function MainChart({ values, metaAno }: { values: { month: string; value: number }[]; metaAno: number }) {
  const [active, setActive] = useState(values.length - 1);
  const width = 820;
  const height = 270;
  const pad = { left: 58, right: 22, top: 24, bottom: 36 };
  const metaMensal = metaAno > 0 ? metaAno / 12 : 0;
  const max = Math.max(...values.map((point) => point.value), metaMensal, 1);
  const ceiling = Math.ceil(max / 1_000_000) * 1_000_000 || max;
  const chartWidth = width - pad.left - pad.right;
  const chartHeight = height - pad.top - pad.bottom;
  const barGap = 10;
  const barWidth = Math.max(8, chartWidth / values.length - barGap);
  const x = (index: number) => pad.left + (index / values.length) * chartWidth + (chartWidth / values.length - barWidth) / 2;
  const y = (value: number) => pad.top + chartHeight - (value / ceiling) * chartHeight;
  const ticks = [0, ceiling / 2, ceiling];
  const metaY = metaMensal > 0 ? y(Math.min(metaMensal, ceiling)) : null;

  return (
    <div className="relative mt-3 min-h-[250px]">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" onMouseLeave={() => setActive(values.length - 1)}>
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={pad.left} x2={width - pad.right} y1={y(tick)} y2={y(tick)} stroke="var(--border)" strokeDasharray="2 4" />
            <text x={pad.left - 12} y={y(tick) + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">
              {tick === 0 ? "R$ 0" : brl(tick, true)}
            </text>
          </g>
        ))}
        {values.map((point, index) => (
          <g key={point.month} onMouseEnter={() => setActive(index)} className="cursor-pointer">
            <rect
              x={x(index)}
              y={y(point.value)}
              width={barWidth}
              height={Math.max(0, pad.top + chartHeight - y(point.value))}
              rx="3"
              fill={active === index ? "var(--good)" : "color-mix(in oklch, var(--good) 45%, transparent)"}
              className="transition-colors duration-150"
            />
            <text x={x(index) + barWidth / 2} y={height - 10} textAnchor="middle" className="fill-muted-foreground text-[10px]">
              {point.month}
            </text>
          </g>
        ))}
        {metaY !== null && (
          <line x1={pad.left} x2={width - pad.right} y1={metaY} y2={metaY} stroke="var(--foreground)" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.5" />
        )}
      </svg>
      <div className="pointer-events-none absolute right-3 top-1 rounded-lg border border-border bg-popover px-2.5 py-2 text-xs shadow-lg">
        <p className="text-muted-foreground">{values[active]?.month}</p>
        <p className="font-semibold tabular-nums text-popover-foreground">{brl(values[active]?.value ?? 0)}</p>
      </div>
    </div>
  );
}

function Vazio({ texto }: { texto: string }) {
  return <p className="py-8 text-center text-xs text-muted-foreground">{texto}</p>;
}

export default function ExecutiveOverview({ resumo, onNavigate, onOpenMenu }: ExecutiveOverviewProps) {
  const [view, setView] = useState<Visualizacao>("consolidada");
  const [search, setSearch] = useState("");
  const sources = resumo.fontes;

  const companies = useMemo(() => UNIDADES.map((unit) => {
    const source = sources.find((item) => item.id === unit.id);
    const value = source?.realizadoAno ?? 0;
    const share = resumo.grupo.realizado > 0 ? (value / resumo.grupo.realizado) * 100 : 0;
    const serie = source?.progressoMensal?.filter((point) => point > 0) ?? [];
    const meta = source?.metaAno;
    return { ...unit, value, share, source, meta, serie };
  }), [resumo.grupo.realizado, sources]);

  const filteredCompanies = companies.filter((company) => company.nome.toLowerCase().includes(search.toLowerCase()));

  // Receita acumulada do grupo: só entram as fontes que publicam série mensal real.
  const chartValues = useMemo(() => {
    const comSerie = sources.filter((source) => source.progressoMensal?.length && source.metaAno);
    if (comSerie.length === 0) return [] as { month: string; value: number }[];
    return MESES.map((month, index) => ({
      month,
      value: comSerie.reduce((sum, source) => sum + ((source.progressoMensal?.[index] ?? 0) / 100) * (source.metaAno ?? 0), 0),
    })).filter((point) => point.value > 0);
  }, [sources]);

  const refresh = () => resumo.recarregar();

  const selectView = (next: Visualizacao) => {
    setView(next);
    if (next === "empresa") document.querySelector("#performance-empresas")?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (next === "area") document.querySelector("#atencao-diretoria")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  if (resumo.carregando) return <SkeletonDashboard />;

  const realizado = resumo.grupo.realizado;
  const meta = resumo.grupo.meta;
  const progresso = resumo.grupo.progresso;
  const saldo = Math.max(0, meta - realizado);
  const comMeta = companies.filter((company) => (company.meta ?? 0) > 0);
  const acimaDaMeta = comMeta.filter((company) => company.value >= (company.meta ?? 0)).length;
  const abaixoDaMeta = comMeta.filter((company) => company.value < (company.meta ?? 0));
  const lider = [...companies].sort((a, b) => b.value - a.value)[0];
  const aoVivo = sources.filter((source) => source.estado === "ao-vivo").length;

  // Meses com receita real registrada, para projeção linear e ritmo — cálculo
  // transparente sobre número real, não estimativa externa.
  const mesesComDados = chartValues.length;
  const mesesRestantes = Math.max(0, 12 - mesesComDados);
  const projecaoAnual = mesesComDados > 0 ? (realizado / mesesComDados) * 12 : undefined;
  const ritmoAtual = mesesComDados > 0 ? realizado / mesesComDados : 0;
  const ritmoNecessario = mesesRestantes > 0 ? saldo / mesesRestantes : 0;

  const ultimaAtualizacao = sources.reduce<string | undefined>((latest, source) => {
    if (!latest) return source.atualizadoEm;
    return new Date(source.atualizadoEm) > new Date(latest) ? source.atualizadoEm : latest;
  }, undefined);

  const saudeTexto = abaixoDaMeta.length === 0
    ? `O Grupo NOW está ${pct(progresso ?? 0)} da meta anual, com todas as empresas dentro do esperado.`
    : `O Grupo NOW está ${pct(progresso ?? 0)} da meta anual, mas ${abaixoDaMeta.map((c) => c.nome).join(" e ")} ${abaixoDaMeta.length > 1 ? "estão" : "está"} abaixo do esperado.`;

  const kpis = [
    { label: "Receita realizada no ano", value: brl(realizado), note: `${sources.length} empresas consolidadas`, icon: CircleDollarSign },
    { label: "% da meta anual", value: progresso !== undefined ? pct(progresso) : "—", note: progresso !== undefined ? (progresso >= 100 ? "meta atingida" : `${pct(100 - progresso)} para a meta`) : "sem meta", icon: Gauge },
    { label: "Projeção anual", value: projecaoAnual !== undefined ? brl(projecaoAnual, true) : "—", note: projecaoAnual !== undefined && meta > 0 ? `${projecaoAnual >= meta ? "+" : ""}${brl(projecaoAnual - meta, true)} vs. meta` : `${mesesComDados} mês(es) com dados`, icon: TrendingUp },
    { label: "Falta para a meta", value: meta > 0 ? brl(saldo) : "—", note: saldo === 0 && meta > 0 ? "meta anual atingida" : "ainda restante no ano", icon: WalletCards },
  ];

  return (
    <div className="min-h-full bg-background">
      <div className="sticky top-0 z-20 border-b border-border/80 bg-background/95 backdrop-blur">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 lg:px-6">
          <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2 lg:block">
            <Button variant="ghost" size="icon" onClick={onOpenMenu} aria-label="Abrir menu" title="Abrir menu" className="lg:hidden"><Menu className="size-5" /></Button>
            <label className="relative block min-w-0 max-w-xl">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por empresa..." className="h-10 w-full rounded-md border border-border bg-card pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-good" />
            </label>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" size="sm" className="hidden gap-2 md:flex"><CalendarDays className="size-4" />Ano corrente</Button>
            {ultimaAtualizacao && (
              <span className="hidden items-center gap-1.5 rounded-full border border-good/30 bg-good/10 px-2.5 py-1.5 text-[11px] font-medium text-good md:flex">
                <span className="size-1.5 rounded-full bg-good" />Atualizado às {dataHora(ultimaAtualizacao).split(" ").pop()}
              </span>
            )}
            <Button variant="outline" size="icon" onClick={refresh} disabled={resumo.carregando} aria-label="Atualizar dados" title="Atualizar dados"><RefreshCw className={`size-4 ${resumo.carregando ? "animate-spin" : ""}`} /></Button>
            <Button variant="ghost" size="icon" aria-label="Notificações" title="Notificações" className="relative"><Bell className="size-4" /></Button>
            <Button variant="secondary" size="icon" aria-label="Perfil" title="Perfil" className="rounded-full text-xs font-semibold">GR</Button>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4 lg:p-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold lg:text-2xl">Visão geral</h1>
            <p className="mt-1 text-sm text-muted-foreground">Acompanhe os principais indicadores e o desempenho das empresas do grupo.</p>
          </div>
          <div className="hidden rounded-md border border-border bg-card p-1 sm:flex">
            {(["consolidada", "empresa", "area"] as const).map((option) => (
              <Button key={option} size="sm" variant={view === option ? "default" : "ghost"} onClick={() => selectView(option)} className={`h-8 text-xs ${view === option ? "bg-good text-primary-foreground hover:bg-good/90" : ""}`}>
                {option === "consolidada" ? "Visão consolidada" : option === "empresa" ? "Por empresa" : "Atenção"}
              </Button>
            ))}
          </div>
        </div>

        {/* Saúde do grupo — resumo textual calculado sobre os números reais */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-good"><Gauge className="size-3.5" />Saúde do Grupo NOW</h2>
          <p className="mt-1.5 text-sm text-foreground">{saudeTexto}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((item) => (
            <article key={item.label} className="min-w-0 rounded-xl border border-border bg-card p-4 transition-transform duration-200 hover:-translate-y-0.5">
              <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-md bg-good/10 text-good"><item.icon className="size-5" /></div>
                <p className="text-[11px] font-semibold uppercase text-muted-foreground">{item.label}</p>
              </div>
              <div className="mt-4 min-w-0">
                <strong className="block truncate text-xl tabular-nums text-foreground">{item.value}</strong>
                <p className="mt-2 text-[11px] text-muted-foreground">{item.note}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.72fr)_minmax(330px,0.78fr)]">
          <section className="rounded-xl border border-border bg-card p-4 lg:p-5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold"><ChartNoAxesCombined className="size-4 text-good" />Evolução do grupo</h2>
                <p className="mt-1 text-xs text-muted-foreground">Realizado x meta — somente empresas que publicam série mensal.</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-good" />Realizado</span>
                <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-foreground/40" style={{ backgroundImage: "repeating-linear-gradient(90deg,var(--foreground) 0 3px,transparent 3px 6px)" }} />Meta</span>
              </div>
            </div>
            {chartValues.length > 1 ? <MainChart values={chartValues} metaAno={meta} /> : <Vazio texto="Nenhuma empresa publica série mensal no momento." />}
          </section>

          <section id="atencao-diretoria" className="rounded-xl border border-border bg-card p-4 lg:p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold"><TriangleAlert className="size-4 text-warn" />Atenção da diretoria</h2>
            <p className="mt-1 text-xs text-muted-foreground">{abaixoDaMeta.length} ponto(s) de atenção — empresas abaixo da meta.</p>
            <div className="mt-4 space-y-1">
              {comMeta.length === 0 && <Vazio texto="Nenhuma empresa com meta cadastrada." />}
              {[...comMeta].sort((a, b) => (a.source?.progresso ?? 0) - (b.source?.progresso ?? 0)).map((company) => {
                const progressoEmpresa = company.source?.progresso ?? 0;
                const cor = statusCor(progressoEmpresa);
                return (
                  <button key={company.id} onClick={() => onNavigate(company.id)} className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-accent/40">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: cor }} />
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-medium">{company.nome}</span>
                      <span className="block truncate text-[10px] text-muted-foreground">{brl(company.value, true)} de {brl(company.meta ?? 0, true)}</span>
                    </span>
                    <strong className="shrink-0 text-xs tabular-nums" style={{ color: cor }}>{pct(progressoEmpresa)}</strong>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <section id="performance-empresas" className="rounded-xl border border-border bg-card p-4 lg:p-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div>
              <h2 className="text-sm font-semibold">Performance por empresa</h2>
              <p className="mt-1 text-xs text-muted-foreground">Resultado real no ano corrente, empresa a empresa.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {filteredCompanies.length ? filteredCompanies.map((company) => {
              const progressoEmpresa = company.source?.progresso;
              const cor = statusCor(progressoEmpresa);
              const statusLabel = progressoEmpresa === undefined ? "sem meta" : progressoEmpresa >= 100 ? "Acima da meta" : progressoEmpresa >= 70 ? "Em atenção" : "Abaixo da meta";
              return (
                <button key={company.id} onClick={() => onNavigate(company.id)} className="min-w-0 rounded-lg border border-border bg-background/40 p-3 text-left transition-colors hover:border-good/50">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2 text-xs font-medium">
                      <span className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: company.cor }} />
                      <span className="truncate">{company.nome}</span>
                    </span>
                    <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ color: cor, backgroundColor: `color-mix(in oklch, ${cor} 14%, transparent)` }}>{statusLabel}</span>
                  </div>
                  <p className="mt-3 text-lg font-semibold tabular-nums">{progressoEmpresa !== undefined ? pct(progressoEmpresa) : "—"}</p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${Math.min(100, progressoEmpresa ?? 0)}%`, backgroundColor: cor }} />
                  </div>
                  <p className="mt-2 text-[11px] tabular-nums text-muted-foreground">{brl(company.value, true)} / {company.meta ? brl(company.meta, true) : "sem meta"}</p>
                  <Sparkline values={company.serie} color={company.cor} />
                </button>
              );
            }) : <div className="col-span-full py-10 text-center text-sm text-muted-foreground">Nenhuma empresa encontrada.</div>}
          </div>
        </section>

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.9fr)]">
          <section className="rounded-xl border border-border bg-card p-4 lg:p-5">
            <h2 className="text-sm font-semibold">Receita e faturamento</h2>
            <p className="mt-1 text-xs text-muted-foreground">Ritmo real contra o necessário para bater a meta.</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Receita acumulada", value: brl(realizado, true), sub: meta > 0 ? `${pct(progresso ?? 0)} da meta` : "sem meta" },
                { label: "Meta anual", value: meta > 0 ? brl(meta, true) : "sem meta", sub: `${comMeta.length} empresa(s) com meta` },
                { label: "Projeção anual", value: projecaoAnual !== undefined ? brl(projecaoAnual, true) : "—", sub: `${mesesComDados} mês(es) com dados` },
                { label: "Falta para a meta", value: meta > 0 ? brl(saldo, true) : "—", sub: `${mesesRestantes} mês(es) restantes` },
              ].map((item) => (
                <div key={item.label} className="min-w-0 rounded-lg border border-border bg-background/40 p-3">
                  <p className="truncate text-[10px] uppercase text-muted-foreground">{item.label}</p>
                  <strong className="mt-1 block truncate text-sm tabular-nums">{item.value}</strong>
                  <p className="mt-1 truncate text-[10px] text-muted-foreground">{item.sub}</p>
                </div>
              ))}
            </div>
            {mesesRestantes > 0 && (
              <div className="mt-4 rounded-lg border border-border bg-background/40 p-3">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground"><span>Ritmo atual</span><span>Ritmo necessário</span></div>
                <div className="relative mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-good" style={{ width: `${Math.min(100, (ritmoAtual / Math.max(ritmoAtual, ritmoNecessario, 1)) * 100)}%` }} />
                  <div className="absolute inset-y-0 w-px bg-foreground/50" style={{ left: `${Math.min(100, (ritmoNecessario / Math.max(ritmoAtual, ritmoNecessario, 1)) * 100)}%` }} />
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[11px] tabular-nums"><span className="text-good">{brl(ritmoAtual, true)}/mês</span><span className="text-muted-foreground">{brl(ritmoNecessario, true)}/mês</span></div>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-border bg-card p-4 lg:p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold"><Map className="size-4 text-good" />Mapa executivo</h2>
            <p className="mt-1 text-xs text-muted-foreground">Onde estamos performando?</p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between rounded-md border border-border bg-background/40 px-3 py-2 text-xs">
                <span className="font-medium">Grupo NOW</span>
                <strong className="tabular-nums" style={{ color: statusCor(progresso) }}>{progresso !== undefined ? pct(progresso) : "—"}</strong>
              </div>
              {companies.map((company) => {
                const p = company.source?.progresso;
                return (
                  <button key={company.id} onClick={() => onNavigate(company.id)} className="flex w-full items-center justify-between rounded-md border border-border bg-background/40 px-3 py-2 text-xs transition-colors hover:border-good/50">
                    <span className="flex items-center gap-2 truncate"><span className="size-2 rounded-full" style={{ backgroundColor: company.cor }} />{company.nome}</span>
                    <strong className="tabular-nums" style={{ color: statusCor(p) }}>{p !== undefined ? pct(p) : "—"}</strong>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground"><span>{aoVivo}/{sources.length} fontes ao vivo</span><span>{lider ? `Líder: ${lider.nome}` : "—"}</span></p>
          </section>
        </div>
      </div>
    </div>
  );
}
