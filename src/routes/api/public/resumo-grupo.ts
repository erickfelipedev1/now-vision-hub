/**
 * GET /api/public/resumo-grupo
 *
 * Coleta o consolidado anual das duas empresas do grupo (servidor-a-servidor,
 * sem CORS no caminho), grava em public.resumo_grupo e devolve as duas linhas.
 *
 * NLG  -> https://groupnow-nlgcomex.lovable.app/api/public/painel
 * 4S   -> https://clint-pulse.lovable.app/api/public/diretoria?format=json
 *         (usa apenas o bloco "Resumo", ignorando Pessoa/Canal).
 *         Fallbacks: /api/public/resumo, depois snapshot.
 */

import { createFileRoute } from "@tanstack/react-router";
import { SNAPSHOT } from "@/data/snapshot";

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "https://now-vision-hub.lovable.app",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

interface Linha {
  empresa: string;
  nome: string;
  realizado_ano: number;
  meta_ano: number;
  fonte: string;
  atualizado_em: string;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

/** Converte "R$ 999.570,90" / "999570.90" em número. */
function paraNumero(bruto: string): number | null {
  const limpo = bruto
    .replace(/[^\d.,-]/g, "")
    .replace(/\.(?=\d{3}\b)/g, "")
    .replace(",", ".");
  const n = Number(limpo);
  return Number.isFinite(n) && n > 0 ? n : null;
}

async function lerNLG(): Promise<Linha> {
  const agora = new Date().toISOString();
  try {
    const r = await fetch(
      "https://groupnow-nlgcomex.lovable.app/api/public/painel",
      { headers: { accept: "application/json" } },
    );
    if (!r.ok) throw new Error(String(r.status));
    const j = (await r.json()) as {
      realizadoAno?: number;
      metaGlobal?: number;
      atualizadoEm?: string;
    };
    if (typeof j.realizadoAno !== "number" || typeof j.metaGlobal !== "number")
      throw new Error("payload inesperado");
    return {
      empresa: "nlgcomex",
      nome: "NLG Comex",
      realizado_ano: j.realizadoAno,
      meta_ano: j.metaGlobal,
      fonte: "api:groupnow-nlgcomex/painel",
      atualizado_em: j.atualizadoEm ?? agora,
    };
  } catch {
    return {
      empresa: "nlgcomex",
      nome: "NLG Comex",
      realizado_ano: SNAPSHOT.nlgcomex.realizadoAno,
      meta_ano: SNAPSHOT.nlgcomex.metaAno,
      fonte: "retrato",
      atualizado_em: SNAPSHOT.lidoEm,
    };
  }
}

async function lerPulse4S(): Promise<Linha> {
  const agora = new Date().toISOString();

  // 1) rota pública /api/public/resumo, se um dia existir
  try {
    const r = await fetch("https://clint-pulse.lovable.app/api/public/resumo", {
      headers: { accept: "application/json" },
    });
    if (r.ok) {
      const j = (await r.json()) as {
        realizadoAno?: number;
        metaAno?: number;
        atualizadoEm?: string;
      };
      if (typeof j.realizadoAno === "number" && typeof j.metaAno === "number") {
        return {
          empresa: "pulse4s",
          nome: "Jornada 4S",
          realizado_ano: j.realizadoAno,
          meta_ano: j.metaAno,
          fonte: "api:clint-pulse/resumo",
          atualizado_em: j.atualizadoEm ?? agora,
        };
      }
    }
  } catch {
    /* segue para a API de diretoria */
  }

  // 2) API de diretoria — usa SOMENTE o bloco "Resumo"
  try {
    const url =
      "https://clint-pulse.lovable.app/api/public/diretoria?token=bedfd9d8152959d162a4e0163b77240d5e9bd709aad73f90&format=json";
    const r = await fetch(url, { headers: { accept: "application/json" } });
    if (!r.ok) throw new Error(String(r.status));
    const j = (await r.json()) as {
      dados?: Array<{
        bloco?: string;
        nome?: string;
        faturamento?: number | string;
      }>;
    };
    const itens = Array.isArray(j.dados) ? j.dados : [];
    const resumo = itens.filter((i) => i.bloco === "Resumo");
    const realizadoItem = resumo.find((i) => i.nome === "Faturado no ano");
    const metaItem = resumo.find((i) => i.nome === "Meta do ano");
    const rn =
      typeof realizadoItem?.faturamento === "number"
        ? realizadoItem.faturamento
        : paraNumero(String(realizadoItem?.faturamento ?? ""));
    const mn =
      typeof metaItem?.faturamento === "number"
        ? metaItem.faturamento
        : paraNumero(String(metaItem?.faturamento ?? ""));
    if (rn && mn) {
      return {
        empresa: "pulse4s",
        nome: "Jornada 4S",
        realizado_ano: rn,
        meta_ano: mn,
        fonte: "api:clint-pulse/diretoria",
        atualizado_em: agora,
      };
    }
  } catch {
    /* cai no retrato */
  }

  // 3) último retrato conhecido
  return {
    empresa: "pulse4s",
    nome: "Jornada 4S",
    realizado_ano: SNAPSHOT.pulse4s.realizadoAno,
    meta_ano: SNAPSHOT.pulse4s.metaAno,
    fonte: "retrato",
    atualizado_em: SNAPSHOT.lidoEm,
  };
}

export const Route = createFileRoute("/api/public/resumo-grupo")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async () => {
        const linhas = await Promise.all([lerNLG(), lerPulse4S()]);

        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );
        const { data, error } = await supabaseAdmin
          .from("resumo_grupo")
          .upsert(linhas, { onConflict: "empresa" })
          .select();

        if (error) {
          return json(
            { erro: "Falha ao gravar o resumo", detalhe: error.message, linhas },
            500,
          );
        }

        return json({ atualizadoEm: new Date().toISOString(), linhas: data });
      },
    },
  },
});
