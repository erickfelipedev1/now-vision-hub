# Deixar a visão geral ao vivo — dois prompts

O portal já busca os números por API em vez de tê-los escritos no código. Falta
liberar o acesso do lado dos painéis. São duas mudanças pequenas, uma em cada
projeto, e elas são independentes: aplicar só uma já deixa aquela metade ao vivo.

Enquanto nenhuma estiver pronta, o portal continua funcionando — ele cai no
último retrato conhecido e marca cada cartão com o selo "retrato", para ninguém
confundir dado velho com dado de agora.

---

## 1. NLG (`groupnow-nlgcomex`) — só liberar CORS

O endpoint **já existe e já está no ar**: `GET /api/public/painel`. Ele devolve
exatamente o que o portal precisa:

```json
{
  "ano": 2026,
  "atualizadoEm": "2026-09-09T16:55:20.844Z",
  "metaGlobal": 6800000,
  "realizadoAno": 7280889.57,
  "progressoGlobal": 107.07190544117648,
  "progressoGlobalMensal": [7.29, 5.33, 5.73, 8.32, 5.86, 6.26, 9.75, 58.48, 0, 0, 0, 0],
  "setores": [ ... ],
  "margem": { "NLG": [...], "Jornada 4S": [...], "NDL": [...], "WON": [...], "JOG": [...] }
}
```

O único problema é que a resposta não traz cabeçalho CORS, então o navegador
bloqueia quando o portal (outro domínio) tenta ler.

> A rota `/api/public/painel` já existe e responde certo, mas não envia
> cabeçalhos CORS, então outro domínio não consegue consumi-la pelo navegador.
> Acrescente na resposta dessa rota:
>
> ```
> Access-Control-Allow-Origin: https://now-vision-hub.lovable.app
> Access-Control-Allow-Methods: GET, OPTIONS
> ```
>
> E responda `204` a requisições `OPTIONS` na mesma rota, para o preflight
> passar. Não mude o corpo da resposta nem o cálculo — só os cabeçalhos.

**Um alerta antes de aplicar:** o campo `margem` expõe a margem mensal de cinco
empresas do grupo — NLG, Jornada 4S, NDL, WON e JOG — e várias são negativas
(a 4S aparece com -80%, -265,1%, -62,8% em meses diferentes). Isso hoje já está
público nessa rota, sem autenticação. Se essa informação não deveria estar
aberta, o caminho não é liberar CORS: é enxugar o payload para o que o painel
realmente usa, ou proteger a rota com um token. Vale decidir isso antes.

---

## 2. Jornada 4S (`clint-pulse`) — criar a rota

Este projeto não tem API pública; os dados chegam à tela por *server function*
do TanStack Start, cuja URL é um hash e não serve como contrato.

> Crie uma rota pública `GET /api/public/resumo` que devolva o consolidado anual
> já calculado na tela `/diretores`, no formato:
>
> ```json
> {
>   "atualizadoEm": "2026-09-09T16:55:20.844Z",
>   "realizadoAno": 999570.90,
>   "metaAno": 1200000,
>   "progresso": 83.30
> }
> ```
>
> Onde `atualizadoEm` é ISO 8601, os valores monetários são números (não
> strings formatadas) e `progresso` é o percentual já calculado.
>
> Reaproveite a mesma função que hoje alimenta a `/diretores` — a rota é só uma
> saída nova para um cálculo que já existe, não uma nova consulta ao Clint.
>
> Inclua os cabeçalhos CORS:
>
> ```
> Access-Control-Allow-Origin: https://now-vision-hub.lovable.app
> Access-Control-Allow-Methods: GET, OPTIONS
> ```
>
> e responda `204` a `OPTIONS`.
>
> A rota não deve expor dados de pessoas — nada de nomes de SDR, ranking ou
> números individuais. Só o consolidado da empresa.

---

## Como testar

Do console do navegador, em qualquer aba:

```js
await (await fetch("https://groupnow-nlgcomex.lovable.app/api/public/painel")).json()
await (await fetch("https://clint-pulse.lovable.app/api/public/resumo")).json()
```

Se as duas responderem sem erro de CORS, abra o portal: os selos "retrato" somem
e o rodapé passa a mostrar a hora de atualização vinda da própria API.

## O que muda no portal

Nada — já está pronto. Os arquivos novos são:

```
src/data/fontes.ts         endpoints, tipos, fetch e a queda para o retrato
src/data/snapshot.ts       o último retrato conhecido (rede de segurança)
src/hooks/useResumoGrupo.ts  busca as duas fontes em paralelo
```

Se um dia uma URL mudar, o único lugar a editar é `ENDPOINTS`, em `fontes.ts`.
