import { useMemo } from "react";
import { UNIDADES } from "@/config/dashboards";
import type { ResumoGrupo } from "@/hooks/useResumoGrupo";

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

/**
 * Consolida os números reais do grupo (empresas, série mensal, projeção,
 * ritmo e texto de saúde) num único lugar — usado pela Visão geral e pela
 * Apresentação executiva, para as duas telas nunca divergirem no cálculo.
 */
export function useVisaoGrupo(resumo: ResumoGrupo) {
  const sources = resumo.fontes;

  const companies = useMemo(() => UNIDADES.map((unit) => {
    const source = sources.find((item) => item.id === unit.id);
    const value = source?.realizadoAno ?? 0;
    const share = resumo.grupo.realizado > 0 ? (value / resumo.grupo.realizado) * 100 : 0;
    const serie = source?.progressoMensal?.filter((point) => point > 0) ?? [];
    const meta = source?.metaAno;
    return { ...unit, value, share, source, meta, serie };
  }), [resumo.grupo.realizado, sources]);

  // Receita acumulada do grupo: só entram as fontes que publicam série mensal real.
  const chartValues = useMemo(() => {
    const comSerie = sources.filter((source) => source.progressoMensal?.length && source.metaAno);
    if (comSerie.length === 0) return [] as { month: string; value: number }[];
    return MESES.map((month, index) => ({
      month,
      value: comSerie.reduce((sum, source) => sum + ((source.progressoMensal?.[index] ?? 0) / 100) * (source.metaAno ?? 0), 0),
    })).filter((point) => point.value > 0);
  }, [sources]);

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
    ? `com todas as empresas dentro do esperado`
    : `mas ${abaixoDaMeta.map((c) => c.nome).join(" e ")} ${abaixoDaMeta.length > 1 ? "estão" : "está"} abaixo do esperado`;

  return {
    sources,
    companies,
    chartValues,
    realizado,
    meta,
    progresso,
    saldo,
    comMeta,
    acimaDaMeta,
    abaixoDaMeta,
    lider,
    aoVivo,
    mesesComDados,
    mesesRestantes,
    projecaoAnual,
    ritmoAtual,
    ritmoNecessario,
    ultimaAtualizacao,
    saudeTexto,
  };
}

export type VisaoGrupo = ReturnType<typeof useVisaoGrupo>;
