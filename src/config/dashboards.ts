/**
 * Portal Grupo Now — configuração central dos dashboards embedados.
 *
 * Troque as URLs abaixo pelas URLs publicadas de cada projeto no Lovable
 * (ou pelo domínio próprio, se já tiver sido apontado).
 *
 * IMPORTANTE: para o iframe funcionar, cada projeto embedado precisa
 * permitir ser enquadrado por este portal. Veja o README.
 */

export type UnidadeId = "nlgcomex" | "pulse4s";

export interface UnidadeConfig {
  id: UnidadeId;
  nome: string;
  descricao: string;
  repo: string;
  url: string;
  /** Cor de identidade da unidade — validada para modo claro e escuro. */
  cor: string;
  fonteDados: string;
  /**
   * Largura nativa do painel embedado, em px. O portal renderiza o iframe
   * nessa largura e escala para caber — é o que faz o painel aparecer inteiro
   * em vez de cortado. Os dois painéis do grupo são de tela larga (modo TV).
   */
  larguraBase?: number;
}

export const UNIDADES: UnidadeConfig[] = [
  {
    id: "nlgcomex",
    nome: "NLG Comex",
    descricao: "Painel de metas — transporte, agenciamento e desembaraço",
    repo: "groupnow-nlgcomex",
    url: "https://groupnow-nlgcomex.lovable.app",
    cor: "#E8622C",
    fonteDados: "API interna NLG",
    larguraBase: 1920,
  },
  {
    id: "pulse4s",
    nome: "Jornada 4S",
    descricao: "SDR Analytics — performance de SDRs",
    repo: "clint-pulse",
    url: "https://clint-pulse.lovable.app",
    cor: "#2E9BB5",
    fonteDados: "Clint CRM (via Supabase edge function)",
    larguraBase: 1920,
  },
];

export const CORES = {
  nlg: "#E8622C",
  pulse: "#2E9BB5",
  dourado: "#B8862B",
  roxo: "#7C6BD8",
  bom: "#3E9B62",
  atencao: "#C08A1E",
  critico: "#C4483B",
} as const;
