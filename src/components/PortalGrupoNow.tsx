import { useState } from "react";
import { Clock3, LayoutGrid, Menu, X } from "lucide-react";
import LogoGrupoNow from "@/components/LogoGrupoNow";
import DashboardEmbed from "@/components/DashboardEmbed";
import PainelResumo from "@/components/PainelResumo";
import ExecutiveOverview from "@/components/ExecutiveOverview";
import { UNIDADES, type UnidadeId } from "@/config/dashboards";
import { useResumoGrupo } from "@/hooks/useResumoGrupo";

type View = "overview" | UnidadeId;

/** Quem acompanha o portal. Ajuste os cargos se precisar. */
const DIRETORIA = [
  { nome: "Giuliano Redua", cargo: "Diretoria", iniciais: "GR" },
  { nome: "José Olacyr", cargo: "Diretoria", iniciais: "JO" },
  { nome: "Josivaldo", cargo: "Diretoria", iniciais: "JS" },
];

export default function PortalGrupoNow() {
  const [view, setView] = useState<View>("overview");
  const [menuAberto, setMenuAberto] = useState(false);
  const [telaCheia, setTelaCheia] = useState(false);
  const resumo = useResumoGrupo();

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
              telaCheia || view === "overview" ? "hidden" : "flex"
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


          </header>

          <main
            className={`min-h-0 min-w-0 flex-1 ${
              view === "overview" ? "overflow-auto" : "overflow-hidden"
            }`}
          >
            {view === "overview" ? (
              <ExecutiveOverview resumo={resumo} onNavigate={navegar} />
            ) : (
              unidadeAtiva &&
               (unidadeAtiva.pendente ? (
                <section className="flex h-full items-center justify-center px-6 py-12 text-center">
                  <div className="max-w-xl">
                    <div
                      className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border"
                      style={{
                        color: unidadeAtiva.cor,
                        borderColor: `${unidadeAtiva.cor}55`,
                        background: `${unidadeAtiva.cor}12`,
                      }}
                    >
                      <Clock3 size={30} aria-hidden="true" />
                    </div>
                    <h2 className="mb-2 text-[22px] font-semibold">Em construção</h2>
                    <p className="text-[14px] leading-relaxed text-[#8A94A3]">
                      {unidadeAtiva.descricao} — assim que a integração estiver
                      pronta, o painel da {unidadeAtiva.nome} aparece aqui.
                    </p>
                  </div>
                </section>
              ) : unidadeAtiva.url ? (
                <DashboardEmbed
                  unidade={unidadeAtiva}
                  telaCheia={telaCheia}
                  onToggleTelaCheia={() => setTelaCheia((v) => !v)}
                />
              ) : (
                <PainelResumo unidade={unidadeAtiva} resumo={resumo} />
              ))
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
