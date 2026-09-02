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
  /**
   * Parâmetros anexados à URL do iframe — e SÓ ao iframe. É assim que a visão
   * dos diretores pede o recorte anual sem mudar o padrão do painel para quem
   * o abre direto: o projeto de origem lê o parâmetro quando ele vem, e segue
   * no padrão dele quando não vem.
   */
  urlParams?: Record<string, string>;
}

/** Monta a URL do embed com os parâmetros da unidade, se houver. */
export function urlDoEmbed(unidade: UnidadeConfig): string {
  if (!unidade.urlParams) return unidade.url;
  const url = new URL(unidade.url);
  for (const [chave, valor] of Object.entries(unidade.urlParams)) {
    url.searchParams.set(chave, valor);
  }
  return url.toString();
}

export const UNIDADES: UnidadeConfig[] = [
  {
    id: "nlgcomex",
    nome: "NLG Comex",
    descricao: "Painel de metas — transporte, agenciamento e desembaraço",
    repo: "groupnow-nlgcomex",
    url: "https://groupnow-nlgcomex.lovable.app",
    cor: "#2E9BB5",
    fonteDados: "API interna NLG",
    larguraBase: 1920,
  },
  {
    id: "pulse4s",
    nome: "Jornada 4S",
    descricao: "SDR Analytics — Performance de SDRs no Clint CRM",
    repo: "clint-pulse",
    url: "https://clint-pulse.lovable.app/diretores",
    cor: "#E8622C",
    fonteDados: "Clint CRM (via Supabase edge function)",
    larguraBase: 1920,
    // A rota /diretores já é anual; só sinalizamos a origem para o painel
    // esconder a navegação própria dentro do iframe.
    urlParams: { origem: "portal-diretoria" },
  },
];

export const CORES = {
  nlg: "#2E9BB5",
  pulse: "#E8622C",
  dourado: "#B8862B",
  roxo: "#7C6BD8",
  bom: "#3E9B62",
  atencao: "#C08A1E",
  critico: "#C4483B",
} as const;
