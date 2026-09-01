import { useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  LayoutGrid,
  Menu,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import ReceitaChart from "@/components/ReceitaChart";
import LogoGrupoNow from "@/components/LogoGrupoNow";
import DashboardEmbed from "@/components/DashboardEmbed";
import { UNIDADES, CORES, type UnidadeId } from "@/config/dashboards";
import {
  KPIS_CONSOLIDADOS,
  RESUMO_UNIDADES,
  RECEITA_MENSAL,
  PERIODOS,
  RECORTE,
  type PeriodoId,
} from "@/data/mock";

type View = "overview" | UnidadeId;

const STATUS_COR: Record<string, string> = {
  bom: CORES.bom,
  atencao: CORES.atencao,
  critico: CORES.critico,
};

/** Quem acompanha o portal. Ajuste os cargos se precisar. */
const DIRETORIA = [
  { nome: "Giuliano Redua", cargo: "Diretoria", iniciais: "GR" },
  { nome: "José Olacyr", cargo: "Diretoria", iniciais: "JO" },
  { nome: "Josivaldo", cargo: "Diretoria", iniciais: "JS" },
];

const STATUS_ROTULO: Record<string, string> = {
  bom: "Saudável",
  atencao: "Atenção",
  critico: "Crítico",
};

function Variacao({ valor }: { valor: number }) {
  const positivo = valor >= 0;
  const Icone = positivo ? TrendingUp : TrendingDown;
  return (
    <span
      className="inline-flex items-center gap-1 text-[12px] font-medium tabular-nums"
      style={{ color: positivo ? CORES.bom : CORES.critico }}
    >
      <Icone size={13} aria-hidden="true" />
      {positivo ? "+" : ""}
      {valor.toFixed(1)}%
    </span>
  );
}

export default function PortalGrupoNow() {
  const [view, setView] = useState<View>("overview");
  const [periodo, setPeriodo] = useState<PeriodoId>("ano");
  const [menuAberto, setMenuAberto] = useState(false);
  const [telaCheia, setTelaCheia] = useState(false);

  const unidadeAtiva = UNIDADES.find((u) => u.id === view);

  const navegar = (destino: View) => {
    setView(destino);
    setMenuAberto(false);
    if (destino === "overview") setTelaCheia(false);
  };

  return (
    <div className="h-screen overflow-hidden bg-[#0B0F14] font-sans text-[#E9EDF2] antialiased">
      <div className="flex h-full">
        {/* ---------------------------------------------------------- Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-[#1C242F] bg-[#0D1219] transition-transform duration-200 lg:static lg:translate-x-0 ${
            menuAberto ? "translate-x-0" : "-translate-x-full"
          } ${telaCheia ? "lg:hidden" : ""}`}
        >
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#1C242F] px-5">
            <LogoGrupoNow className="h-9 w-auto" />
            <button
              onClick={() => setMenuAberto(false)}
              className="text-[#6F7987] hover:text-[#E9EDF2] lg:hidden"
              aria-label="Fechar menu"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-3">
            <p className="px-2 pb-2 pt-2 text-[11px] font-medium uppercase tracking-wide text-[#5A6472]">
              Geral
            </p>
            <button
              onClick={() => navegar("overview")}
              className={`mb-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[14px] transition-colors ${
                view === "overview"
                  ? "bg-[#16202C] font-medium text-[#E9EDF2]"
                  : "text-[#8A94A3] hover:bg-[#131A23] hover:text-[#E9EDF2]"
              }`}
            >
              <LayoutGrid size={16} aria-hidden="true" />
              Visão geral
            </button>

            <p className="px-2 pb-2 pt-4 text-[11px] font-medium uppercase tracking-wide text-[#5A6472]">
              Empresas
            </p>
            {UNIDADES.map((u) => (
              <button
                key={u.id}
                onClick={() => navegar(u.id)}
                className={`mb-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[14px] transition-colors ${
                  view === u.id
                    ? "bg-[#16202C] font-medium text-[#E9EDF2]"
                    : "text-[#8A94A3] hover:bg-[#131A23] hover:text-[#E9EDF2]"
                }`}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                  style={{ background: u.cor }}
                  aria-hidden="true"
                />
                <span className="flex-1 truncate">{u.nome}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto shrink-0 border-t border-[#1C242F] p-4">
            <p className="mb-2.5 px-1 text-[11px] font-medium uppercase tracking-wide text-[#5A6472]">
              Diretoria
            </p>
            {DIRETORIA.map((pessoa) => (
              <div
                key={pessoa.nome}
                className="flex items-center gap-2.5 py-1.5"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#16202C] text-[12px] font-semibold text-[#B9C2CE]">
                  {pessoa.iniciais}
                </div>
                <div className="min-w-0 leading-tight">
                  <p className="truncate text-[13px] font-medium">
                    {pessoa.nome}
                  </p>
                  <p className="truncate text-[11px] text-[#6F7987]">
                    {pessoa.cargo}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {menuAberto && (
          <div
            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
            onClick={() => setMenuAberto(false)}
          />
        )}

        {/* ------------------------------------------------------------ Main */}
        <div className="flex min-w-0 min-h-0 flex-1 flex-col">
          <header
            className={`h-16 shrink-0 items-center gap-3 border-b border-[#1C242F] bg-[#0D1219] px-5 ${
              telaCheia ? "hidden lg:hidden" : "flex"
            }`}
          >
            <button
              onClick={() => setMenuAberto(true)}
              className="text-[#8A94A3] hover:text-[#E9EDF2] lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[15px] font-semibold">
                {view === "overview"
                  ? "Visão geral do grupo"
                  : unidadeAtiva?.nome}
              </h1>
              <p className="truncate text-[12px] text-[#6F7987]">
                {view === "overview"
                  ? `Consolidado das empresas do Grupo Now · ${RECORTE.rotulo} (${RECORTE.detalhe})`
                  : unidadeAtiva?.descricao}
              </p>
            </div>

            {view === "overview" ? (
              <div className="flex items-center gap-1 rounded-lg border border-[#1C242F] bg-[#0B0F14] p-1">
                {PERIODOS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPeriodo(p.id)}
                    className={`rounded-md px-3 py-1.5 text-[12px] transition-colors ${
                      periodo === p.id
                        ? "bg-[#1C2635] font-medium text-[#E9EDF2]"
                        : "text-[#8A94A3] hover:text-[#E9EDF2]"
                    }`}
                  >
                    {p.rotulo}
                  </button>
                ))}
              </div>
            ) : null}
          </header>

          <main
            className={`min-h-0 min-w-0 flex-1 ${
              view === "overview" ? "overflow-auto" : "overflow-hidden"
            }`}
          >
            {view === "overview" ? (
              <div className="mx-auto max-w-6xl p-5 lg:p-8">
                {/* KPIs consolidados */}
                <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {KPIS_CONSOLIDADOS.map((k) => (
                    <div
                      key={k.id}
                      className="rounded-xl border border-[#1C242F] bg-[#12171F] p-5"
                    >
                      <p className="mb-3 text-[12px] text-[#8A94A3]">
                        {k.rotulo}
                      </p>
                      <p className="mb-2 whitespace-nowrap text-[24px] font-semibold leading-none tracking-tight tabular-nums">
                        {k.valor}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <Variacao valor={k.variacao} />
                        <span className="text-[12px] text-[#6F7987]">
                          {k.detalhe}
                        </span>
                      </div>
                    </div>
                  ))}
                </section>

                {/* Gráfico consolidado */}
                <section className="mb-6 rounded-xl border border-[#1C242F] bg-[#12171F] p-5 lg:p-6">
                  <ReceitaChart />
                  <details className="mt-5 border-t border-[#1C242F] pt-4">
                    <summary className="cursor-pointer text-[12px] text-[#8A94A3] hover:text-[#E9EDF2]">
                      Ver dados em tabela
                    </summary>
                    <table className="mt-3 w-full text-left text-[13px]">
                      <thead>
                        <tr className="text-[#6F7987]">
                          <th className="py-1.5 font-medium">Mês</th>
                          <th className="py-1.5 text-right font-medium">
                            NLG Comex
                          </th>
                          <th className="py-1.5 text-right font-medium">
                            Jornada 4S
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-[#B9C2CE]">
                        {RECEITA_MENSAL.map((d) => (
                          <tr key={d.mes} className="border-t border-[#1A222C]">
                            <td className="py-1.5">{d.mes}</td>
                            <td className="py-1.5 text-right tabular-nums">
                              {d.nlgcomex}
                            </td>
                            <td className="py-1.5 text-right tabular-nums">
                              {d.pulse4s}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </details>
                </section>

                {/* Cartões por empresa */}
                <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {UNIDADES.map((u) => {
                    const resumo = RESUMO_UNIDADES.find((r) => r.id === u.id)!;
                    return (
                      <div
                        key={u.id}
                        className="flex flex-col rounded-xl border border-[#1C242F] bg-[#12171F] p-5"
                      >
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="h-8 w-1 rounded-full"
                              style={{ background: u.cor }}
                              aria-hidden="true"
                            />
                            <div className="leading-tight">
                              <h3 className="text-[15px] font-semibold">
                                {u.nome}
                              </h3>
                              <p className="text-[12px] text-[#6F7987]">
                                {u.descricao}
                              </p>
                            </div>
                          </div>
                          <span
                            className="flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium"
                            style={{
                              color: STATUS_COR[resumo.status],
                              borderColor: `${STATUS_COR[resumo.status]}44`,
                              background: `${STATUS_COR[resumo.status]}14`,
                            }}
                          >
                            <ShieldCheck size={12} aria-hidden="true" />
                            {STATUS_ROTULO[resumo.status]}
                          </span>
                        </div>

                        <div className="mb-4 grid grid-cols-3 gap-3">
                          {resumo.metricas.map((m) => (
                            <div key={m.rotulo}>
                              <p className="mb-1 text-[11px] text-[#6F7987]">
                                {m.rotulo}
                              </p>
                              <p className="text-[16px] font-semibold tabular-nums">
                                {m.valor}
                              </p>
                              <Variacao valor={m.variacao} />
                            </div>
                          ))}
                        </div>

                        <p className="mb-4 text-[12px] text-[#8A94A3]">
                          {resumo.statusTexto}
                        </p>

                        <button
                          onClick={() => navegar(u.id)}
                          className="mt-auto flex items-center justify-center gap-1.5 rounded-lg border border-[#243040] bg-[#16202C] px-4 py-2.5 text-[13px] font-medium transition-colors hover:bg-[#1C2635]"
                        >
                          Abrir dashboard completo
                          <ArrowUpRight size={15} aria-hidden="true" />
                        </button>
                      </div>
                    );
                  })}
                </section>

                <p className="mt-6 flex items-center gap-1.5 text-[12px] text-[#5A6472]">
                  <BarChart3 size={13} aria-hidden="true" />
                  Números de demonstração — as integrações reais entram no lugar
                  do arquivo <code className="text-[#6F7987]">src/data/mock.ts</code>.
                </p>
              </div>
            ) : (
              unidadeAtiva && (
                <DashboardEmbed
                  unidade={unidadeAtiva}
                  telaCheia={telaCheia}
                  onToggleTelaCheia={() => setTelaCheia((v) => !v)}
                />
              )
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
