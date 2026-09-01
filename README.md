# Grupo Now Executive View

Crie um **portal executivo web** chamado **Portal Grupo Now**, em React + TypeScript +

Tailwind CSS, com `lucide-react` para ícones. É um painel único para a diretoria do

Grupo Now acompanhar as duas empresas do grupo em um só lugar.




**Estrutura:**




- Layout de aplicação com sidebar fixa à esquerda (256px, colapsável em mobile com

  overlay), header superior de 64px e área de conteúdo rolável.

- Sidebar com a marca "Grupo Now / Portal executivo", um grupo "Geral" com o item

  **Visão geral**, um grupo "Empresas" com **NLG Comex** e **Jornada 4S** (cada um com

  um chip quadrado da cor da empresa), e no rodapé o card do usuário

  "Giuliano Redua — Diretoria".

- Navegação por estado interno (`useState`), sem react-router.




**Tela "Visão geral":**




1. Quatro cards de KPI consolidado: Receita consolidada, Pipeline aberto, Negócios

   fechados, Ticket médio. Cada card tem rótulo, valor grande em `tabular-nums`,

   variação percentual com seta (verde para positivo, vermelho para negativo) e uma

   linha de detalhe.

2. Um gráfico de barras agrupadas em SVG puro: receita mensal por unidade, 6 meses,

   duas séries. Regras: **um único eixo Y**, legenda sempre visível, rótulos diretos

   apenas no último grupo, barras com ponta superior arredondada em 4px e base plana,

   2px de respiro entre barras adjacentes, grid discreto, tooltip no hover do mês e

   um `<details>` "Ver dados em tabela" abaixo.

3. Dois cards de empresa lado a lado, cada um com barra de cor da unidade, badge de

   status (Saudável / Atenção / Crítico), três métricas com variação, uma frase de

   contexto e o botão "Abrir dashboard completo" que navega para a aba embedada.

4. Filtro de período (30 dias / 90 dias / Ano) no header.




**Telas das empresas:**




Cada uma renderiza o dashboard existente dentro de um `<iframe>` que ocupa toda a

área de conteúdo, com: overlay de carregamento com spinner na cor da unidade,

botões "Atualizar" (remonta o iframe via `key`) e "Abrir original" (nova aba), e um

rodapé fino informando a fonte dos dados e o repositório de origem.




**Design:**




Tema escuro. Fundo `#0B0F14`, superfícies `#12171F` e `#0D1219`, bordas `#1C242F`,

texto primário `#E9EDF2`, secundário `#8A94A3`, terciário `#6F7987`. Cores de

identidade: NLG Comex `#E8622C`, Jornada 4S `#2E9BB5`, dourado de apoio `#B8862B`.

Status: bom `#3E9B62`, atenção `#C08A1E`, crítico `#C4483B`. Cantos `rounded-xl` nos

cards, tipografia compacta (12–15px no corpo), nada de sombras pesadas nem gradientes

além do logo.




**Dados:** todos mockados, isolados em `src/data/mock.ts`, prontos para serem trocados

pelas integrações reais depois.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://now-vision-hub.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/dcffded8-ec22-41b6-b4a0-ed8e7399c389).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
