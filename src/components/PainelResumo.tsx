import { RefreshCw, Database, Radio } from "lucide-react";
import type { UnidadeConfig } from "@/config/dashboards";
import type { ResumoGrupo } from "@/hooks/useResumoGrupo";

/**
 * Painel de resumo para unidades sem dashboard próprio para embed
 * (hoje a WON; amanhã a NDL, quando sair do "Em construção").
 *
 * Mostra o essencial da unidade no mesmo padrão visual da Visão Geral:
 * realizado em destaque, medidor contra a meta anual, selo ao-vivo/retrato
 * e o mesmo botão Atualizar do resto do portal (mesmo hook, mesmo estado).
 */

const brl = (v: number) =>
  v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const pctFmt = (v: number) =>
  v.toLocaleString("pt-BR", {
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

export default function PainelResumo({
  unidade,
  resumo,
}: {
  unidade: UnidadeConfig;
  resumo: ResumoGrupo;
}) {
  const fonte = resumo.fontes.find((f) => f.id === unidade.id);
  const carregando = resumo.carregando;
  const retrato = fonte?.estado === "retrato";
  const meta = fonte?.metaAno;
  const temMeta = fonte !== undefined && meta !== undefined && meta > 0;
  const pct = temMeta ? (fonte.realizadoAno / meta) * 100 : 0;
  const escala = Math.max(100, pct);
  const largura = (pct / escala) * 100;
  const marcaMeta = (100 / escala) * 100;
  const bateu = pct >= 100;

  return (
    <section className="flex h-full items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl">
        {/* Cabeçalho da unidade */}
        <div className="mb-6 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className="h-10 w-1.5 rounded-full"
              style={{ background: unidade.cor }}
              aria-hidden="true"
            />
            <div className="leading-tight">
              <h2 className="text-[20px] font-semibold">{unidade.nome}</h2>
              <p className="text-[13px] text-[#6F7987]">{unidade.descricao}</p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[#5A6472]">
                <Database size={11} aria-hidden="true" />
                {unidade.fonteDados}
              </p>
            </div>
          </div>
          <button
            onClick={resumo.recarregar}
            disabled={carregando}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#1C242F] px-2.5 py-1.5 text-[12px] text-[#8A94A3] transition-colors hover:text-[#E9EDF2] disabled:opacity-50"
          >
            <RefreshCw
              size={13}
              aria-hidden="true"
              className={carregando ? "animate-spin" : ""}
            />
            Atualizar
          </button>
        </div>

        {/* Realizado em destaque */}
        <div className="mb-6 rounded-xl border border-[#1C242F] bg-[#12171F] p-6">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-[12px] text-[#6F7987]">Realizado no ano</p>
            {fonte && (
              <span
                className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium"
                style={
                  retrato
                    ? {
                        color: "#C08A1E",
                        borderColor: "#3A2F1A",
                        background: "#C08A1E14",
                      }
                    : {
                        color: "#3E9B62",
                        borderColor: "#3E9B6244",
                        background: "#3E9B6214",
                      }
                }
                title={
                  retrato
                    ? "A fonte não respondeu; exibindo a última leitura gravada"
                    : "Dado buscado agora na fonte"
                }
              >
                <Radio size={11} aria-hidden="true" />
                {retrato ? "retrato" : "ao-vivo"}
              </span>
            )}
          </div>
          {carregando ? (
            <div className="h-10 w-56 animate-pulse rounded bg-[#1A222C]" />
          ) : (
            <p className="text-[34px] font-bold tabular-nums leading-tight text-[#E9EDF2]">
              {fonte ? brl(fonte.realizadoAno) : "—"}
            </p>
          )}
          <p className="mt-2 text-[12px] text-[#5A6472]">
            {carregando
              ? "Buscando na fonte…"
              : fonte
                ? `${retrato ? "Última leitura gravada" : "Atualizado"} em ${dataHora(fonte.atualizadoEm)}.`
                : "Fonte sem dados no momento."}
          </p>
        </div>

        {/* Medidor contra a meta anual — mesmo padrão de ProgressoMetas */}
        <div className="rounded-xl border border-[#1C242F] bg-[#12171F] p-6">
          <h3 className="mb-4 text-[14px] font-semibold text-[#E9EDF2]">
            Realizado contra a meta anual
          </h3>
          {carregando ? (
            <div className="animate-pulse">
              <div className="mb-2 h-3 w-32 rounded bg-[#1A222C]" />
              <div className="h-2.5 w-full rounded-full bg-[#1A222C]" />
            </div>
          ) : !fonte || meta === undefined || meta <= 0 ? (
            <div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] text-[#E9EDF2]">{unidade.nome}</span>
                <span className="rounded-full border border-[#38414D] px-2 py-0.5 text-[10px] font-medium text-[#8A94A3]">
                  sem meta
                </span>
              </div>
              <p className="mt-2 text-[15px] font-semibold tabular-nums text-[#E9EDF2]">
                {fonte ? brl(fonte.realizadoAno) : "—"}
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <span className="text-[13px] text-[#E9EDF2]">{unidade.nome}</span>
                <span
                  className="text-[15px] font-semibold tabular-nums"
                  style={{ color: bateu ? "#3E9B62" : "#E9EDF2" }}
                >
                  {pctFmt(pct)}%
                </span>
              </div>
              <div
                className="relative h-2.5 w-full overflow-hidden rounded-full bg-[#1A222C]"
                role="img"
                aria-label={`${unidade.nome}: ${brl(fonte.realizadoAno)} de ${brl(meta)}, ${pctFmt(pct)} por cento da meta`}
              >
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{ width: `${largura}%`, background: unidade.cor }}
                />
                {escala > 100 && (
                  <div
                    className="absolute inset-y-0 w-px bg-[#0B0F14]"
                    style={{ left: `${marcaMeta}%` }}
                    title="meta"
                  />
                )}
              </div>
              <div className="mt-1.5 flex items-baseline justify-between gap-3">
                <span className="text-[12px] tabular-nums text-[#8A94A3]">
                  {brl(fonte.realizadoAno)}
                </span>
                <span className="text-[12px] tabular-nums text-[#5A6472]">
                  meta {brl(meta)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Pessoas — mesmo espírito do ranking da Jornada 4S */}
        {pessoas.length > 0 && (
          <div className="mt-6 rounded-xl border border-[#1C242F] bg-[#12171F] p-6">
            <h3 className="mb-4 flex items-center gap-2 text-[14px] font-semibold text-[#E9EDF2]">
              <Users size={14} aria-hidden="true" />
              Pessoas — faturamento no ano
            </h3>
            <ul className="space-y-3">
              {pessoas.map((p, i) => {
                const largura = maiorPessoa > 0 ? (p.valor / maiorPessoa) * 100 : 0;
                return (
                  <li key={p.nome}>
                    <div className="mb-1 flex items-baseline justify-between gap-3">
                      <span className="truncate text-[13px] text-[#E9EDF2]">
                        <span className="mr-2 text-[11px] tabular-nums text-[#5A6472]">
                          {i + 1}
                        </span>
                        {p.nome}
                      </span>
                      <span className="shrink-0 text-[13px] font-semibold tabular-nums text-[#E9EDF2]">
                        {brl(p.valor)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1A222C]">
                      <div
                        className="h-full rounded-full transition-[width] duration-500"
                        style={{ width: `${largura}%`, background: unidade.cor }}
                      />
                    </div>
                    {p.itens !== undefined && (
                      <p className="mt-1 text-[11px] tabular-nums text-[#5A6472]">
                        {p.itens.toLocaleString("pt-BR")} itens vendidos
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
