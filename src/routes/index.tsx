import { createFileRoute } from "@tanstack/react-router";
import PortalGrupoNow from "@/components/PortalGrupoNow";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Portal Grupo Now — Painel executivo" },
      {
        name: "description",
        content:
          "Painel executivo do Grupo Now: KPIs consolidados, receita por unidade e dashboards da NLG Comex e Jornada 4S em um só lugar.",
      },
      { property: "og:title", content: "Portal Grupo Now — Painel executivo" },
      {
        property: "og:description",
        content:
          "Acompanhe receita, pipeline e desempenho das empresas do Grupo Now em um painel executivo único.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PortalGrupoNow,
});

