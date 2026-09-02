/**
 * DADOS DA VISÃO GERAL — lidos dos painéis de origem, não inventados.
 *
 * Leitura em 2 de setembro de 2026:
 *   NLG  09:04 · groupnow-nlgcomex.lovable.app
 *   4S   09:32 · clint-pulse.lovable.app/diretores  ← a rota anual do painel
 *
 * Cada campo carrega sua procedência em `origem`:
 *   "painel"    — número lido tal como aparece no painel de origem
 *   "derivado"  — calculado a partir de números do painel (a conta vai no comentário)
 *   "pendente"  — o painel de origem não expõe esse dado
 *
 * Nunca preencher um campo "pendente" com estimativa. Um número plausível ao
 * lado de números reais é pior que um vazio declarado: o vazio se vê, a
 * estimativa não.
 */

export type Origem = "painel" | "derivado" | "pendente";

export const LEITURA = {
  data: "2 de setembro de 2026",
  hora: "09:32",
} as const;

export const RECORTE = {
  rotulo: "Ano corrente",
  detalhe: "1º de janeiro até hoje",
} as const;

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/* ------------------------------------------------------------------ meta */

export interface Progresso {
  id: string;
  nome: string;
  realizado: number;
  meta: number;
  cor: string;
  origem: Origem;
}

/**
 * Realizado contra meta anual. NLG e 4S vêm dos painéis; o grupo é a soma
 * dos dois — a única conta desta tela, e ela fecha:
 *   7.047.160,00 + 941.017,10 = 7.988.177,10
 *   6.800.000,00 + 1.200.000,00 = 8.000.000,00 → 99,85%
 */
export const PROGRESSO: Progresso[] = [
  {
    id: "nlgcomex",
    nome: "NLG Comex",
    realizado: 7_047_160,
    meta: 6_800_000,
    cor: "#2E9BB5",
    origem: "painel",
  },
  {
    id: "pulse4s",
    nome: "Jornada 4S",
    realizado: 941_017.1,
    meta: 1_200_000,
    cor: "#E8622C",
    origem: "painel",
  },
];

export const PROGRESSO_GRUPO = {
  realizado: 7_988_177.1,
  meta: 8_000_000,
  origem: "derivado" as Origem,
};

/* ------------------------------------------------------------------- kpis */

export interface Kpi {
  id: string;
  rotulo: string;
  valor: string | null;
  detalhe: string;
  origem: Origem;
}

export const KPIS_CONSOLIDADOS: Kpi[] = [
  {
    id: "receita-grupo",
    rotulo: "Realizado no ano · grupo",
    valor: brl(7_988_177.1),
    detalhe: "NLG R$ 7,05 mi · 4S R$ 941 mil",
    origem: "derivado",
  },
  {
    id: "meta-grupo",
    rotulo: "Meta anual · grupo",
    valor: "99,85%",
    detalhe: `faltam ${brl(11_822.9)} de ${brl(8_000_000)}`,
    origem: "derivado",
  },
  {
    id: "nlg",
    rotulo: "NLG Comex",
    valor: "103,63%",
    detalhe: "meta batida com 3 meses restantes",
    origem: "painel",
  },
  {
    id: "s4",
    rotulo: "Jornada 4S",
    valor: "78,42%",
    detalhe: `run rate de ${brl(64_745.73)}/mês em 4 meses`,
    origem: "painel",
  },
];

/* ------------------------------------------------------------- por unidade */

export interface ResumoUnidade {
  id: string;
  metricas: { rotulo: string; valor: string | null; origem: Origem }[];
  status: "bom" | "atencao" | "critico" | "sem-dado";
  statusTexto: string;
}

export const RESUMO_UNIDADES: ResumoUnidade[] = [
  {
    id: "nlgcomex",
    status: "bom",
    statusTexto: "Meta anual batida com 3 meses restantes",
    metricas: [
      { rotulo: "Realizado no ano", valor: brl(7_047_160), origem: "painel" },
      { rotulo: "Progresso", valor: "103,63%", origem: "painel" },
      { rotulo: "Margem", valor: "36,0% de 40%", origem: "painel" },
    ],
  },
  {
    id: "pulse4s",
    status: "atencao",
    statusTexto: `Precisa de ${brl(64_745.73)}/mês nos 4 meses restantes`,
    metricas: [
      { rotulo: "Realizado no ano", valor: brl(941_017.1), origem: "painel" },
      { rotulo: "Progresso", valor: "78,42%", origem: "painel" },
      { rotulo: "Reuniões", valor: "328 de 2.880", origem: "painel" },
    ],
  },
];

/* ------------------------------------------------------------ série mensal */

export interface PontoMensal {
  mes: string;
  nlgcomex: number;
  /** A 4S publica total do ano e do trimestre, mas não a série mês a mês. */
  pulse4s: number | null;
}

/**
 * Receita mês a mês, em R$ mil.
 *
 * NLG: derivada de "PROGRESSO MENSAL DA META ANUAL" (percentual de cada mês)
 * aplicado à meta anual de R$ 6.800.000. A soma dá R$ 7.046.840 contra os
 * R$ 7.047.160 do painel — R$ 320, resultado dos percentuais virem
 * arredondados em duas casas. O total exibido usa o valor do painel.
 */
export const RECEITA_MENSAL: PontoMensal[] = [
  { mes: "Jan", nlgcomex: 496, pulse4s: null },
  { mes: "Fev", nlgcomex: 363, pulse4s: null },
  { mes: "Mar", nlgcomex: 390, pulse4s: null },
  { mes: "Abr", nlgcomex: 566, pulse4s: null },
  { mes: "Mai", nlgcomex: 399, pulse4s: null },
  { mes: "Jun", nlgcomex: 426, pulse4s: null },
  { mes: "Jul", nlgcomex: 663, pulse4s: null },
  { mes: "Ago", nlgcomex: 3743, pulse4s: null },
];

/** Composição do realizado da NLG por setor — lida do painel. */
export const SETORES_NLG = [
  { nome: "Desembaraço", valor: "R$ 4.115.751", share: 58.4, meta: 154.34 },
  { nome: "Agenciamento", valor: "R$ 1.935.521", share: 27.47, meta: 72.58 },
  { nome: "Transporte", valor: "R$ 995.888", share: 14.13, meta: 37.35 },
];

export const OBSERVACOES = [
  "Agosto concentra 53% da receita anual da NLG (R$ 3,74 mi contra ~R$ 500 mil de média) — confirmar se é operação real ou lançamento acumulado.",
  "O trimestre da 4S caiu de R$ 283.062,23 para R$ 247.178,82 entre 1º e 2 de setembro — faturamento realizado não costuma diminuir.",
  "A 4S publica o ano e o trimestre, mas não a série mês a mês; por isso o gráfico mensal mostra só a NLG.",
] as const;

export const PERIODOS = [{ id: "ano", rotulo: "Ano" }] as const;

export type PeriodoId = (typeof PERIODOS)[number]["id"];
