/**
 * GET /api/public/resumo-grupo
 *
 * Coleta o consolidado anual das duas empresas do grupo (servidor-a-servidor,
 * sem CORS no caminho), grava em public.resumo_grupo e devolve as duas linhas.
 *
 * NLG  -> https://groupnow-nlgcomex.lovable.app/api/public/painel
 * 4S   -> /api/public/resumo (quando existir) ou leitura da tela /diretores
 *         e, em último caso, o último retrato conhecido.
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

  // 1) rota pública, se um dia existir
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
    /* segue para a leitura da tela */
  }

  // 2) leitura da tela /diretores
  try {
    const r = await fetch("https://clint-pulse.lovable.app/diretores", {
      headers: { accept: "text/html" },
    });
    if (r.ok) {
      const html = await r.text();
      const realizado =
        html.match(/"realizadoAno"\s*:\s*([\d.]+)/)?.[1] ??
        html.match(/[Ff]aturamento[^0-9R]{0,80}(R\$\s*[\d.,]+)/)?.[1];
      const meta =
        html.match(/"metaAno"\s*:\s*([\d.]+)/)?.[1] ??
        html.match(/[Mm]eta[^0-9R]{0,80}(R\$\s*[\d.,]+)/)?.[1];
      const rn = realizado ? paraNumero(realizado) : null;
      const mn = meta ? paraNumero(meta) : null;
      if (rn && mn) {
        return {
          empresa: "pulse4s",
          nome: "Jornada 4S",
          realizado_ano: rn,
          meta_ano: mn,
          fonte: "tela:clint-pulse/diretores",
          atualizado_em: agora,
        };
      }
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
