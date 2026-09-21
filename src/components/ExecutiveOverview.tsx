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
    <div className="min-h-full space-y-4 bg-[#F7F9FC] p-4 lg:p-6">
      <div className="h-16 animate-pulse rounded-xl bg-white" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <div key={item} className="h-32 animate-pulse rounded-xl bg-white" />)}
      </div>
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.8fr)_minmax(300px,0.8fr)]">
        <div className="h-80 animate-pulse rounded-xl bg-white" />
        <div className="h-80 animate-pulse rounded-xl bg-white" />
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
            <line x1={pad.left} x2={width - pad.right} y1={y(tick)} y2={y(tick)} stroke="#E7EBF2" strokeWidth="1" />
            <text x={pad.left - 12} y={y(tick) + 4} textAnchor="end" className="fill-[#8A94A3] text-[10px]">
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
              fill={active === index ? "#2563EB" : "#BFD3F8"}
              className="transition-colors duration-150"
            />
            <text x={x(index) + barWidth / 2} y={height - 10} textAnchor="middle" className="fill-[#6F7987] text-[10px]">
              {point.month}
            </text>
          </g>
        ))}
        {metaY !== null && (
          <line x1={pad.left} x2={width - pad.right} y1={metaY} y2={metaY} stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="5 4" />
        )}
      </svg>
      <div className="pointer-events-none absolute right-3 top-1 rounded-lg border border-[#E7EBF2] bg-white px-2.5 py-2 text-xs shadow-sm">
        <p className="text-[#8A94A3]">{values[active]?.month}</p>
        <p className="font-semibold tabular-nums text-[#0F172A]">{brl(values[active]?.value ?? 0)}</p>
      </div>
    </div>
  );
}

function HorizontalShares({
  shares,
  onSelect,
}: {
  shares: { id: string; name: string; value: number; color: string; share: number }[];
  onSelect: (id: string) => void;
}) {
  const max = Math.max(...shares.map((s) => s.value), 1);
  return (
    <div className="space-y-4">
      {shares.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className="block w-full text-left"
        >
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2 truncate text-[13px] font-medium text-[#334155]">
              <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="truncate">{item.name}</span>
            </span>
            <span className="shrink-0 text-[13px] tabular-nums text-[#0F172A]">
              {brl(item.value, true)} <span className="text-[#8A94A3]">· {pct(item.share)}</span>
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#EEF1F6]">
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{ width: `${(item.value / max) * 100}%`, backgroundColor: item.color }}
            />
          </div>
        </button>
      ))}
    </div>
  );
}

function Vazio({ texto }: { texto: string }) {
  return <p className="py-8 text-center text-xs text-[#8A94A3]">{texto}</p>;
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
  const maisDistante = comMeta.length
    ? [...comMeta].sort((a, b) => (a.source?.progresso ?? 0) - (b.source?.progresso ?? 0))[0]
    : undefined;
  const aoVivo = sources.filter((source) => source.estado === "ao-vivo").length;

  const kpis = [
    { label: "Receita realizada no ano", value: brl(realizado), note: `${sources.length} empresas consolidadas`, icon: CircleDollarSign },
    { label: "Meta anual do grupo", value: meta > 0 ? brl(meta) : "sem meta", note: comMeta.length < companies.length ? `${companies.length - comMeta.length} empresa(s) sem meta` : "todas com meta definida", icon: Target },
    { label: "Progresso da meta", value: progresso !== undefined ? pct(progresso) : "—", note: `${acimaDaMeta} de ${comMeta.length} empresas na meta`, icon: Gauge, progress: progresso },
    { label: "Falta para a meta", value: meta > 0 ? brl(saldo) : "—", note: saldo === 0 && meta > 0 ? "meta anual atingida" : "ainda restante no ano", icon: WalletCards, progress: progresso },
  ];

  return (
    <div className="min-h-full bg-[#F7F9FC] text-[#0F172A]">
      <div className="sticky top-0 z-20 border-b border-[#E7EBF2] bg-white/95 backdrop-blur">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 lg:px-6">
          <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2 lg:block">
            <Button variant="ghost" size="icon" onClick={onOpenMenu} aria-label="Abrir menu" title="Abrir menu" className="text-[#334155] hover:bg-[#F1F5F9] lg:hidden"><Menu className="size-5" /></Button>
            <label className="relative block min-w-0 max-w-xl">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" aria-hidden="true" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por empresa..." className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-white pl-10 pr-3 text-sm text-[#0F172A] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#2563EB]" />
            </label>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" size="sm" className="hidden gap-2 border-[#E2E8F0] bg-white text-[#334155] hover:bg-[#F1F5F9] md:flex"><CalendarDays className="size-4" />Ano corrente</Button>
            <Button variant="outline" size="icon" onClick={refresh} disabled={resumo.carregando} aria-label="Atualizar dados" title="Atualizar dados" className="border-[#E2E8F0] bg-white text-[#334155] hover:bg-[#F1F5F9]"><RefreshCw className={`size-4 ${resumo.carregando ? "animate-spin" : ""}`} /></Button>
            <Button variant="ghost" size="icon" aria-label="Notificações" title="Notificações" className="relative text-[#334155] hover:bg-[#F1F5F9]"><Bell className="size-4" /></Button>
            <Button variant="secondary" size="icon" aria-label="Perfil" title="Perfil" className="rounded-full bg-[#2563EB] text-xs font-semibold text-white hover:bg-[#1D4ED8]">GR</Button>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4 lg:p-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold text-[#0F172A] lg:text-2xl">Visão geral</h1>
            <p className="mt-1 text-sm text-[#64748B]">Acompanhe os principais indicadores e o desempenho do seu grupo.</p>
          </div>
          <div className="hidden rounded-lg border border-[#E2E8F0] bg-white p-1 sm:flex">
            {(["consolidada", "empresa", "area"] as const).map((option) => (
              <Button
                key={option}
                size="sm"
                variant="ghost"
                onClick={() => selectView(option)}
                className={`h-8 text-xs ${view === option ? "bg-[#EFF4FF] text-[#2563EB]" : "text-[#64748B] hover:bg-[#F1F5F9]"}`}
              >
                {option === "consolidada" ? "Visão consolidada" : option === "empresa" ? "Por empresa" : "Por área"}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((item) => (
            <article key={item.label} className="min-w-0 rounded-xl border border-[#E7EBF2] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8A94A3]">{item.label}</p>
                <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#EFF4FF] text-[#2563EB]"><item.icon className="size-4" /></div>
              </div>
              <div className="mt-4 min-w-0">
                <strong className="block truncate text-[26px] font-bold tabular-nums leading-tight text-[#0F172A]">{item.value}</strong>
                <p className="mt-2 text-[12px] text-[#64748B]">{item.note}</p>
                {item.progress !== undefined && (
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#EEF1F6]">
                    <div className="h-full rounded-full bg-[#2563EB] transition-[width] duration-500" style={{ width: `${Math.min(100, item.progress)}%` }} />
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.72fr)_minmax(330px,0.78fr)]">
          <section className="rounded-xl border border-[#E7EBF2] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] lg:p-5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]"><ChartNoAxesCombined className="size-4 text-[#2563EB]" />Receita acumulada do grupo</h2>
                <p className="mt-1 text-xs text-[#64748B]">Evolução da receita das empresas do grupo ao longo do ano.</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-[#64748B]">
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-[#2563EB]" />Realizado</span>
                <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-[#94A3B8]" style={{ backgroundImage: "repeating-linear-gradient(90deg,#94A3B8 0 3px,transparent 3px 6px)" }} />Meta</span>
              </div>
            </div>
            {chartValues.length > 1 ? <MainChart values={chartValues} metaAno={meta} /> : <Vazio texto="Nenhuma empresa publica série mensal no momento." />}
          </section>

          <section className="rounded-xl border border-[#E7EBF2] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] lg:p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]"><TrendingUp className="size-4 text-[#2563EB]" />Receita por empresa</h2>
            <p className="mt-1 text-xs text-[#64748B]">Participação no faturamento real do grupo.</p>
            <div className="mt-5">
              <HorizontalShares
                shares={companies.map((company) => ({ id: company.id, name: company.nome, value: company.value, color: company.cor, share: company.share }))}
                onSelect={(id) => onNavigate(id as UnidadeId)}
              />
            </div>
          </section>
        </div>

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.72fr)_minmax(300px,0.78fr)]">
          <section id="desempenho-empresas" className="overflow-hidden rounded-xl border border-[#E7EBF2] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="p-4 pb-0">
              <h2 className="text-sm font-semibold text-[#0F172A]">Desempenho por empresa</h2>
              <p className="mt-1 text-xs text-[#64748B]">Resultado no ano corrente e comparação com a meta.</p>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-left text-[13px]">
                <thead>
                  <tr className="border-b border-[#E7EBF2] text-[11px] uppercase tracking-wide text-[#8A94A3]">
                    <th className="px-4 py-2 font-medium">Empresa</th>
                    <th className="px-4 py-2 font-medium">Receita</th>
                    <th className="px-4 py-2 font-medium">% do grupo</th>
                    <th className="px-4 py-2 font-medium">Meta</th>
                    <th className="px-4 py-2 font-medium">Atingimento</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.length ? filteredCompanies.map((company) => {
                    const progressoEmpresa = company.source?.progresso;
                    const naMeta = progressoEmpresa !== undefined && progressoEmpresa >= 100;
                    return (
                      <tr key={company.id} onClick={() => onNavigate(company.id)} className="cursor-pointer border-b border-[#F1F5F9] transition-colors last:border-b-0 hover:bg-[#F8FAFC]">
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-2 font-medium text-[#0F172A]">
                            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: company.cor }} />
                            {company.nome}
                          </span>
                        </td>
                        <td className="px-4 py-3 tabular-nums text-[#334155]">{brl(company.value, true)}</td>
                        <td className="px-4 py-3 tabular-nums text-[#334155]">{pct(company.share)}</td>
                        <td className="px-4 py-3 tabular-nums text-[#334155]">{company.meta ? brl(company.meta, true) : "sem meta"}</td>
                        <td className="px-4 py-3">
                          {progressoEmpresa === undefined ? (
                            <span className="text-[#94A3B8]">—</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#EEF1F6]">
                                <div className={`h-full rounded-full ${naMeta ? "bg-[#16A34A]" : "bg-[#2563EB]"}`} style={{ width: `${Math.min(100, progressoEmpresa)}%` }} />
                              </div>
                              <span className={`flex items-center gap-0.5 tabular-nums text-[12px] font-medium ${naMeta ? "text-[#16A34A]" : "text-[#334155]"}`}>
                                {naMeta ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}{pct(progressoEmpresa)}
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-[#8A94A3]">Nenhuma empresa encontrada.</td></tr>
                  )}
                </tbody>
                {filteredCompanies.length > 0 && (
                  <tfoot>
                    <tr className="border-t border-[#E7EBF2] bg-[#F8FAFC] text-[13px] font-semibold text-[#0F172A]">
                      <td className="px-4 py-3">Total do grupo</td>
                      <td className="px-4 py-3 tabular-nums">{brl(realizado, true)}</td>
                      <td className="px-4 py-3 tabular-nums">100%</td>
                      <td className="px-4 py-3 tabular-nums">{meta > 0 ? brl(meta, true) : "—"}</td>
                      <td className="px-4 py-3 tabular-nums">{progresso !== undefined ? pct(progresso) : "—"}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
            {filteredCompanies.length > 0 && (
              <div className="flex flex-wrap gap-3 border-t border-[#F1F5F9] p-4">
                {filteredCompanies.map((company) => (
                  <button key={company.id} onClick={() => onNavigate(company.id)} className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-left transition-colors hover:border-[#2563EB]/40">
                    <p className="text-[11px] text-[#8A94A3]">{company.nome}</p>
                    <Sparkline values={company.serie} color={company.cor} />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section id="performance-grupo" className="rounded-xl border border-[#E7EBF2] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <h2 className="text-sm font-semibold text-[#0F172A]">Indicadores do grupo</h2>
            <p className="mt-1 text-xs text-[#64748B]">Principais métricas de desempenho.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                { icon: Gauge, label: "Progresso consolidado", value: progresso !== undefined ? pct(progresso) : "—" },
                { icon: Target, label: "Empresas na meta", value: `${acimaDaMeta}/${comMeta.length}` },
                { icon: TrendingUp, label: "Maior participação", value: lider ? `${lider.nome} · ${pct(lider.share)}` : "—" },
                { icon: RefreshCw, label: "Fontes ao vivo", value: `${aoVivo}/${sources.length}` },
              ].map((item) => (
                <div key={item.label} className="min-w-0 rounded-lg border border-[#E7EBF2] bg-[#F8FAFC] p-3">
                  <item.icon className="mb-2 size-3.5 text-[#2563EB]" />
                  <p className="truncate text-[10px] text-[#8A94A3]">{item.label}</p>
                  <strong className="mt-1 block truncate text-[13px] tabular-nums text-[#0F172A]">{item.value}</strong>
                </div>
              ))}
            </div>
            {maisDistante && (
              <div className="mt-3 rounded-lg border border-[#FDE8E4] bg-[#FEF4F2] p-3">
                <p className="text-[10px] uppercase tracking-wide text-[#B4423A]">Mais distante da meta</p>
                <strong className="mt-1 block text-[13px] text-[#0F172A]">{maisDistante.nome} · {pct(maisDistante.source?.progresso ?? 0)}</strong>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-[#E7EBF2] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <h2 className="text-sm font-semibold text-[#0F172A]">Últimas movimentações</h2>
            <p className="mt-1 text-xs text-[#64748B]">Última leitura de cada empresa.</p>
            <div className="mt-3 divide-y divide-[#F1F5F9]">
              {sources.map((source) => {
                const unidade = UNIDADES.find((unit) => unit.id === source.id);
                const companyShare = companies.find((c) => c.id === source.id)?.share ?? 0;
                return (
                  <div key={source.id} className="flex items-center gap-3 py-2.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg" style={{ backgroundColor: `${unidade?.cor}1A` }}>
                      <span className="size-2 rounded-full" style={{ backgroundColor: unidade?.cor }} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-[#0F172A]">{unidade?.nome ?? source.id}</p>
                      <p className="mt-0.5 truncate text-[10px] text-[#8A94A3]">{brl(source.realizadoAno, true)} · {source.estado === "ao-vivo" ? "ao-vivo" : "retrato"}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[11px] font-semibold tabular-nums text-[#16A34A]">{pct(companyShare)}</p>
                      <time className="whitespace-nowrap text-[10px] text-[#94A3B8]">{dataHora(source.atualizadoEm)}</time>
                    </div>
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
