import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Bell,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronDown,
  CircleDollarSign,
  Gauge,
  Menu,
  RefreshCw,
  Search,
  Target,
  TrendingUp,
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
    <div className="space-y-4 p-4 lg:p-6">
      <div className="h-16 animate-pulse rounded-md bg-muted" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <div key={item} className="h-32 animate-pulse rounded-md bg-card" />)}
      </div>
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.8fr)_minmax(300px,0.8fr)]">
        <div className="h-80 animate-pulse rounded-md bg-card" />
        <div className="h-80 animate-pulse rounded-md bg-card" />
      </div>
    </div>
  );
}

function MainChart({ values }: { values: { month: string; value: number }[] }) {
  const [active, setActive] = useState(values.length - 1);
  const width = 820;
  const height = 270;
  const pad = { left: 58, right: 22, top: 24, bottom: 36 };
  const max = Math.max(...values.map((point) => point.value), 1);
  const ceiling = Math.ceil(max / 1_000_000) * 1_000_000 || max;
  const chartWidth = width - pad.left - pad.right;
  const chartHeight = height - pad.top - pad.bottom;
  const x = (index: number) => pad.left + (index / Math.max(1, values.length - 1)) * chartWidth;
  const y = (value: number) => pad.top + chartHeight - (value / ceiling) * chartHeight;
  const points = values.map((point, index) => `${x(index)},${y(point.value)}`).join(" ");
  const area = `${pad.left},${pad.top + chartHeight} ${points} ${x(values.length - 1)},${pad.top + chartHeight}`;
  const ticks = [0, ceiling / 2, ceiling];

  return (
    <div className="relative mt-3 min-h-[250px]">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" onMouseLeave={() => setActive(values.length - 1)}>
        <defs>
          <linearGradient id="exec-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--executive-blue)" stopOpacity="0.34" />
            <stop offset="1" stopColor="var(--executive-blue)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={pad.left} x2={width - pad.right} y1={y(tick)} y2={y(tick)} stroke="var(--border)" strokeDasharray="3 4" />
            <text x={pad.left - 12} y={y(tick) + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">
              {tick === 0 ? "R$ 0" : brl(tick, true)}
            </text>
          </g>
        ))}
        <polygon points={area} fill="url(#exec-area)" />
        <polyline points={points} fill="none" stroke="var(--executive-blue)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {values.map((point, index) => (
          <g key={point.month} onMouseEnter={() => setActive(index)} className="cursor-crosshair">
            <rect x={x(index) - chartWidth / values.length / 2} y={pad.top} width={chartWidth / values.length} height={chartHeight} fill="transparent" />
            <circle cx={x(index)} cy={y(point.value)} r={active === index ? 5 : 3.5} fill="var(--executive-blue)" stroke="var(--card)" strokeWidth="2" />
            <text x={x(index)} y={height - 10} textAnchor="middle" className="fill-muted-foreground text-[10px]">{point.month}</text>
          </g>
        ))}
      </svg>
      <div className="pointer-events-none absolute right-3 top-1 rounded-md border border-border bg-popover px-2.5 py-2 text-xs shadow-lg">
        <p className="text-muted-foreground">{values[active]?.month}</p>
        <p className="font-semibold tabular-nums text-popover-foreground">{brl(values[active]?.value ?? 0)}</p>
      </div>
    </div>
  );
}

function Donut({ shares }: { shares: { name: string; value: number; color: string }[] }) {
  const total = shares.reduce((sum, item) => sum + item.value, 0);
  const radius = 57;
  const circumference = Math.PI * 2 * radius;
  let offset = 0;
  return (
    <div className="relative mx-auto h-44 w-44 shrink-0">
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="var(--muted)" strokeWidth="25" />
        {shares.map((item) => {
          const length = total > 0 ? (item.value / total) * circumference : 0;
          const circle = (
            <circle key={item.name} cx="80" cy="80" r={radius} fill="none" stroke={item.color} strokeWidth="25" strokeDasharray={`${length} ${circumference - length}`} strokeDashoffset={-offset} />
          );
          offset += length;
          return circle;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[10px] uppercase text-muted-foreground">Total</span>
        <strong className="text-lg tabular-nums">{brl(total, true)}</strong>
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
  const [metric, setMetric] = useState("Receita");
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
    if (next === "empresa") document.querySelector("#desempenho-empresas")?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (next === "area") document.querySelector("#performance-grupo")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  if (resumo.carregando) return <SkeletonDashboard />;

  const realizado = resumo.grupo.realizado;
  const meta = resumo.grupo.meta;
  const progresso = resumo.grupo.progresso;
  const saldo = Math.max(0, meta - realizado);
  const comMeta = companies.filter((company) => (company.meta ?? 0) > 0);
  const acimaDaMeta = comMeta.filter((company) => company.value >= (company.meta ?? 0)).length;
  const lider = [...companies].sort((a, b) => b.value - a.value)[0];
  const aoVivo = sources.filter((source) => source.estado === "ao-vivo").length;

  const kpis = [
    { label: "Receita realizada no ano", value: brl(realizado), note: `${sources.length} empresas consolidadas`, icon: CircleDollarSign, tone: "blue" },
    { label: "Meta anual do grupo", value: meta > 0 ? brl(meta) : "sem meta", note: comMeta.length < companies.length ? `${companies.length - comMeta.length} empresa(s) sem meta` : "todas com meta definida", icon: Target, tone: "cyan" },
    { label: "Progresso da meta", value: progresso !== undefined ? pct(progresso) : "—", note: `${acimaDaMeta} de ${comMeta.length} empresas na meta`, icon: Gauge, tone: "violet" },
    { label: "Falta para a meta", value: meta > 0 ? brl(saldo) : "—", note: saldo === 0 && meta > 0 ? "meta anual atingida" : "saldo restante no ano", icon: WalletCards, tone: "orange" },
  ];

  return (
    <div className="min-h-full bg-background">
      <div className="sticky top-0 z-20 border-b border-border/80 bg-background/95 backdrop-blur">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 lg:px-6">
          <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2 lg:block">
            <Button variant="ghost" size="icon" onClick={onOpenMenu} aria-label="Abrir menu" title="Abrir menu" className="lg:hidden"><Menu className="size-5" /></Button>
            <label className="relative block min-w-0 max-w-xl">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por empresa..." className="h-10 w-full rounded-md border border-border bg-card pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-exec-blue" />
            </label>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" size="sm" className="hidden gap-2 md:flex"><CalendarDays className="size-4" />Ano corrente</Button>
            <Button variant="outline" size="icon" onClick={refresh} disabled={resumo.carregando} aria-label="Atualizar dados" title="Atualizar dados"><RefreshCw className={`size-4 ${resumo.carregando ? "animate-spin" : ""}`} /></Button>
            <Button variant="ghost" size="icon" aria-label="Notificações" title="Notificações" className="relative"><Bell className="size-4" /></Button>
            <Button variant="secondary" size="icon" aria-label="Perfil" title="Perfil" className="rounded-full text-xs font-semibold">GR</Button>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4 lg:p-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold lg:text-2xl">Visão geral do grupo</h1>
            <p className="mt-1 text-sm text-muted-foreground">Acompanhe os principais indicadores e o desempenho das empresas do grupo.</p>
          </div>
          <div className="hidden rounded-md border border-border bg-card p-1 sm:flex">
            {(["consolidada", "empresa", "area"] as const).map((option) => (
              <Button key={option} size="sm" variant={view === option ? "default" : "ghost"} onClick={() => selectView(option)} className="h-8 text-xs">
                {option === "consolidada" ? "Visão consolidada" : option === "empresa" ? "Por empresa" : "Por área"}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((item) => {
            const tone = { blue: "text-exec-blue border-exec-blue/45", cyan: "text-exec-cyan border-exec-cyan/45", violet: "text-exec-violet border-exec-violet/45", orange: "text-exec-orange border-exec-orange/45" }[item.tone];
            return (
              <article key={item.label} className={`group min-w-0 rounded-md border bg-card p-4 transition-transform duration-200 hover:-translate-y-0.5 ${tone}`}>
                <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-md bg-current/10"><item.icon className="size-5" /></div>
                  <p className="text-[11px] font-semibold uppercase text-muted-foreground">{item.label}</p>
                </div>
                <div className="mt-4 min-w-0">
                  <strong className="block truncate text-xl tabular-nums text-foreground">{item.value}</strong>
                  <p className="mt-2 text-[11px] text-muted-foreground">{item.note}</p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.72fr)_minmax(330px,0.78fr)]">
          <section className="rounded-md border border-border bg-card p-4 lg:p-5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold"><ChartNoAxesCombined className="size-4 text-exec-blue" />Receita acumulada do grupo</h2>
                <p className="mt-1 text-xs text-muted-foreground">Somente empresas que publicam série mensal no painel.</p>
              </div>
              {chartValues.length > 0 && (
                <div className="text-right text-xs"><strong className="tabular-nums">{brl(chartValues[chartValues.length - 1]?.value ?? 0, true)}</strong><p className="text-muted-foreground">último mês</p></div>
              )}
            </div>
            {chartValues.length > 1 ? <MainChart values={chartValues} /> : <Vazio texto="Nenhuma empresa publica série mensal no momento." />}
          </section>

          <section className="rounded-md border border-border bg-card p-4 lg:p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold"><TrendingUp className="size-4 text-exec-cyan" />Receita por empresa</h2>
            <p className="mt-1 text-xs text-muted-foreground">Participação no faturamento real do grupo.</p>
            <div className="mt-5 flex flex-col items-center gap-4 sm:flex-row xl:flex-col 2xl:flex-row">
              <Donut shares={companies.map((company) => ({ name: company.nome, value: company.value, color: company.cor }))} />
              <div className="w-full min-w-0 space-y-3">
                {companies.map((company) => <button key={company.id} onClick={() => onNavigate(company.id)} className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 text-left text-xs transition-colors hover:text-exec-blue"><span className="size-2.5 rounded-full" style={{ backgroundColor: company.cor }} /><span className="truncate">{company.nome}<small className="block truncate text-muted-foreground">{brl(company.value, true)}</small></span><strong className="tabular-nums">{pct(company.share)}</strong></button>)}
              </div>
            </div>
          </section>
        </div>

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.75fr)_minmax(320px,0.8fr)]">
          <section id="desempenho-empresas" className="rounded-md border border-border bg-card p-4">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3"><div><h2 className="text-sm font-semibold">Desempenho por empresa</h2><p className="mt-1 text-xs text-muted-foreground">Resultados reais no ano corrente.</p></div><Button variant="secondary" size="sm" onClick={() => setMetric((current) => current === "Receita" ? "Meta" : "Receita")} className="h-8 gap-2 text-xs">{metric}<ChevronDown className="size-3" /></Button></div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 2xl:grid-cols-4">
              {filteredCompanies.length ? filteredCompanies.map((company) => {
                const progressoEmpresa = company.source?.progresso;
                const naMeta = progressoEmpresa !== undefined && progressoEmpresa >= 100;
                return (
                  <button key={company.id} onClick={() => onNavigate(company.id)} className="min-w-0 rounded-md border border-border bg-background/35 p-3 text-left transition-colors hover:border-exec-blue/60 hover:bg-accent/40">
                    <div className="flex items-center gap-2 text-xs font-medium"><span className="size-2.5 rounded-sm" style={{ backgroundColor: company.cor }} />{company.nome}</div>
                    <p className="mt-4 truncate text-lg font-semibold tabular-nums">{metric === "Meta" ? (company.meta ? brl(company.meta, true) : "sem meta") : brl(company.value, true)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{pct(company.share)} do grupo</p>
                    <p className={`mt-3 flex items-center gap-1 text-xs font-semibold ${naMeta ? "text-good" : "text-muted-foreground"}`}>
                      {progressoEmpresa === undefined ? "sem meta" : <>{naMeta ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}{pct(progressoEmpresa)} da meta</>}
                    </p>
                    <Sparkline values={company.serie} color={company.cor} />
                  </button>
                );
              }) : <div className="col-span-full py-10 text-center text-sm text-muted-foreground">Nenhuma empresa encontrada.</div>}
            </div>
          </section>

          <section id="performance-grupo" className="rounded-md border border-border bg-card p-4">
            <h2 className="text-sm font-semibold">Indicadores do grupo</h2><p className="mt-1 text-xs text-muted-foreground">Calculados sobre os números reais.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                { icon: Gauge, label: "Progresso consolidado", value: progresso !== undefined ? pct(progresso) : "—" },
                { icon: Target, label: "Empresas na meta", value: `${acimaDaMeta}/${comMeta.length}` },
                { icon: TrendingUp, label: "Maior participação", value: lider ? `${lider.nome} · ${pct(lider.share)}` : "—" },
                { icon: RefreshCw, label: "Fontes ao vivo", value: `${aoVivo}/${sources.length}` },
              ].map((item) => <div key={item.label} className="min-w-0 rounded-md border border-border bg-background/35 p-3"><item.icon className="mb-3 size-4 text-exec-blue" /><p className="truncate text-[10px] text-muted-foreground">{item.label}</p><strong className="mt-1 block truncate text-sm tabular-nums">{item.value}</strong></div>)}
            </div>
          </section>

          <section className="rounded-md border border-border bg-card p-4">
            <h2 className="text-sm font-semibold">Atualização das fontes</h2>
            <p className="mt-1 text-xs text-muted-foreground">Última leitura de cada empresa.</p>
            <div className="mt-3 divide-y divide-border/60">
              {sources.map((source) => {
                const unidade = UNIDADES.find((unit) => unit.id === source.id);
                return (
                  <div key={source.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 py-2.5">
                    <span className="size-2 rounded-full" style={{ backgroundColor: unidade?.cor }} />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium">{unidade?.nome ?? source.id}</p>
                      <p className="mt-1 truncate text-[10px] text-muted-foreground">{source.estado === "ao-vivo" ? "Dados ao vivo" : "Último retrato"} · {brl(source.realizadoAno, true)}</p>
                    </div>
                    <time className="whitespace-nowrap text-[10px] text-muted-foreground">{dataHora(source.atualizadoEm)}</time>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
