import { createFileRoute } from "@tanstack/react-router";

const URL_NLG = "https://groupnow-nlgcomex.lovable.app/api/public/painel";
const URL_4S =
  "https://clint-pulse.lovable.app/api/public/diretoria?token=bedfd9d8152959d162a4e0163b77240d5e9bd709aad73f90&format=json";

const ORIGENS_PERMITIDAS = [
  "https://now-vision-hub.lovable.app",
  "https://id-preview--dcffded8-ec22-41b6-b4a0-ed8e7399c389.lovable.app",
];

function corsHeaders(req: Request) {
  const origin = req.headers.get("Origin") ?? "";
  const allow = ORIGENS_PERMITIDAS.includes(origin)
    ? origin
    : ORIGENS_PERMITIDAS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, content-type, apikey",
    "Content-Type": "application/json",
  };
}

function numero(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(
      v.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", "."),
    );
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

/* NLG: painel público já existente — fetch servidor a servidor, sem CORS. */
async function buscarNLG() {
  const r = await fetch(URL_NLG);
  if (!r.ok) throw new Error(`NLG respondeu ${r.status}`);
  const j = await r.json();
  return {
    empresa: "nlgcomex",
    nome: "NLG Comex",
    realizado_ano: numero(j.realizadoAno),
    meta_ano: numero(j.metaGlobal),
    fonte: "painel",
    atualizado_em: new Date().toISOString(),
  };
}

/* 4S: só o bloco "Resumo", itens "Faturado no ano" e "Meta do ano". */
async function buscar4S() {
  const r = await fetch(URL_4S);
  if (!r.ok) throw new Error(`4S respondeu ${r.status}`);
  const j = await r.json();
  const itens: { bloco?: string; nome?: string; valor?: unknown }[] =
    Array.isArray(j) ? j : (j.itens ?? j.dados ?? j.data ?? []);
  const resumo = itens.filter((i) => i.bloco === "Resumo");
  const faturado = resumo.find((i) => i.nome === "Faturado no ano");
  const meta = resumo.find((i) => i.nome === "Meta do ano");
  if (!faturado || !meta) {
    throw new Error(
      "Itens 'Faturado no ano'/'Meta do ano' não encontrados no bloco Resumo",
    );
  }
  return {
    empresa: "pulse4s",
    nome: "Jornada 4S",
    realizado_ano: numero(faturado.valor),
    meta_ano: numero(meta.valor),
    fonte: "painel",
    atualizado_em: new Date().toISOString(),
  };
}

async function atualizarResumo() {
  const [nlg, s4] = await Promise.all([buscarNLG(), buscar4S()]);

  const { supabaseAdmin } = await import(
    "@/integrations/supabase/client.server"
  );
  const { data, error } = await supabaseAdmin
    .from("resumo_grupo")
    .upsert([nlg, s4], { onConflict: "empresa" })
    .select();

  if (error) throw new Error(error.message);
  return { ok: true, atualizadoEm: new Date().toISOString(), resumo: data };
}

export const Route = createFileRoute("/api/public/resumo-grupo")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) =>
        new Response("ok", { headers: corsHeaders(request) }),
      GET: async ({ request }) => {
        const headers = corsHeaders(request);
        try {
          return new Response(JSON.stringify(await atualizarResumo()), {
            headers,
          });
        } catch (e) {
          return new Response(
            JSON.stringify({
              ok: false,
              erro: e instanceof Error ? e.message : String(e),
            }),
            { status: 502, headers },
          );
        }
      },
    },
  },
});
