import { createFileRoute } from "@tanstack/react-router";
import { XMLParser } from "fast-xml-parser";

const URL_NLG = "https://groupnow-nlgcomex.lovable.app/api/public/painel";
const URL_4S =
  "https://clint-pulse.lovable.app/api/public/diretoria?token=bedfd9d8152959d162a4e0163b77240d5e9bd709aad73f90&format=json";
const URL_MICROVIX = "https://webapi.microvix.com.br/1.0/api/integracao";
const CNPJS_WON = ["26051048000112", "30454662000100", "51334648000135"];
const LIMITE_PAGINAS_MICROVIX = 500;

const ORIGENS_PERMITIDAS = [
  "https://now-vision-hub.lovable.app",
  "https://id-preview--dcffded8-ec22-41b6-b4a0-ed8e7399c389.lovable.app",
];

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  const allow: string = ORIGENS_PERMITIDAS.includes(origin)
    ? origin
    : "https://now-vision-hub.lovable.app";
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
    const limpo = v.replace(/[^\d,.-]/g, "");
    const temVirgula = limpo.includes(",");
    const normalizado = temVirgula
      ? limpo.replace(/\./g, "").replace(",", ".")
      : limpo;
    const n = Number(normalizado);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function escaparXml(valor: string): string {
  return valor
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function dataIsoLocal(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

type RegistroMicrovix = Record<string, unknown>;

function registrosMicrovix(valor: unknown): RegistroMicrovix[] {
  const encontrados: RegistroMicrovix[] = [];
  const visitar = (no: unknown) => {
    if (Array.isArray(no)) {
      no.forEach(visitar);
      return;
    }
    if (!no || typeof no !== "object") return;
    const objeto = no as RegistroMicrovix;
    const chaves = Object.keys(objeto).map((chave) => chave.toLowerCase());
    if (chaves.includes("timestamp") && chaves.includes("valor_total")) {
      encontrados.push(objeto);
      return;
    }
    Object.values(objeto).forEach(visitar);
  };
  visitar(valor);
  return encontrados;
}

function separarCsv(linha: string, delimitador: string): string[] {
  const campos: string[] = [];
  let atual = "";
  let aspas = false;
  for (let indice = 0; indice < linha.length; indice += 1) {
    const caractere = linha[indice];
    if (caractere === '"') {
      if (aspas && linha[indice + 1] === '"') {
        atual += '"';
        indice += 1;
      } else {
        aspas = !aspas;
      }
    } else if (caractere === delimitador && !aspas) {
      campos.push(atual.trim());
      atual = "";
    } else {
      atual += caractere;
    }
  }
  campos.push(atual.trim());
  return campos;
}

function registrosCsvMicrovix(texto: string): RegistroMicrovix[] {
  const linhas = texto.replace(/^\uFEFF/, "").split(/\r?\n/).filter((linha) => linha.trim());
  if (linhas.length < 2) return [];
  const primeiraLinha = linhas[0];
  if (!primeiraLinha) return [];
  const delimitadores = ["|", ";", "\t", ","];
  const delimitador = delimitadores.reduce((melhor, atual) =>
    primeiraLinha.split(atual).length > primeiraLinha.split(melhor).length ? atual : melhor,
  );
  const cabecalho = separarCsv(primeiraLinha, delimitador).map((item) => item.trim());
  if (!cabecalho.some((item) => item.toLowerCase() === "valor_total")) return [];
  return linhas.slice(1).map((linha) => {
    const valores = separarCsv(linha, delimitador);
    return Object.fromEntries(cabecalho.map((nome, indice) => [nome, valores[indice] ?? ""]));
  });
}

function campo(registro: RegistroMicrovix, nome: string): unknown {
  const chave = Object.keys(registro).find(
    (item) => item.toLowerCase() === nome.toLowerCase(),
  );
  return chave ? registro[chave] : undefined;
}

async function buscarLojaWon(cnpj: string): Promise<number> {
  const chave = process.env["MICROVIX_CHAVE"];
  const usuario = process.env["MICROVIX_USER"];
  const senha = process.env["MICROVIX_PASSWORD"];
  if (!chave || !usuario || !senha) {
    throw new Error("Credenciais do Linx Microvix não configuradas");
  }

  const hoje = new Date();
  const inicio = `${hoje.getFullYear()}-01-01`;
  const fim = dataIsoLocal(hoje);
  const parser = new XMLParser({ ignoreAttributes: false, trimValues: true });
  let timestamp = "0";
  let total = 0;

  for (let pagina = 0; pagina < LIMITE_PAGINAS_MICROVIX; pagina += 1) {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<LinxMicrovix>
  <Authentication user="${escaparXml(usuario)}" password="${escaparXml(senha)}" />
  <ResponseFormat>csv</ResponseFormat>
  <Command>
    <Name>LinxMovimento</Name>
    <Parameters>
      <Parameter id="chave">${escaparXml(chave)}</Parameter>
      <Parameter id="cnpjEmp">${cnpj}</Parameter>
      <Parameter id="data_inicial">${inicio}</Parameter>
      <Parameter id="data_fim">${fim}</Parameter>
      <Parameter id="operacao">S</Parameter>
      <Parameter id="timestamp">${escaparXml(timestamp)}</Parameter>
    </Parameters>
  </Command>
</LinxMicrovix>`;
    const r = await fetch(URL_MICROVIX, {
      method: "POST",
      headers: { "Content-Type": "application/xml; charset=utf-8" },
      body: xml,
      signal: AbortSignal.timeout(60_000),
    });
    if (!r.ok) throw new Error(`Microvix respondeu ${r.status} para ${cnpj}`);
    const resposta = await r.text();

    let registros: RegistroMicrovix[];
    if (resposta.trimStart().startsWith("<")) {
      const xml = parser.parse(resposta);
      const status = statusMicrovix(xml);
      console.log(
        `[resumo-grupo][WON] CNPJ ${cnpj} pág. ${pagina + 1}: ResponseSuccess=${status.success ?? "n/a"} Message=${status.message ?? "n/a"}`,
      );
      if (status.success === false) {
        throw new Error(
          `Microvix recusou ${cnpj}: ${status.message ?? "ResponseSuccess=False"}`,
        );
      }
      registros = registrosMicrovix(xml);
    } else {
      if (!cabecalhoCsvValido(resposta)) {
        const amostra = resposta.slice(0, 200).replace(/\s+/g, " ").trim();
        throw new Error(
          `Formato inesperado do Microvix para ${cnpj}: "${amostra}"`,
        );
      }
      registros = registrosCsvMicrovix(resposta);
    }
    if (registros.length === 0) {
      console.log(
        `[resumo-grupo][WON] CNPJ ${cnpj} pág. ${pagina + 1}: 0 linhas — fim da paginação`,
      );
      break;
    }

    let validas = 0;
    let maiorTimestamp = timestamp;
    for (const registro of registros) {
      const cancelado = String(campo(registro, "cancelado") ?? "").toUpperCase();
      const excluido = String(campo(registro, "excluido") ?? "").toUpperCase();
      const tipo = String(campo(registro, "tipo_transacao") ?? "").toUpperCase();
      if (cancelado === "N" && excluido === "N" && tipo === "V") {
        total += numero(campo(registro, "valor_total"));
        validas += 1;
      }
      const atual = String(campo(registro, "timestamp") ?? "");
      if (atual && BigInt(atual) > BigInt(maiorTimestamp)) maiorTimestamp = atual;
    }
    console.log(
      `[resumo-grupo][WON] CNPJ ${cnpj} pág. ${pagina + 1}: ${registros.length} linhas, ${validas} vendas válidas após filtro`,
    );
    if (maiorTimestamp === timestamp) {
      throw new Error(`Paginação do Microvix não avançou para ${cnpj}`);
    }
    timestamp = maiorTimestamp;
  }
  console.log(`[resumo-grupo][WON] CNPJ ${cnpj}: total vendas = R$ ${total.toFixed(2)}`);
  return total;
}

/** Procura ResponseSuccess/Message em qualquer nível do XML da Microvix. */
function statusMicrovix(xml: unknown): {
  success?: boolean | undefined;
  message?: string | undefined;
} {
  let success: boolean | undefined;
  let message: string | undefined;
  const visitar = (no: unknown) => {
    if (Array.isArray(no)) {
      no.forEach(visitar);
      return;
    }
    if (!no || typeof no !== "object") return;
    for (const [chave, valor] of Object.entries(no as Record<string, unknown>)) {
      const nome = chave.toLowerCase().replace(/^@_/, "");
      if (nome === "responsesuccess") {
        success = String(valor).toLowerCase() === "true";
      } else if (nome === "message" || nome === "responsemessage") {
        message = String(valor);
      } else if (valor && typeof valor === "object") {
        visitar(valor);
      }
    }
  };
  visitar(xml);
  return { success, message };
}

/** CSV só é confiável se o cabeçalho tem as colunas esperadas. */
function cabecalhoCsvValido(texto: string): boolean {
  const primeira = texto
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .find((linha) => linha.trim());
  if (!primeira) return false;
  const colunas = primeira.toLowerCase();
  return colunas.includes("valor_total") && colunas.includes("timestamp");
}

async function buscarWON() {
  const totais = await Promise.all(CNPJS_WON.map(buscarLojaWon));
  return {
    empresa: "won",
    nome: "WON",
    realizado_ano: totais.reduce((soma, valor) => soma + valor, 0),
    meta_ano: null,
    fonte: "Linx Microvix",
    atualizado_em: new Date().toISOString(),
  };
}

/* NLG: painel público já existente — fetch servidor a servidor, sem CORS. */
async function buscarNLG() {
  const r = await fetch(URL_NLG);
  if (!r.ok) throw new Error(`NLG respondeu ${r.status}`);
  const j = await r.json();
  return {
    row: {
      empresa: "nlgcomex",
      nome: "NLG Comex",
      realizado_ano: numero(j.realizadoAno),
      meta_ano: numero(j.metaGlobal),
      fonte: "painel",
      atualizado_em: new Date().toISOString(),
    },
    progressoMensal: Array.isArray(j.progressoGlobalMensal)
      ? (j.progressoGlobalMensal as number[])
      : undefined,
  };
}

/* 4S: só o bloco "Resumo", itens "Faturado no ano" e "Meta do ano". */
async function buscar4S() {
  const r = await fetch(URL_4S);
  if (!r.ok) throw new Error(`4S respondeu ${r.status}`);
  const j = await r.json();
  const itens: { bloco?: string; nome?: string; faturamento?: unknown }[] =
    Array.isArray(j) ? j : (j.rows ?? j.itens ?? j.dados ?? j.data ?? []);
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
    realizado_ano: numero(faturado.faturamento),
    meta_ano: numero(meta.faturamento),
    fonte: "painel",
    atualizado_em: new Date().toISOString(),
  };
}

async function atualizarResumo() {
  const [nlg, s4] = await Promise.all([buscarNLG(), buscar4S()]);

  /* WON à parte: se a Microvix falhar, NÃO grava zero — devolve o último
     retrato gravado (ou omite a linha) e avisa no JSON. */
  let won: Awaited<ReturnType<typeof buscarWON>> | null = null;
  let erroWon: string | null = null;
  try {
    won = await buscarWON();
  } catch (e) {
    erroWon = e instanceof Error ? e.message : String(e);
    console.error(`[resumo-grupo][WON] falhou, mantendo retrato: ${erroWon}`);
  }

  const { supabaseAdmin } = await import(
    "@/integrations/supabase/client.server"
  );
  const linhas = won ? [nlg.row, s4, won] : [nlg.row, s4];
  const { data, error } = await supabaseAdmin
    .from("resumo_grupo")
    .upsert(linhas, { onConflict: "empresa" })
    .select();

  if (error) throw new Error(error.message);
  const resumo = [...(data ?? [])];
  if (!won) {
    const { data: retratoWon } = await supabaseAdmin
      .from("resumo_grupo")
      .select()
      .eq("empresa", "won")
      .maybeSingle();
    if (retratoWon && !resumo.some((r) => r.empresa === "won")) {
      resumo.push({ ...retratoWon, fonte: "retrato" });
    }
  }
  const resumo = (data ?? []).map((row) =>
    row.empresa === "nlgcomex" && nlg.progressoMensal
      ? { ...row, progressoMensal: nlg.progressoMensal }
      : row,
  );
  return { ok: true, atualizadoEm: new Date().toISOString(), resumo };
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
