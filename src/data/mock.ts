/**
 * DADOS MOCK — substituir pela integração real depois de validar o layout.
 * Nenhum número aqui é real. Mantido isolado de propósito: quando as APIs
 * entrarem, este arquivo vira o adaptador (mesmo formato de saída).
 */

export interface Kpi {
  id: string;
  rotulo: string;
  valor: string;
  variacao: number; // % vs período anterior
  detalhe: string;
}

export const KPIS_CONSOLIDADOS: Kpi[] = [
  {
    id: "receita",
    rotulo: "Receita consolidada",
    valor: "R$ 4,82 mi",
    variacao: 12.4,
    detalhe: "NLG R$ 3,10 mi · 4S R$ 1,72 mi",
  },
  {
    id: "pipeline",
    rotulo: "Pipeline aberto",
    valor: "R$ 9,35 mi",
    variacao: 5.1,
    detalhe: "187 oportunidades ativas",
  },
  {
    id: "fechados",
    rotulo: "Negócios fechados",
    valor: "63",
    variacao: -3.2,
    detalhe: "no período selecionado",
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
    statusTexto: "Acima da meta do trimestre",
    metricas: [
      { rotulo: "Receita", valor: "R$ 3,10 mi", variacao: 14.2 },
      { rotulo: "Operações", valor: "412", variacao: 6.8 },
      { rotulo: "Margem", valor: "18,4%", variacao: 1.9 },
    ],
  },
  {
    id: "pulse4s",
    status: "atencao",
    statusTexto: "Conversão abaixo do previsto",
    metricas: [
      { rotulo: "Receita", valor: "R$ 1,72 mi", variacao: 9.1 },
      { rotulo: "Leads", valor: "1.284", variacao: 21.5 },
      { rotulo: "Conversão", valor: "4,9%", variacao: -2.4 },
    ],
  },
];

export interface PontoMensal {
  mes: string;
  nlgcomex: number;
  pulse4s: number;
}

/** Receita mensal por unidade, em R$ mil. */
export const RECEITA_MENSAL: PontoMensal[] = [
  { mes: "Mar", nlgcomex: 402, pulse4s: 214 },
  { mes: "Abr", nlgcomex: 458, pulse4s: 236 },
  { mes: "Mai", nlgcomex: 431, pulse4s: 259 },
  { mes: "Jun", nlgcomex: 516, pulse4s: 248 },
  { mes: "Jul", nlgcomex: 559, pulse4s: 287 },
  { mes: "Ago", nlgcomex: 604, pulse4s: 302 },
];

export const PERIODOS = [
  { id: "30d", rotulo: "30 dias" },
  { id: "90d", rotulo: "90 dias" },
  { id: "ano", rotulo: "Ano" },
] as const;

export type PeriodoId = (typeof PERIODOS)[number]["id"];
