/**
 * Camada de dados ao vivo do portal.
 *
 * O portal chama a rota do servidor `/api/public/resumo-grupo`, que busca os
 * painéis das duas unidades do lado do servidor (sem problema de CORS),
 * grava o resultado na tabela `resumo_grupo` e devolve o JSON atualizado.
 *
 * Regra de ouro mantida: quando uma fonte falha, o portal NÃO inventa e NÃO
 * finge. Ele cai no último retrato conhecido (`SNAPSHOT`) e marca a data
 * daquele retrato na tela, para o leitor saber que está vendo dado velho.
 */

import { SNAPSHOT } from "@/data/snapshot";
import type { UnidadeId } from "@/config/dashboards";

/** Rota do próprio portal — servidor a servidor com os painéis. */
export const ENDPOINT_RESUMO = "/api/public/resumo-grupo";

export type EstadoFonte = "ao-vivo" | "retrato" | "carregando";

/** Ranking de pessoas (vendedores) de uma unidade, quando a fonte manda. */
export interface PessoaFonte {
  nome: string;
  valor: number;
  itens?: number;
}

export interface ResumoFonte {
  id: UnidadeId;
  realizadoAno: number;
  metaAno?: number;
  progresso?: number;
  /** ISO. Quando vem do retrato, é a data da leitura manual. */
  atualizadoEm: string;
  estado: EstadoFonte;
  /** Percentual da meta anual realizado em cada mês, 12 posições. */
  progressoMensal?: number[];
  /** Ranking de pessoas, quando a fonte manda (ex.: vendedores da WON). */
  pessoas?: PessoaFonte[];
}

interface LinhaResumo {
  empresa: string;
  nome: string;
  realizado_ano: number;
  meta_ano: number | null;
  fonte: string;
  atualizado_em: string;
  progressoMensal?: number[];
  pessoas?: PessoaFonte[];
}

interface RespostaResumo {
  ok: boolean;
  atualizadoEm: string;
  resumo: LinhaResumo[];
  erro?: string;
}

function doRetrato(id: "nlgcomex" | "pulse4s"): ResumoFonte {
  const s = SNAPSHOT[id];
  return {
    id,
    realizadoAno: s.realizadoAno,
    metaAno: s.metaAno,
    progresso: (s.realizadoAno / s.metaAno) * 100,
    atualizadoEm: SNAPSHOT.lidoEm,
    ...(s.progressoMensal ? { progressoMensal: [...s.progressoMensal] } : {}),
    estado: "retrato",
  };
}

function daLinha(l: LinhaResumo): ResumoFonte | null {
  if (
    l.empresa !== "nlgcomex" &&
    l.empresa !== "pulse4s" &&
    l.empresa !== "won" &&
    l.empresa !== "ndl"
  ) return null;
  const metaAno = l.meta_ano ?? undefined;
  return {
    id: l.empresa,
    realizadoAno: l.realizado_ano,
    ...(metaAno !== undefined ? { metaAno } : {}),
    ...(metaAno !== undefined && metaAno > 0
      ? { progresso: (l.realizado_ano / metaAno) * 100 }
      : {}),
    atualizadoEm: l.atualizado_em,
    ...(l.progressoMensal ? { progressoMensal: l.progressoMensal } : {}),
    ...(l.pessoas && l.pessoas.length > 0 ? { pessoas: l.pessoas } : {}),
    estado: l.fonte === "retrato" ? "retrato" : "ao-vivo",
  };
}

/**
 * Uma chamada só: o servidor consolida as duas unidades. Se a rota falhar
 * (ou faltar uma empresa na resposta), aquela unidade cai no retrato — o
 * portal pode ficar meio ao vivo e meio retrato, e a tela diz qual é qual.
 */
export async function buscarResumos(
  signal?: AbortSignal,
): Promise<ResumoFonte[]> {
  let linhas: ResumoFonte[] = [];
  try {
    const r = await fetch(ENDPOINT_RESUMO, { signal: signal ?? null });
    if (!r.ok) throw new Error(`resumo-grupo respondeu ${r.status}`);
    const j: RespostaResumo = await r.json();
    if (!j.ok) throw new Error(j.erro ?? "resumo-grupo falhou");
    linhas = (j.resumo ?? [])
      .map(daLinha)
      .filter((l): l is ResumoFonte => l !== null);
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    linhas = [];
  }

  const nlg = linhas.find((l) => l.id === "nlgcomex") ?? doRetrato("nlgcomex");
  const s4 = linhas.find((l) => l.id === "pulse4s") ?? doRetrato("pulse4s");
  const won = linhas.find((l) => l.id === "won");
  return won ? [nlg, s4, won] : [nlg, s4];
}

/** O grupo é a soma — a única conta do portal. */
export function consolidar(fontes: ResumoFonte[]) {
  const realizado = fontes.reduce((a, f) => a + f.realizadoAno, 0);
  const meta = fontes.reduce((a, f) => a + (f.metaAno ?? 0), 0);
  return {
    realizado,
    meta,
    progresso: meta > 0 ? (realizado / meta) * 100 : undefined,
    /** Ao vivo só quando TODAS as fontes estão ao vivo. */
    estado: fontes.every((f) => f.estado === "ao-vivo")
      ? ("ao-vivo" as const)
      : ("retrato" as const),
  };
}
