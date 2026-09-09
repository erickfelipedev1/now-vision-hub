/**
 * Camada de dados ao vivo do portal.
 *
 * Antes, a visão geral era um retrato digitado à mão: os painéis embedados
 * atualizavam sozinhos e a faixa de cima não. Aqui ela passa a buscar os
 * mesmos números na fonte.
 *
 * Regra de ouro mantida: quando uma fonte falha, o portal NÃO inventa e NÃO
 * finge. Ele cai no último retrato conhecido (`SNAPSHOT`) e marca a data
 * daquele retrato na tela, para o leitor saber que está vendo dado velho.
 */

import { SNAPSHOT } from "@/data/snapshot";

export const ENDPOINTS = {
  /** Já existe e está no ar. Só faltava liberar CORS para o portal. */
  nlgcomex: "https://groupnow-nlgcomex.lovable.app/api/public/painel",
  /** A criar no projeto clint-pulse — ver PROMPT-APIS.md. */
  pulse4s: "https://clint-pulse.lovable.app/api/public/resumo",
} as const;

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

/* ------------------------------------------------------------------- NLG */

interface PainelNLG {
  ano: number;
  atualizadoEm: string;
  metaGlobal: number;
  realizadoAno: number;
  progressoGlobal: number;
  progressoGlobalMensal: number[];
  setores: {
    id: string;
    nome: string;
    metaAnual: number;
    realizadoAno: number;
    progressoAnual: number;
    representatividade: number;
  }[];
  /** Margem mensal por empresa do grupo — inclui unidades fora deste portal. */
  margem: Record<string, (number | null)[]>;
}

async function buscarNLG(signal?: AbortSignal): Promise<ResumoFonte> {
  const r = await fetch(ENDPOINTS.nlgcomex, { signal: signal ?? null });
  if (!r.ok) throw new Error(`NLG respondeu ${r.status}`);
  const j: PainelNLG = await r.json();
  return {
    id: "nlgcomex",
    realizadoAno: j.realizadoAno,
    metaAno: j.metaGlobal,
    progresso: j.progressoGlobal,
    atualizadoEm: j.atualizadoEm,
    progressoMensal: j.progressoGlobalMensal,
    estado: "ao-vivo",
  };
}

/* -------------------------------------------------------------------- 4S */

interface ResumoAPI {
  atualizadoEm: string;
  realizadoAno: number;
  metaAno: number;
  progresso: number;
}

async function buscar4S(signal?: AbortSignal): Promise<ResumoFonte> {
  const r = await fetch(ENDPOINTS.pulse4s, { signal: signal ?? null });
  if (!r.ok) throw new Error(`4S respondeu ${r.status}`);
  const j: ResumoAPI = await r.json();
  return {
    id: "pulse4s",
    realizadoAno: j.realizadoAno,
    metaAno: j.metaAno,
    progresso: j.progresso,
    atualizadoEm: j.atualizadoEm,
    estado: "ao-vivo",
  };
}

/* --------------------------------------------------------------- retrato */

function doRetrato(id: UnidadeId): ResumoFonte {
  const s = SNAPSHOT[id];
  return {
    id,
    realizadoAno: s.realizadoAno,
    metaAno: s.metaAno,
    progresso: (s.realizadoAno / s.metaAno) * 100,
    atualizadoEm: SNAPSHOT.lidoEm,
    progressoMensal: s.progressoMensal ? [...s.progressoMensal] : undefined,
    estado: "retrato",
  };
}

/**
 * Busca as duas fontes em paralelo. Uma falha não derruba a outra: cada
 * unidade cai no seu próprio retrato, então o portal pode ficar meio ao vivo
 * e meio retrato — e a tela diz qual é qual.
 */
export async function buscarResumos(
  signal?: AbortSignal
): Promise<ResumoFonte[]> {
  const [nlg, s4] = await Promise.allSettled([
    buscarNLG(signal),
    buscar4S(signal),
  ]);
  return [
    nlg.status === "fulfilled" ? nlg.value : doRetrato("nlgcomex"),
    s4.status === "fulfilled" ? s4.value : doRetrato("pulse4s"),
  ];
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
