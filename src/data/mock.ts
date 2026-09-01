/**
 * DADOS MOCK — substituir pela integração real depois de validar o layout.
 * Nenhum número aqui é real. Mantido isolado de propósito: quando as APIs
 * entrarem, este arquivo vira o adaptador (mesmo formato de saída).
 *
 * RECORTE: ano corrente, de 1º de janeiro até hoje. A visão dos diretores é
 * anual porque os dois painéis de origem falam a mesma língua nesse recorte —
 * o painel da NLG é de meta anual e realizado no ano, e o da Jornada 4S passou
 * a ser aberto em modo anual pelo portal (ver `urlParams` em dashboards.ts).
 */

/** Fechamento do recorte exibido. Trocar pela data real da carga. */
export const RECORTE = {
  rotulo: "Ano corrente",
  detalhe: "1º de janeiro até hoje",
} as const;

export interface Kpi {
  id: string;
  rotulo: string;
  valor: string;
  variacao: number; // % vs mesmo período do ano anterior
  detalhe: string;
}

export const KPIS_CONSOLIDADOS: Kpi[] = [
  {
    id: "receita",
    rotulo: "Receita no ano",
    valor: "R$ 9,39 mi",
    variacao: 12.4,
    detalhe: "NLG R$ 7,05 mi · 4S R$ 2,34 mi",
  },
  {
    id: "meta",
    rotulo: "Meta anual",
    valor: "103,6%",
    variacao: 5.1,
    detalhe: "atingido sobre R$ 9,06 mi de meta",
  },
  {
    id: "fechados",
    rotulo: "Negócios no ano",
    valor: "487",
    variacao: -3.2,
    detalhe: "acumulado de janeiro até hoje",
  },
  {
    id: "ticket",
    rotulo: "Ticket médio",
    valor: "R$ 76,5 mil",
    variacao: 8.7,
    detalhe: "média ponderada das duas unidades",
  },
];

export interface ResumoUnidade {
  id: string;
  metricas: { rotulo: string; valor: string; variacao: number }[];
  status: "bom" | "atencao" | "critico";
  statusTexto: string;
}

export const RESUMO_UNIDADES: ResumoUnidade[] = [
  {
    id: "nlgcomex",
    status: "bom",
    statusTexto: "Acima da meta anual",
    metricas: [
      { rotulo: "Receita no ano", valor: "R$ 7,05 mi", variacao: 14.2 },
      { rotulo: "Operações", valor: "3.284", variacao: 6.8 },
      { rotulo: "Margem", valor: "18,4%", variacao: 1.9 },
    ],
  },
  {
    id: "pulse4s",
    status: "atencao",
    statusTexto: "Conversão abaixo do previsto no ano",
    metricas: [
      { rotulo: "Receita no ano", valor: "R$ 2,34 mi", variacao: 9.1 },
      { rotulo: "Leads", valor: "9.612", variacao: 21.5 },
      { rotulo: "Conversão", valor: "4,9%", variacao: -2.4 },
    ],
  },
];

export interface PontoMensal {
  mes: string;
  nlgcomex: number;
  pulse4s: number;
}

/** Receita mês a mês do ano corrente, em R$ mil. */
export const RECEITA_MENSAL: PontoMensal[] = [
  { mes: "Jan", nlgcomex: 812, pulse4s: 268 },
  { mes: "Fev", nlgcomex: 765, pulse4s: 241 },
  { mes: "Mar", nlgcomex: 902, pulse4s: 294 },
  { mes: "Abr", nlgcomex: 858, pulse4s: 286 },
  { mes: "Mai", nlgcomex: 931, pulse4s: 309 },
  { mes: "Jun", nlgcomex: 916, pulse4s: 298 },
  { mes: "Jul", nlgcomex: 959, pulse4s: 337 },
  { mes: "Ago", nlgcomex: 904, pulse4s: 302 },
];

export const PERIODOS = [
  { id: "ano", rotulo: "Ano" },
  { id: "90d", rotulo: "90 dias" },
  { id: "30d", rotulo: "30 dias" },
] as const;

export type PeriodoId = (typeof PERIODOS)[number]["id"];
