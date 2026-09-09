/**
 * ÚLTIMO RETRATO CONHECIDO — rede de segurança, não fonte de verdade.
 *
 * Números lidos à mão dos painéis em 9 de setembro de 2026, 13:49. Só entram
 * na tela quando a API correspondente não responde, e nesse caso a tela mostra
 * esta data para o leitor saber que está vendo dado velho.
 *
 * Ao atualizar, leia dos painéis e troque `lidoEm` junto. Nunca estime.
 */

export const SNAPSHOT = {
  lidoEm: "2026-09-09T13:49:00-03:00",
  nlgcomex: {
    realizadoAno: 7_280_890,
    metaAno: 6_800_000,
    /** % da meta anual realizado em cada mês (12 posições). */
    progressoMensal: [7.3, 5.34, 5.73, 8.32, 5.87, 6.27, 9.75, 58.49, 0, 0, 0, 0],
  },
  pulse4s: {
    realizadoAno: 999_570.9,
    metaAno: 1_200_000,
    progressoMensal: undefined as number[] | undefined,
  },
} as const;

/** Fatos que não vêm de API e continuam sendo leitura manual dos painéis. */
export const DETALHES = {
  nlgcomex: {
    margem: "36,0% de 40%",
    mediaMensal: 910_111,
    mesesRestantes: 3,
  },
  pulse4s: {
    runRate: 50_107.28,
    mesesRestantes: 4,
    reunioes: "328 de 2.880",
    faturadoTrimestre: 305_732.62,
  },
} as const;

export const OBSERVACOES = [
  "Agosto concentra 55% da receita anual da NLG (R$ 3,98 mi contra ~R$ 500 mil de média nos outros meses) — confirmar se é operação real ou lançamento acumulado.",
  "Os dois painéis divergem nos meses restantes: a NLG conta 3, a 4S conta 4.",
  "A API da NLG carrega margem mensal de cinco empresas do grupo — NLG, Jornada 4S, NDL, WON e JOG — e as da 4S aparecem negativas em vários meses (-80%, -265,1%, -62,8%). O portal mostra só duas empresas e nenhuma margem da 4S; vale decidir se isso entra.",
  "A 4S publica o ano e o trimestre, mas não a série mês a mês; por isso o gráfico mensal mostra só a NLG.",
] as const;

export const RECORTE = {
  rotulo: "Ano corrente",
  detalhe: "1º de janeiro até hoje",
} as const;
