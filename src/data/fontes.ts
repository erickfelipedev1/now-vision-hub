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

/** Rota do próprio portal — servidor a servidor com os painéis. */
export const ENDPOINT_RESUMO = "/api/public/resumo-grupo";

export type UnidadeId = "nlgcomex" | "pulse4s";
export type EstadoFonte = "ao-vivo" | "retrato" | "carregando";

export interface ResumoFonte {
  id: UnidadeId;
  realizadoAno: number;
  metaAno: number;
  progresso: number;
  /** ISO. Quando vem do retrato, é a data da leitura manual. */
  atualizadoEm: string;
  estado: EstadoFonte;
  /** Percentual da meta anual realizado em cada mês, 12 posições. */
  progressoMensal?: number[];
}

interface LinhaResumo {
  empresa: string;
  nome: string;
  realizado_ano: number;
  meta_ano: number;
  fonte: string;
  atualizado_em: string;
  progressoMensal?: number[];
}

interface RespostaResumo {
  ok: boolean;
  atualizadoEm: string;
  resumo: LinhaResumo[];
  erro?: string;
}

function doRetrato(id: UnidadeId): ResumoFonte {
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
  if (l.empresa !== "nlgcomex" && l.empresa !== "pulse4s") return null;
  return {
    id: l.empresa,
    realizadoAno: l.realizado_ano,
    metaAno: l.meta_ano,
    progresso: l.meta_ano > 0 ? (l.realizado_ano / l.meta_ano) * 100 : 0,
    atualizadoEm: l.atualizado_em,
    ...(l.progressoMensal ? { progressoMensal: l.progressoMensal } : {}),
    estado: "ao-vivo",
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
  return [nlg, s4];
}

/** O grupo é a soma — a única conta do portal. */
export function consolidar(fontes: ResumoFonte[]) {
  const realizado = fontes.reduce((a, f) => a + f.realizadoAno, 0);
  const meta = fontes.reduce((a, f) => a + f.metaAno, 0);
  return {
    realizado,
    meta,
    progresso: (realizado / meta) * 100,
    /** Ao vivo só quando TODAS as fontes estão ao vivo. */
    estado: fontes.every((f) => f.estado === "ao-vivo")
      ? ("ao-vivo" as const)
      : ("retrato" as const),
  };
}
