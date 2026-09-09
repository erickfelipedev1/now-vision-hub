import { RefreshCw } from "lucide-react";
import type { ResumoGrupo } from "@/hooks/useResumoGrupo";
import { UNIDADES } from "@/config/dashboards";

/**
 * Realizado contra meta anual, por empresa e no consolidado.
 *
 * A pergunta da diretoria não é "quanto entrou em maio", é "vamos bater a
 * meta". Isso é uma razão contra um limite — a forma certa é medidor, não
 * gráfico de barras: cada trilho é a meta, o preenchimento é o realizado, e a
 * marca dos 100% deixa o veredito visível sem precisar ler o número.
 */

const brl = (v: number) =>
  v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

const pctFmt = (v: number) =>
  v.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function Medidor({
  nome,
  realizado,
  meta,
  cor,
  destaque = false,
  retrato = false,
}: {
  nome: string;
  realizado: number;
  meta: number;
  cor: string;
  destaque?: boolean;
  retrato?: boolean;
}) {
  const pct = (realizado / meta) * 100;
  // O trilho vai até 100% ou até o realizado, o que for maior — assim quem
  // passou da meta mostra o excedente em vez de encostar na borda.
  const escala = Math.max(100, pct);
  const largura = (pct / escala) * 100;
  const marcaMeta = (100 / escala) * 100;
  const bateu = pct >= 100;

  return (
    <div className={destaque ? "" : "pt-1"}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="flex items-center gap-2">
          <span
            className={`${
              destaque ? "text-[14px] font-semibold" : "text-[13px]"
            } text-[#E9EDF2]`}
          >
            {nome}
          </span>
          {retrato && (
            <span
              className="rounded-full border border-[#3A2F1A] px-2 py-0.5 text-[10px] font-medium text-[#C08A1E]"
              title="A API não respondeu; exibindo o último retrato conhecido"
            >
              retrato
            </span>
          )}
        </span>
        <span
          className={`${
            destaque ? "text-[18px]" : "text-[15px]"
          } font-semibold tabular-nums`}
          style={{ color: bateu ? "#3E9B62" : "#E9EDF2" }}
        >
          {pctFmt(pct)}%
        </span>
      </div>

      <div
        className={`relative w-full overflow-hidden rounded-full bg-[#1A222C] ${
          destaque ? "h-3" : "h-2.5"
        }`}
        role="img"
        aria-label={`${nome}: ${brl(realizado)} de ${brl(meta)}, ${pctFmt(
          pct
        )} por cento da meta`}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${largura}%`, background: cor }}
        />
        {escala > 100 && (
          <div
            className="absolute inset-y-0 w-px bg-[#0B0F14]"
            style={{ left: `${marcaMeta}%` }}
            title="meta"
          />
        )}
      </div>

      <div className="mt-1.5 flex items-baseline justify-between gap-3">
        <span className="text-[12px] tabular-nums text-[#8A94A3]">
          {brl(realizado)}
        </span>
        <span className="text-[12px] tabular-nums text-[#5A6472]">
          meta {brl(meta)}
        </span>
      </div>
    </div>
  );
}

function Esqueleto() {
  return (
    <div className="space-y-5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="mb-2 h-3 w-32 rounded bg-[#1A222C]" />
          <div className="h-2.5 w-full rounded-full bg-[#1A222C]" />
        </div>
      ))}
    </div>
  );
}

export default function ProgressoMetas({ resumo }: { resumo: ResumoGrupo }) {
  const { fontes, grupo, carregando, temRetrato, recarregar } = resumo;
  const excedeu = grupo.realizado >= grupo.meta;

  return (
    <div>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold text-[#E9EDF2]">
            Realizado contra a meta anual
          </h3>
          <p className="text-[13px] text-[#8A94A3]">
            {carregando
              ? "Buscando nos painéis…"
              : excedeu
                ? `O grupo passou a meta do ano em ${brl(
                    grupo.realizado - grupo.meta
                  )}`
                : `Faltam ${brl(
                    grupo.meta - grupo.realizado
                  )} para o grupo bater a meta do ano`}
          </p>
        </div>
        <button
          onClick={recarregar}
          disabled={carregando}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#1C242F] px-2.5 py-1.5 text-[12px] text-[#8A94A3] transition-colors hover:text-[#E9EDF2] disabled:opacity-50"
        >
          <RefreshCw
            size={13}
            aria-hidden="true"
            className={carregando ? "animate-spin" : ""}
          />
          Atualizar
        </button>
      </div>

      {carregando ? (
        <Esqueleto />
      ) : (
        <>
          <div className="mb-5 border-b border-[#1C242F] pb-5">
            <Medidor
              nome="Grupo Now"
              realizado={grupo.realizado}
              meta={grupo.meta}
              cor="#B8862B"
              destaque
              retrato={temRetrato}
            />
          </div>

          <div className="space-y-4">
            {fontes.map((f) => {
              const u = UNIDADES.find((x) => x.id === f.id);
              return (
                <Medidor
                  key={f.id}
                  nome={u?.nome ?? f.id}
                  realizado={f.realizadoAno}
                  meta={f.metaAno}
                  cor={u?.cor ?? "#8A94A3"}
                  retrato={f.estado === "retrato"}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
