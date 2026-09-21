import {
  ChartNoAxesCombined,
  CircleDollarSign,
  Gauge,
  TrendingUp,
  TriangleAlert,
  WalletCards,
} from "lucide-react";
import LogoGrupoNow from "@/components/LogoGrupoNow";
import type { UnidadeId } from "@/config/dashboards";
import type { ResumoGrupo } from "@/hooks/useResumoGrupo";
import { useVisaoGrupo } from "@/hooks/useVisaoGrupo";
import { CREAM, MainChart, MapaExecutivo, Sparkline, Vazio, brl, dataHora, pct, statusCor } from "@/components/executive-shared";

interface ApresentacaoExecutivaProps {
  resumo: ResumoGrupo;
  onNavigate: (id: UnidadeId) => void;
}

function SkeletonApresentacao() {
  return (
    <div className="min-h-full space-y-4 p-4 lg:p-6" style={{ backgroundColor: CREAM.bg }}>
      <div className="h-24 animate-pulse rounded-2xl" style={{ backgroundColor: CREAM.card }} />
      <div className="h-20 animate-pulse rounded-2xl" style={{ backgroundColor: CREAM.dark }} />
      <div className="h-80 animate-pulse rounded-2xl" style={{ backgroundColor: CREAM.card }} />
    </div>
  );
}

export default function ApresentacaoExecutiva({ resumo, onNavigate }: ApresentacaoExecutivaProps) {
  const {
    sources, companies, chartValues, realizado, meta, progresso, saldo, comMeta, abaixoDaMeta,
    lider, aoVivo, mesesComDados, mesesRestantes, projecaoAnual, ritmoAtual, ritmoNecessario,
    ultimaAtualizacao, saudeTexto,
  } = useVisaoGrupo(resumo);

  if (resumo.carregando) return <SkeletonApresentacao />;

  const anoCorrente = new Date().getFullYear();
  const ultimoMesComDados = chartValues.length > 0 ? chartValues[chartValues.length - 1]?.month : undefined;
  const leituraExecutiva = `O Grupo NOW está ${pct(progresso ?? 0)} da meta anual, ${saudeTexto}. ${
    projecaoAnual !== undefined && meta > 0
      ? `A projeção com o ritmo atual fecha o ano em ${brl(projecaoAnual, true)}, ${projecaoAnual >= meta ? "acima" : "abaixo"} da meta.`
      : ""
  }`;

  const kpis = [
    { label: "Faturamento / Receita", value: brl(realizado, true), note: "Realizado no ano", icon: CircleDollarSign },
    { label: "% da meta anual", value: progresso !== undefined ? pct(progresso) : "—", note: progresso !== undefined && progresso >= 100 ? "Meta atingida" : "Meta em andamento", icon: Gauge },
    { label: "Projeção anual", value: projecaoAnual !== undefined ? brl(projecaoAnual, true) : "—", note: meta > 0 ? `vs. ${brl(meta, true)} da meta` : "sem meta", icon: TrendingUp },
    { label: "Falta para a meta", value: meta > 0 ? brl(saldo, true) : "—", note: `${mesesRestantes} mês(es) restantes`, icon: WalletCards },
  ];

  return (
    <div className="min-h-full" style={{ backgroundColor: CREAM.bg, color: CREAM.text }}>
      <div className="mx-auto max-w-[1400px] space-y-3 p-4 lg:p-6">
        {/* Hero — cabeçalho de apresentação */}
        <div className="relative overflow-hidden rounded-2xl border p-5 shadow-[0_1px_3px_rgba(43,42,33,0.06)] lg:p-6" style={{ borderColor: CREAM.border, backgroundColor: CREAM.card }}>
          <svg className="pointer-events-none absolute inset-y-0 right-0 h-full w-1/2 opacity-[0.10]" viewBox="0 0 500 200" preserveAspectRatio="none" aria-hidden="true">
            <polygon points="180,0 500,0 500,200 60,200" fill={CREAM.dark} />
            <polygon points="260,0 500,0 500,200 140,200" fill={CREAM.good} opacity="0.5" />
          </svg>
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <LogoGrupoNow className="mt-0.5 h-8 w-auto shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: CREAM.good }}>Apresentação executiva</p>
                <h1 className="mt-1 text-2xl font-bold leading-tight lg:text-3xl">Visão Geral do Grupo NOW</h1>
                <p className="mt-1 text-sm" style={{ color: CREAM.muted }}>Desempenho, principais resultados e próximos passos.</p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <span className="rounded-full border px-3 py-1.5 text-xs" style={{ borderColor: CREAM.border, backgroundColor: CREAM.cardSoft, color: CREAM.text }}>Ano <strong className="ml-1 tabular-nums">{anoCorrente}</strong></span>
              <span className="rounded-full border px-3 py-1.5 text-xs" style={{ borderColor: CREAM.border, backgroundColor: CREAM.cardSoft, color: CREAM.text }}>Período <strong className="ml-1">{ultimoMesComDados ? `Até ${ultimoMesComDados}/${anoCorrente}` : "—"}</strong></span>
              {ultimaAtualizacao && (
                <span className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs" style={{ borderColor: `${CREAM.good}4D`, backgroundColor: `${CREAM.good}1A`, color: CREAM.good }}>
                  <span className="size-1.5 rounded-full" style={{ backgroundColor: CREAM.good }} />Atualizado em {dataHora(ultimaAtualizacao).split(" ").pop()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Faixa de KPIs — card escuro, estilo faixa de apresentação */}
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl shadow-[0_8px_24px_rgba(36,33,25,0.2)] sm:grid-cols-4" style={{ backgroundColor: `${CREAM.card}14` }}>
          {kpis.map((item) => (
            <div key={item.label} className="min-w-0 p-4" style={{ backgroundColor: CREAM.dark }}>
              <div className="flex items-center gap-2">
                <div className="grid size-8 shrink-0 place-items-center rounded-full" style={{ backgroundColor: `${CREAM.good}33`, color: "#9FD98A" }}>
                  <item.icon className="size-4" />
                </div>
                <p className="min-w-0 truncate text-[10px] font-semibold uppercase tracking-wide" style={{ color: `${CREAM.card}99` }}>{item.label}</p>
              </div>
              <strong className="mt-3 block truncate text-xl font-bold tabular-nums" style={{ color: CREAM.card }}>{item.value}</strong>
              <p className="mt-1 truncate text-[11px]" style={{ color: `${CREAM.card}80` }}>{item.note}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.72fr)_minmax(330px,0.78fr)]">
          <section className="rounded-2xl border p-4 shadow-[0_1px_3px_rgba(43,42,33,0.06)] lg:p-5" style={{ borderColor: CREAM.border, backgroundColor: CREAM.card }}>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold"><ChartNoAxesCombined className="size-4" style={{ color: CREAM.good }} />Evolução do grupo</h2>
                <p className="mt-1 text-xs" style={{ color: CREAM.muted }}>Realizado x meta — somente empresas que publicam série mensal.</p>
              </div>
              <div className="flex items-center gap-3 text-[11px]" style={{ color: CREAM.muted }}>
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm" style={{ backgroundColor: CREAM.good }} />Realizado</span>
                <span className="flex items-center gap-1.5"><span className="h-0.5 w-3" style={{ backgroundImage: `repeating-linear-gradient(90deg,${CREAM.dark} 0 3px,transparent 3px 6px)` }} />Meta</span>
              </div>
            </div>
            {chartValues.length > 1 ? <MainChart values={chartValues} metaAno={meta} /> : <Vazio texto="Nenhuma empresa publica série mensal no momento." />}
          </section>

          <section className="rounded-2xl border p-4 shadow-[0_1px_3px_rgba(43,42,33,0.06)] lg:p-5" style={{ borderColor: CREAM.border, backgroundColor: CREAM.card }}>
            <h2 className="flex items-center gap-2 text-sm font-semibold"><TriangleAlert className="size-4" style={{ color: CREAM.warn }} />Pontos de atenção</h2>
            <p className="mt-1 text-xs" style={{ color: CREAM.muted }}>{abaixoDaMeta.length} empresa(s) demandam acompanhamento mais próximo.</p>
            <div className="mt-4 space-y-1">
              {comMeta.length === 0 && <Vazio texto="Nenhuma empresa com meta cadastrada." />}
              {[...comMeta].sort((a, b) => (a.source?.progresso ?? 0) - (b.source?.progresso ?? 0)).map((company) => {
                const progressoEmpresa = company.source?.progresso ?? 0;
                const cor = statusCor(progressoEmpresa);
                return (
                  <button key={company.id} onClick={() => onNavigate(company.id)} className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg p-2 text-left transition-colors">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full" style={{ backgroundColor: `${cor}1F` }}>
                      <span className="size-2.5 rounded-full" style={{ backgroundColor: cor }} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-medium" style={{ color: CREAM.text }}>{company.nome}</span>
                      <span className="block truncate text-[10px]" style={{ color: CREAM.muted }}>Realizado {brl(company.value, true)} · Meta {brl(company.meta ?? 0, true)}</span>
                    </span>
                    <strong className="shrink-0 text-xs tabular-nums" style={{ color: cor }}>{pct(progressoEmpresa)}</strong>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <section className="rounded-2xl border p-4 shadow-[0_1px_3px_rgba(43,42,33,0.06)] lg:p-5" style={{ borderColor: CREAM.border, backgroundColor: CREAM.card }}>
          <h2 className="text-sm font-semibold">Performance por empresa</h2>
          <p className="mt-1 text-xs" style={{ color: CREAM.muted }}>Resultado real no ano corrente, empresa a empresa.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {companies.map((company) => {
              const progressoEmpresa = company.source?.progresso;
              const cor = statusCor(progressoEmpresa);
              const statusLabel = progressoEmpresa === undefined ? "sem meta" : progressoEmpresa >= 100 ? "Acima da meta" : progressoEmpresa >= 70 ? "Em atenção" : "Abaixo da meta";
              return (
                <button key={company.id} onClick={() => onNavigate(company.id)} className="min-w-0 rounded-xl border p-3 text-left shadow-[0_1px_2px_rgba(43,42,33,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(43,42,33,0.08)]" style={{ borderColor: CREAM.border, backgroundColor: CREAM.cardSoft }}>
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
            })}
          </div>
        </section>

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.85fr)]">
          <section className="rounded-2xl p-4 shadow-[0_8px_24px_rgba(36,33,25,0.2)] lg:p-5" style={{ backgroundColor: CREAM.dark }}>
            <h2 className="text-sm font-semibold" style={{ color: CREAM.card }}>Receita e faturamento</h2>
            <p className="mt-1 text-xs" style={{ color: `${CREAM.card}99` }}>Ritmo real contra o necessário para bater a meta.</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Receita acumulada", value: brl(realizado, true), sub: meta > 0 ? `${pct(progresso ?? 0)} da meta anual` : "sem meta" },
                { label: "Faturamento acumulado", value: brl(realizado, true), sub: meta > 0 ? `${pct(progresso ?? 0)} da meta anual` : "sem meta" },
                { label: "Meta anual", value: meta > 0 ? brl(meta, true) : "sem meta", sub: `${comMeta.length} empresa(s) com meta` },
                { label: "Projeção anual", value: projecaoAnual !== undefined ? brl(projecaoAnual, true) : "—", sub: meta > 0 && projecaoAnual !== undefined ? `${projecaoAnual >= meta ? "+" : ""}${brl(projecaoAnual - meta, true)} vs meta` : `${mesesComDados} mês(es)` },
              ].map((item) => (
                <div key={item.label} className="min-w-0 rounded-xl p-3" style={{ backgroundColor: `${CREAM.card}0F` }}>
                  <p className="truncate text-[10px] uppercase" style={{ color: `${CREAM.card}80` }}>{item.label}</p>
                  <strong className="mt-1 block truncate text-sm tabular-nums" style={{ color: CREAM.card }}>{item.value}</strong>
                  <p className="mt-1 truncate text-[10px]" style={{ color: `${CREAM.card}80` }}>{item.sub}</p>
                </div>
              ))}
            </div>
            {mesesRestantes > 0 && (
              <div className="mt-4 rounded-xl p-3" style={{ backgroundColor: `${CREAM.card}0F` }}>
                <div className="flex items-center justify-between text-[11px]" style={{ color: `${CREAM.card}80` }}><span>Ritmo atual</span><span>Ritmo necessário</span></div>
                <div className="relative mt-2 h-2.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: `${CREAM.card}1A` }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, (ritmoAtual / Math.max(ritmoAtual, ritmoNecessario, 1)) * 100)}%`, backgroundColor: "#9FD98A" }} />
                  <div className="absolute inset-y-0 w-px" style={{ left: `${Math.min(100, (ritmoNecessario / Math.max(ritmoAtual, ritmoNecessario, 1)) * 100)}%`, backgroundColor: CREAM.card }} />
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[11px] tabular-nums"><span style={{ color: "#9FD98A" }}>{brl(ritmoAtual, true)}/mês</span><span style={{ color: `${CREAM.card}80` }}>{brl(ritmoNecessario, true)}/mês</span></div>
              </div>
            )}
          </section>

          <section className="rounded-2xl p-4 shadow-[0_8px_24px_rgba(36,33,25,0.2)] lg:p-5" style={{ backgroundColor: CREAM.dark }}>
            <h2 className="flex items-center gap-2 text-sm font-semibold" style={{ color: CREAM.card }}>
              <span className="grid size-6 shrink-0 place-items-center rounded-full" style={{ backgroundColor: `${CREAM.good}33`, color: "#9FD98A" }}><Gauge className="size-3.5" /></span>
              Leitura executiva
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: `${CREAM.card}CC` }}>{leituraExecutiva}</p>
          </section>
        </div>

        <MapaExecutivo
          companies={companies}
          progresso={progresso}
          aoVivo={aoVivo}
          totalFontes={sources.length}
          liderNome={lider?.nome}
          onNavigate={onNavigate}
        />

        <div className="flex flex-wrap items-center justify-between gap-2 px-1 pt-1 text-[10px] uppercase tracking-wide" style={{ color: CREAM.muted }}>
          <span>Grupo NOW · Pessoas + Processos + Resultados</span>
          <span>Executive Hub · {anoCorrente}</span>
        </div>
      </div>
    </div>
  );
}
