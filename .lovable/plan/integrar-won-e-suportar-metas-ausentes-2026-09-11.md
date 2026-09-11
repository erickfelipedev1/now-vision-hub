# Integrar WON e suportar metas ausentes

## Resultado
- A WON passa a entrar no resumo anual com o faturamento real das três lojas.
- Empresas sem meta mostram o valor realizado e o selo “sem meta”, sem barra de progresso.
- O consolidado soma todo o realizado, mas soma apenas metas definidas.

## Implementação
1. Tornar `metaAno` opcional na camada de dados e tratar `NULL` vindo do banco.
2. Ajustar o consolidado, os indicadores e os cartões para não calcular percentuais com meta ausente.
3. Alterar a coluna `meta_ano` para aceitar `NULL`.
4. Ampliar `/api/public/resumo-grupo` para consultar `LinxMovimento` por CNPJ, paginar pelo maior timestamp e somar somente vendas válidas.
5. Fazer upsert da WON com `meta_ano = NULL` e retornar as três empresas.
6. Validar a rota real e a apresentação do portal.

## Detalhes técnicos
- Período Microvix: 1º de janeiro do ano corrente até hoje.
- Filtros: `cancelado = N`, `excluido = N`, `tipo_transacao = V`.
- Paginação independente para cada uma das três lojas, iniciando em timestamp `0`.
- Proteções contra resposta inválida, paginação sem avanço e valores financeiros formatados em padrão brasileiro.
