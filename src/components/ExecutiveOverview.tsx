import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  RefreshCw,
  Search,
  Target,
  TicketCheck,
  TrendingUp,
  UserRound,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UNIDADES, type UnidadeId } from "@/config/dashboards";
import { RECEITA_MENSAL } from "@/data/mock";
import type { ResumoGrupo } from "@/hooks/useResumoGrupo";

type Visualizacao = "consolidada" | "empresa" | "area";

interface ExecutiveOverviewProps {
  resumo: ResumoGrupo;
  onNavigate: (id: UnidadeId) => void;
}

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

const mockActivities = [
  { color: "bg-exec-blue", title: "Nova solicitação de tarefa", detail: "Cliente: Tech Solutions · Projeto: Integração", time: "Hoje, 10:42" },
  { color: "bg-good", title: "Tarefa concluída", detail: "Cliente: NLG Comex · Projeto: Exportação", time: "Hoje, 09:17" },
  { color: "bg-exec-violet", title: "Nova proposta comercial", detail: "Cliente: Global Trade · Valor: R$ 245.000", time: "Hoje, 08:55" },
  { color: "bg-exec-orange", title: "Lead qualificado", detail: "Cliente: AgroMax · Origem: Site", time: "Hoje, 08:32" },
  { color: "bg-muted-foreground", title: "Follow-up de cliente", detail: "Cliente: Logística Brasil · Responsável: Joana", time: "Ontem, 16:20" },
];

const mockClients = [
  { name: "NLG Comex", initials: "NG", value: 2_845_210, share: 25.8, color: "bg-exec-blue" },
  { name: "AgroMax", initials: "AM", value: 1_982_440, share: 18, color: "bg-exec-cyan" },
  { name: "Global Trade", initials: "GT", value: 1_563_270, share: 14.2, color: "bg-exec-violet" },
  { name: "Logística Brasil", initials: "LB", value: 1_208_630, share: 11, color: "bg-exec-orange" },
  { name: "Tech Solutions", initials: "TS", value: 987_430, share: 8.9, color: "bg-muted-foreground" },
];

const companySpark = [
  [34, 38, 35, 42, 50, 48, 55, 53, 62],
  [28, 36, 43, 39, 47, 52, 51, 58, 65],
  [24, 32, 36, 33, 41, 48, 45, 51, 60],
  [22, 28, 26, 35, 40, 38, 46, 45, 54],
];

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = Math.max(1, max - min);
  const points = values
    .map((value, index) => `${(index / (values.length - 1)) * 96 + 2},${31 - ((value - min) / span) * 25}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 36" className="h-9 w-24" aria-hidden="true">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="98" cy={points.split(" ").at(-1)?.split(",")[1]} r="2.8" fill={color} />
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
  const ceiling = Math.ceil(max / 1_000_000) * 1_000_000;
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

export default function ExecutiveOverview({ resumo, onNavigate }: ExecutiveOverviewProps) {
  const [view, setView] = useState<Visualizacao>("consolidada");
  const [search, setSearch] = useState("");
  const [metric, setMetric] = useState("Receita");
  const sources = resumo.fontes;

  const companies = useMemo(() => UNIDADES.map((unit, index) => {
    const source = sources.find((item) => item.id === unit.id);
    const value = source?.realizadoAno ?? 0;
    const share = resumo.grupo.realizado > 0 ? (value / resumo.grupo.realizado) * 100 : 0;
    const growth = source?.progresso !== undefined ? Math.min(source.progresso - 60, 28) : 0;
    return { ...unit, value, share, growth, source, spark: companySpark[index] ?? companySpark[0] };
  }), [resumo.grupo.realizado, sources]);

  const filteredCompanies = companies.filter((company) => company.nome.toLowerCase().includes(search.toLowerCase()));
  const chartValues = RECEITA_MENSAL.map((point) => ({ month: point.mes, value: point.nlgcomex * 1000 }));
  const refresh = () => resumo.recarregar();

  const selectView = (next: Visualizacao) => {
    setView(next);
    if (next === "empresa") document.querySelector("#desempenho-empresas")?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (next === "area") document.querySelector("#performance-grupo")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  if (resumo.carregando) return <SkeletonDashboard />;

  const kpis = [
    { label: "Receita total", value: brl(resumo.grupo.realizado), delta: resumo.grupo.progresso ? pct(resumo.grupo.progresso - 82.4) : "—", note: "vs. meta de referência", icon: CircleDollarSign, tone: "blue", spark: [30, 34, 38, 44, 42, 50, 58] },
    { label: "Lucro líquido", value: "R$ 3.519.838,51", delta: "18,7%", note: "vs. período anterior · demo", icon: WalletCards, tone: "cyan", spark: [25, 35, 31, 43, 47, 42, 55] },
    { label: "Total de clientes", value: "1.024", delta: "9,3%", note: "vs. período anterior · demo", icon: UsersRound, tone: "violet", spark: [20, 26, 34, 31, 40, 36, 49] },
    { label: "Total de tarefas", value: "R$ 50.107,28/mês", delta: "15,2%", note: "ritmo necessário · 4S", icon: TicketCheck, tone: "orange", spark: [27, 31, 39, 37, 32, 38, 48] },
  ];

  return (
    <div className="min-h-full bg-background">
      <div className="sticky top-0 z-20 border-b border-border/80 bg-background/95 backdrop-blur">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 lg:px-6">
          <label className="relative min-w-0 max-w-xl">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por empresa, métrica, pessoa ou período..." className="h-10 w-full rounded-md border border-border bg-card pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-exec-blue" />
          </label>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" size="sm" className="hidden gap-2 md:flex"><CalendarDays className="size-4" />Ano corrente<ChevronDown className="size-3" /></Button>
            <Button variant="outline" size="icon" onClick={refresh} disabled={resumo.carregando} aria-label="Atualizar dados" title="Atualizar dados"><RefreshCw className={`size-4 ${resumo.carregando ? "animate-spin" : ""}`} /></Button>
            <Button variant="ghost" size="icon" aria-label="Notificações" title="Notificações" className="relative"><Bell className="size-4" /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-destructive" /></Button>
            <Button variant="secondary" size="icon" aria-label="Perfil de GR" title="Perfil de GR" className="rounded-full text-xs font-semibold">GR</Button>
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
            const sparkColor = { blue: "var(--executive-blue)", cyan: "var(--executive-cyan)", violet: "var(--executive-violet)", orange: "var(--executive-orange)" }[item.tone] ?? "var(--executive-blue)";
            return (
              <article key={item.label} className={`group min-w-0 rounded-md border bg-card p-4 transition-transform duration-200 hover:-translate-y-0.5 ${tone}`}>
                <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-md bg-current/10"><item.icon className="size-5" /></div>
                  <p className="text-[11px] font-semibold uppercase text-muted-foreground">{item.label}</p>
                </div>
                <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2">
                  <div className="min-w-0"><strong className="block truncate text-xl tabular-nums text-foreground">{item.value}</strong><p className="mt-2 text-[11px] text-muted-foreground"><span className="mr-1 font-semibold text-good">↑ {item.delta}</span>{item.note}</p></div>
                  <Sparkline values={item.spark} color={sparkColor} />
                </div>
              </article>
            );
          })}
        </div>

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.72fr)_minmax(330px,0.78fr)]">
          <section className="rounded-md border border-border bg-card p-4 lg:p-5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div><h2 className="flex items-center gap-2 text-sm font-semibold"><ChartNoAxesCombined className="size-4 text-exec-blue" />Receita mensal do grupo</h2><p className="mt-1 text-xs text-muted-foreground">Evolução disponível da receita nos últimos meses · série parcial da NLG.</p></div>
              <div className="text-right text-xs"><span className="font-semibold text-good">↑ 12,4%</span><p className="text-muted-foreground">vs. período anterior</p></div>
            </div>
            <MainChart values={chartValues} />
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
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3"><div><h2 className="text-sm font-semibold">Desempenho por empresa</h2><p className="mt-1 text-xs text-muted-foreground">Comparativo dos resultados no período.</p></div><Button variant="secondary" size="sm" onClick={() => setMetric((current) => current === "Receita" ? "Meta" : "Receita")} className="h-8 gap-2 text-xs">{metric}<ChevronDown className="size-3" /></Button></div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 2xl:grid-cols-4">
              {filteredCompanies.length ? filteredCompanies.map((company) => (
                <button key={company.id} onClick={() => onNavigate(company.id)} className="min-w-0 rounded-md border border-border bg-background/35 p-3 text-left transition-colors hover:border-exec-blue/60 hover:bg-accent/40">
                  <div className="flex items-center gap-2 text-xs font-medium"><span className="size-2.5 rounded-sm" style={{ backgroundColor: company.cor }} />{company.nome}</div>
                  <p className="mt-4 truncate text-lg font-semibold tabular-nums">{metric === "Meta" && company.source?.metaAno ? brl(company.source.metaAno, true) : brl(company.value, true)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{pct(company.share)} do grupo</p>
                  <p className={`mt-3 flex items-center gap-1 text-xs font-semibold ${company.growth >= 0 ? "text-good" : "text-destructive"}`}>{company.growth >= 0 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}{pct(Math.abs(company.growth))}</p>
                  <Sparkline values={company.spark} color={company.cor} />
                </button>
              )) : <div className="col-span-full py-10 text-center text-sm text-muted-foreground">Nenhuma empresa encontrada.</div>}
            </div>
          </section>

          <section id="performance-grupo" className="rounded-md border border-border bg-card p-4">
            <h2 className="text-sm font-semibold">Performance do grupo</h2><p className="mt-1 text-xs text-muted-foreground">Indicadores demonstrativos do período.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                { icon: Target, label: "Margem de lucro", value: "32,6%", delta: "4,2 p.p." },
                { icon: TicketCheck, label: "Ticket médio", value: "R$ 309,64", delta: "12,8%" },
                { icon: Clock3, label: "Tempo de atendimento", value: "2,4 dias", delta: "18,7%" },
                { icon: TrendingUp, label: "Taxa de conversão", value: "22,8%", delta: "6,3%" },
              ].map((item) => <div key={item.label} className="min-w-0 rounded-md border border-border bg-background/35 p-3"><item.icon className="mb-3 size-4 text-exec-blue" /><p className="truncate text-[10px] text-muted-foreground">{item.label}</p><strong className="mt-1 block truncate text-sm tabular-nums">{item.value}</strong><span className="mt-2 block text-[10px] font-semibold text-good">↑ {item.delta}</span></div>)}
            </div>
          </section>

          <section className="rounded-md border border-border bg-card p-4">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3"><div><h2 className="text-sm font-semibold">Atividades recentes</h2><p className="mt-1 text-xs text-muted-foreground">Dados demonstrativos.</p></div><Button variant="ghost" size="sm" className="h-8 gap-1 text-xs text-exec-blue">Ver todas<ArrowRight className="size-3" /></Button></div>
            <div className="mt-3 divide-y divide-border/60">
              {mockActivities.map((activity) => <div key={`${activity.title}-${activity.time}`} className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-2 py-2.5"><span className={`mt-1 size-2 rounded-full ${activity.color}`} /><div className="min-w-0"><p className="truncate text-xs font-medium">{activity.title}</p><p className="mt-1 truncate text-[10px] text-muted-foreground">{activity.detail}</p></div><time className="whitespace-nowrap text-[10px] text-muted-foreground">{activity.time}</time></div>)}
            </div>
          </section>
        </div>

        <section className="rounded-md border border-border bg-card p-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3"><div><h2 className="flex items-center gap-2 text-sm font-semibold"><BriefcaseBusiness className="size-4 text-exec-violet" />Top 5 clientes</h2><p className="mt-1 text-xs text-muted-foreground">Faturamento demonstrativo no período.</p></div><Button variant="ghost" size="sm" className="h-8 gap-1 text-xs text-exec-blue">Ver todos<ArrowRight className="size-3" /></Button></div>
          <div className="mt-4 grid gap-x-5 lg:grid-cols-2 xl:grid-cols-5">
            {mockClients.map((client, index) => <div key={client.name} className="grid grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-2 border-b border-border/60 py-3 xl:border-b-0"><span className="w-5 text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</span><span className={`grid size-8 place-items-center rounded-full text-[9px] font-bold text-primary-foreground ${client.color}`}>{client.initials}</span><div className="min-w-0"><div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2"><span className="truncate text-xs font-medium">{client.name}</span><strong className="text-[10px] tabular-nums">{brl(client.value, true)} · {pct(client.share)}</strong></div><div className="mt-2 h-1 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${client.color}`} style={{ width: `${(client.share / mockClients[0].share) * 100}%` }} /></div></div></div>)}
          </div>
        </section>
      </div>
    </div>
  );
}