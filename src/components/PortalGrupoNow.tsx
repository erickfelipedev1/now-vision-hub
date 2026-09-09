import { useState } from "react";
import {
  ArrowUpRight,
  AlertTriangle,
  LayoutGrid,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";
import ReceitaChart from "@/components/ReceitaChart";
import ProgressoMetas from "@/components/ProgressoMetas";
import LogoGrupoNow from "@/components/LogoGrupoNow";
import DashboardEmbed from "@/components/DashboardEmbed";
import { UNIDADES, CORES, type UnidadeId } from "@/config/dashboards";
import { useResumoGrupo } from "@/hooks/useResumoGrupo";
import { RECEITA_MENSAL, PERIODOS, type PeriodoId } from "@/data/mock";
import { RECORTE, OBSERVACOES, DETALHES } from "@/data/snapshot";

type View = "overview" | UnidadeId;

/** Quem acompanha o portal. Ajuste os cargos se precisar. */
const DIRETORIA = [
  { nome: "Giuliano Redua", cargo: "Diretoria", iniciais: "GR" },
  { nome: "José Olacyr", cargo: "Diretoria", iniciais: "JO" },
  { nome: "Josivaldo", cargo: "Diretoria", iniciais: "JS" },
];

const brl = (v: number) =>
  v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const dataHora = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function PortalGrupoNow() {
  const [view, setView] = useState<View>("overview");
  const [periodo, setPeriodo] = useState<PeriodoId>("ano");
  const [menuAberto, setMenuAberto] = useState(false);
  const [telaCheia, setTelaCheia] = useState(false);
  const resumo = useResumoGrupo();

  const unidadeAtiva = UNIDADES.find((u) => u.id === view);

  const fonteNlg = resumo.fontes.find((f) => f.id === "nlgcomex");
  const fonte4s = resumo.fontes.find((f) => f.id === "pulse4s");
  const excedeu = resumo.grupo.realizado >= resumo.grupo.meta;

  const kpis = [
    {
      id: "grupo",
      rotulo: "Realizado no ano · grupo",
      valor: brl(resumo.grupo.realizado),
      detalhe: excedeu
        ? `${brl(resumo.grupo.realizado - resumo.grupo.meta)} acima da meta de ${brl(resumo.grupo.meta)}`
        : `faltam ${brl(resumo.grupo.meta - resumo.grupo.realizado)} de ${brl(resumo.grupo.meta)}`,
      retrato: resumo.grupo.estado === "retrato",
    },
    {
      id: "nlg",
      rotulo: "Realizado · NLG Comex",
      valor: fonteNlg ? brl(fonteNlg.realizadoAno) : "—",
      detalhe: `média de ${brl(DETALHES.nlgcomex.mediaMensal)}/mês em 8 meses`,
      retrato: fonteNlg?.estado === "retrato",
    },
    {
      id: "s4",
      rotulo: "Realizado · Jornada 4S",
      valor: fonte4s ? brl(fonte4s.realizadoAno) : "—",
      detalhe: fonte4s
        ? `faltam ${brl(Math.max(0, fonte4s.metaAno - fonte4s.realizadoAno))} para a meta do ano`
        : "",
      retrato: fonte4s?.estado === "retrato",
    },
    {
      id: "ritmo",
      rotulo: "Run rate necessário · 4S",
      valor: `${brl(DETALHES.pulse4s.runRate)}/mês`,
      detalhe: `para fechar a meta nos ${DETALHES.pulse4s.mesesRestantes} meses restantes`,
      retrato: false,
    },
  ];

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
                {/* Fato bruto — os percentuais ficam nos medidores abaixo */}
                <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {kpis.map((k) => (
                    <div
                      key={k.id}
                      className="rounded-xl border border-[#1C242F] bg-[#12171F] p-5"
                    >
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <p className="text-[12px] text-[#8A94A3]">{k.rotulo}</p>
                        {k.retrato && (
                          <span className="shrink-0 rounded-full border border-[#3A2F1A] px-2 py-0.5 text-[10px] font-medium text-[#C08A1E]">
                            retrato
                          </span>
                        )}
                      </div>
                      {resumo.carregando ? (
                        <div className="mb-2 h-6 w-32 animate-pulse rounded bg-[#1A222C]" />
                      ) : (
                        <p className="mb-2 whitespace-nowrap text-[24px] font-semibold leading-none tracking-tight tabular-nums">
                          {k.valor}
                        </p>
                      )}
                      <span className="text-[12px] text-[#6F7987]">
                        {k.detalhe}
                      </span>
                    </div>
                  ))}
                </section>

                {/* Meta anual — a pergunta principal da diretoria */}
                <section className="mb-6 rounded-xl border border-[#1C242F] bg-[#12171F] p-5 lg:p-6">
                  <ProgressoMetas resumo={resumo} />
                </section>

                {/* Série mensal da NLG */}
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
                              {d.pulse4s ?? (
                                <span className="text-[#3E4855]">sem dado</span>
                              )}
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
                    const fonte = resumo.fontes.find((f) => f.id === u.id);
                    const det = DETALHES[u.id];
                    const bateu = fonte ? fonte.progresso >= 100 : false;
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
                          {fonte && (
                            <span
                              className="flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium"
                              style={{
                                color: bateu ? CORES.bom : CORES.atencao,
                                borderColor: `${bateu ? CORES.bom : CORES.atencao}44`,
                                background: `${bateu ? CORES.bom : CORES.atencao}14`,
                              }}
                            >
                              <ShieldCheck size={12} aria-hidden="true" />
                              {bateu ? "Meta batida" : "Em andamento"}
                            </span>
                          )}
                        </div>

                        <div className="mb-4 grid grid-cols-3 gap-3">
                          <div>
                            <p className="mb-1 text-[11px] text-[#6F7987]">
                              Realizado no ano
                            </p>
                            <p className="text-[16px] font-semibold tabular-nums">
                              {fonte ? brl(fonte.realizadoAno) : "—"}
                            </p>
                          </div>
                          <div>
                            <p className="mb-1 text-[11px] text-[#6F7987]">
                              Progresso
                            </p>
                            <p className="text-[16px] font-semibold tabular-nums">
                              {fonte
                                ? `${fonte.progresso.toLocaleString("pt-BR", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}%`
                                : "—"}
                            </p>
                          </div>
                          <div>
                            <p className="mb-1 text-[11px] text-[#6F7987]">
                              {u.id === "nlgcomex" ? "Margem" : "Reuniões"}
                            </p>
                            <p className="text-[16px] font-semibold tabular-nums">
                              {u.id === "nlgcomex"
                                ? DETALHES.nlgcomex.margem
                                : DETALHES.pulse4s.reunioes}
                            </p>
                          </div>
                        </div>

                        <p className="mb-4 text-[12px] text-[#8A94A3]">
                          {u.id === "nlgcomex"
                            ? `${det ? "Média de " + brl(DETALHES.nlgcomex.mediaMensal) + "/mês" : ""} · ${DETALHES.nlgcomex.mesesRestantes} meses restantes`
                            : `Precisa de ${brl(DETALHES.pulse4s.runRate)}/mês nos ${DETALHES.pulse4s.mesesRestantes} meses restantes`}
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

                <section className="mt-6 rounded-xl border border-[#1C242F] bg-[#12171F] p-5">
                  <p className="mb-3 flex items-center gap-1.5 text-[12px] font-medium text-[#8A94A3]">
                    <AlertTriangle size={13} aria-hidden="true" />
                    A conferir
                  </p>
                  <ul className="space-y-1.5">
                    {OBSERVACOES.map((o) => (
                      <li key={o} className="text-[12px] leading-relaxed text-[#6F7987]">
                        {o}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 border-t border-[#1C242F] pt-3 text-[11px] text-[#5A6472]">
                    {resumo.carregando
                      ? "Buscando os números nas APIs dos painéis…"
                      : resumo.temRetrato
                      ? "Alguma API não respondeu; os cartões marcados como “retrato” mostram a última leitura manual, não o dado de agora."
                      : `Números buscados ao vivo nas APIs dos painéis. NLG atualizada em ${
                          fonteNlg ? dataHora(fonteNlg.atualizadoEm) : "—"
                        }.`}
                  </p>
                </section>
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
