export type Trend = { value: number; label: string };

export type Company = {
  id: "nlg" | "j4s";
  name: string;
  color: string;
  status: "Saudável" | "Atenção" | "Crítico";
  context: string;
  metrics: { label: string; value: string; delta: number }[];
  /** Dashboard existente embedado via iframe. Trocar pela URL real. */
  dashboardUrl: string;
  sourceNote: string;
  repo: string;
};

export const periods = ["30 dias", "90 dias", "Ano"] as const;
export type Period = (typeof periods)[number];

export const kpis: Record<
  Period,
  { label: string; value: string; delta: number; detail: string }[]
> = {
  "30 dias": [
    { label: "Receita consolidada", value: "R$ 4,82 M", delta: 8.4, detail: "R$ 3,10 M NLG · R$ 1,72 M J4S" },
    { label: "Pipeline aberto", value: "R$ 11,4 M", delta: 3.1, detail: "148 oportunidades ativas" },
    { label: "Negócios fechados", value: "62", delta: -4.2, detail: "taxa de conversão 21%" },
    { label: "Ticket médio", value: "R$ 77,8 mil", delta: 5.6, detail: "ciclo médio de 38 dias" },
  ],
  "90 dias": [
    { label: "Receita consolidada", value: "R$ 13,9 M", delta: 11.2, detail: "R$ 8,90 M NLG · R$ 5,00 M J4S" },
    { label: "Pipeline aberto", value: "R$ 12,8 M", delta: 6.7, detail: "196 oportunidades ativas" },
    { label: "Negócios fechados", value: "184", delta: 2.8, detail: "taxa de conversão 23%" },
    { label: "Ticket médio", value: "R$ 75,5 mil", delta: -1.4, detail: "ciclo médio de 41 dias" },
  ],
  Ano: [
    { label: "Receita consolidada", value: "R$ 51,3 M", delta: 17.9, detail: "R$ 33,2 M NLG · R$ 18,1 M J4S" },
    { label: "Pipeline aberto", value: "R$ 14,2 M", delta: 9.3, detail: "241 oportunidades ativas" },
    { label: "Negócios fechados", value: "703", delta: 12.5, detail: "taxa de conversão 24%" },
    { label: "Ticket médio", value: "R$ 73,0 mil", delta: 3.2, detail: "ciclo médio de 44 dias" },
  ],
};

export const revenueByMonth: { month: string; nlg: number; j4s: number }[] = [
  { month: "Mar", nlg: 2.62, j4s: 1.31 },
  { month: "Abr", nlg: 2.84, j4s: 1.44 },
  { month: "Mai", nlg: 2.71, j4s: 1.62 },
  { month: "Jun", nlg: 3.05, j4s: 1.55 },
  { month: "Jul", nlg: 2.98, j4s: 1.78 },
  { month: "Ago", nlg: 3.1, j4s: 1.72 },
];

export const companies: Company[] = [
  {
    id: "nlg",
    name: "NLG Comex",
    color: "#E8622C",
    status: "Saudável",
    context:
      "Crescimento sustentado por importações do setor automotivo; margem estável mesmo com câmbio pressionado.",
    metrics: [
      { label: "Receita", value: "R$ 3,10 M", delta: 6.9 },
      { label: "Processos ativos", value: "212", delta: 4.1 },
      { label: "Margem", value: "18,4%", delta: 0.8 },
    ],
    dashboardUrl: "https://nlg-comex-dashboard.lovable.app/",
    sourceNote: "Dados operacionais consolidados diariamente às 06h (BRT).",
    repo: "grupo-now/nlg-comex-dashboard",
  },
  {
    id: "j4s",
    name: "Jornada 4S",
    color: "#2E9BB5",
    status: "Atenção",
    context:
      "Pipeline forte, porém ciclo de fechamento alongou 9 dias no trimestre. Acompanhar conversão de propostas.",
    metrics: [
      { label: "Receita", value: "R$ 1,72 M", delta: -2.3 },
      { label: "Contratos ativos", value: "87", delta: 3.4 },
      { label: "Churn", value: "2,1%", delta: 0.6 },
    ],
    dashboardUrl: "https://jornada-4s-dashboard.lovable.app/",
    sourceNote: "Dados de CRM sincronizados a cada 4 horas.",
    repo: "grupo-now/jornada-4s-dashboard",
  },
];

export const user = { name: "Giuliano Redua", role: "Diretoria" };
