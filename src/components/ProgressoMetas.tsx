import { PROGRESSO, PROGRESSO_GRUPO } from "@/data/mock";

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

function Medidor({
  nome,
  realizado,
  meta,
  cor,
  destaque = false,
}: {
  nome: string;
  realizado: number;
  meta: number;
  cor: string;
  destaque?: boolean;
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
        <span
          className={`${
            destaque ? "text-[14px] font-semibold" : "text-[13px]"
          } text-[#E9EDF2]`}
        >
          {nome}
        </span>
        <span className="flex items-baseline gap-2">
          <span
            className={`${
              destaque ? "text-[18px]" : "text-[15px]"
            } font-semibold tabular-nums`}
            style={{ color: bateu ? "#3E9B62" : "#E9EDF2" }}
          >
            {pct.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%
          </span>
        </span>
      </div>

      <div
        className={`relative w-full overflow-hidden rounded-full bg-[#1A222C] ${
          destaque ? "h-3" : "h-2.5"
        }`}
        role="img"
        aria-label={`${nome}: ${brl(realizado)} de ${brl(meta)}, ${pct.toFixed(
          1
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

export default function ProgressoMetas() {
  return (
    <div>
      <div className="mb-5">
        <h3 className="text-[15px] font-semibold text-[#E9EDF2]">
          Realizado contra a meta anual
        </h3>
        <p className="text-[13px] text-[#8A94A3]">
          O grupo fecha o ano a {brl(PROGRESSO_GRUPO.meta - PROGRESSO_GRUPO.realizado)}{" "}
          da meta
        </p>
      </div>

      <div className="mb-5 border-b border-[#1C242F] pb-5">
        <Medidor
          nome="Grupo Now"
          realizado={PROGRESSO_GRUPO.realizado}
          meta={PROGRESSO_GRUPO.meta}
          cor="#B8862B"
          destaque
        />
      </div>

      <div className="space-y-4">
        {PROGRESSO.map((p) => (
          <Medidor
            key={p.id}
            nome={p.nome}
            realizado={p.realizado}
            meta={p.meta}
            cor={p.cor}
          />
        ))}
      </div>
    </div>
  );
}
