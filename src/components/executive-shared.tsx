import { useState } from "react";
import { ChevronRight, Map } from "lucide-react";
import type { UnidadeConfig, UnidadeId } from "@/config/dashboards";

/** Paleta preto e branco — escopada às telas executivas (Visão geral / Apresentação). */
export const CREAM = {
  bg: "#FFFFFF",
  card: "#FFFFFF",
  cardSoft: "#F4F4F4",
  border: "#DEDEDE",
  text: "#111111",
  muted: "#6E6E6E",
  good: "#B8B8B8",
  warn: "#6E6E6E",
  bad: "#111111",
  dark: "#0A0A0A",
  /** Preto usado para elementos de marca/decorativos (não é status). */
  accent: "#111111",
};

export const brl = (value: number, compact = false) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    ...(compact
      ? { notation: "compact", maximumFractionDigits: 1 }
      : { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  });

export const pct = (value: number) =>
  `${value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

export const dataHora = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
};

/** Escala de cinza a partir do progresso real contra a meta — quanto mais escuro, mais urgente. */
export function statusCor(progresso: number | undefined) {
  if (progresso === undefined) return CREAM.muted;
  if (progresso >= 100) return CREAM.good;
  if (progresso >= 70) return CREAM.warn;
  return CREAM.bad;
}

export function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = Math.max(1, max - min);
  const points = values
    .map((value, index) => `${(index / (values.length - 1)) * 96 + 2},${31 - ((value - min) / span) * 25}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 36" className="h-9 w-24" aria-hidden="true">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Vazio({ texto }: { texto: string }) {
  return <p className="py-8 text-center text-xs" style={{ color: CREAM.muted }}>{texto}</p>;
}

/**
 * Barras de receita realizada por mês + linha pontilhada de meta (ritmo linear
 * da meta anual real ao longo dos 12 meses). Sem dado fabricado: a meta vem
 * do total anual real já consolidado; só a distribuição mensal é projetada.
 */
export function MainChart({ values, metaAno }: { values: { month: string; value: number }[]; metaAno: number }) {
  const [active, setActive] = useState(values.length - 1);
  const width = 820;
  const height = 270;
  const pad = { left: 58, right: 22, top: 24, bottom: 36 };
  const metaMensal = metaAno > 0 ? metaAno / 12 : 0;
  const max = Math.max(...values.map((point) => point.value), metaMensal, 1);
  const ceiling = Math.ceil(max / 1_000_000) * 1_000_000 || max;
  const chartWidth = width - pad.left - pad.right;
  const chartHeight = height - pad.top - pad.bottom;
  const barGap = 10;
  const barWidth = Math.max(8, chartWidth / values.length - barGap);
  const x = (index: number) => pad.left + (index / values.length) * chartWidth + (chartWidth / values.length - barWidth) / 2;
  const y = (value: number) => pad.top + chartHeight - (value / ceiling) * chartHeight;
  const ticks = [0, ceiling / 2, ceiling];
  const metaY = metaMensal > 0 ? y(Math.min(metaMensal, ceiling)) : null;

  return (
    <div className="relative mt-3 min-h-[250px]">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" onMouseLeave={() => setActive(values.length - 1)}>
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={pad.left} x2={width - pad.right} y1={y(tick)} y2={y(tick)} stroke={CREAM.border} strokeDasharray="2 4" />
            <text x={pad.left - 12} y={y(tick) + 4} textAnchor="end" fill={CREAM.muted} className="text-[10px]">
              {tick === 0 ? "R$ 0" : brl(tick, true)}
            </text>
          </g>
        ))}
        {values.map((point, index) => (
          <g key={point.month} onMouseEnter={() => setActive(index)} className="cursor-pointer">
            <rect
              x={x(index)}
              y={y(point.value)}
              width={barWidth}
              height={Math.max(0, pad.top + chartHeight - y(point.value))}
              rx="3"
              fill={active === index ? CREAM.good : `${CREAM.good}55`}
              className="transition-colors duration-150"
            />
            <text x={x(index) + barWidth / 2} y={height - 10} textAnchor="middle" fill={CREAM.muted} className="text-[10px]">
              {point.month}
            </text>
          </g>
        ))}
        {metaY !== null && (
          <line x1={pad.left} x2={width - pad.right} y1={metaY} y2={metaY} stroke={CREAM.dark} strokeWidth="1.5" strokeDasharray="5 4" opacity="0.45" />
        )}
      </svg>
      <div className="pointer-events-none absolute right-3 top-1 rounded-lg border px-2.5 py-2 text-xs shadow-sm" style={{ borderColor: CREAM.border, backgroundColor: CREAM.card }}>
        <p style={{ color: CREAM.muted }}>{values[active]?.month}</p>
        <p className="font-semibold tabular-nums" style={{ color: CREAM.text }}>{brl(values[active]?.value ?? 0)}</p>
      </div>
    </div>
  );
}

interface CompanyLike extends UnidadeConfig {
  source?: { progresso?: number } | undefined;
}

/** Card escuro em destaque com a trilha clicável Grupo NOW → cada empresa. */
export function MapaExecutivo({
  companies,
  progresso,
  aoVivo,
  totalFontes,
  liderNome,
  onNavigate,
}: {
  companies: CompanyLike[];
  progresso: number | undefined;
  aoVivo: number;
  totalFontes: number;
  liderNome: string | undefined;
  onNavigate: (id: UnidadeId) => void;
}) {
  return (
    <section className="rounded-2xl p-4 shadow-[0_8px_24px_rgba(36,33,25,0.25)] lg:p-5" style={{ backgroundColor: CREAM.dark }}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-full" style={{ backgroundColor: `${CREAM.card}26`, color: CREAM.card }}>
            <Map className="size-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold" style={{ color: CREAM.card }}>Mapa executivo</h2>
            <p className="truncate text-xs" style={{ color: `${CREAM.card}99` }}>Onde estamos performando?</p>
          </div>
        </div>

        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs" style={{ backgroundColor: `${CREAM.card}26`, color: CREAM.card }}>
            <span className="font-medium">Grupo NOW</span>
            <strong className="tabular-nums">{progresso !== undefined ? pct(progresso) : "—"}</strong>
          </div>
          {companies.map((company) => {
            const p = company.source?.progresso;
            const cor = p !== undefined && p >= 100 ? `${CREAM.card}80` : p !== undefined && p >= 70 ? `${CREAM.card}B3` : CREAM.card;
            return (
              <span key={company.id} className="flex items-center gap-2">
                <ChevronRight className="size-3.5 shrink-0" style={{ color: `${CREAM.card}55` }} aria-hidden="true" />
                <button onClick={() => onNavigate(company.id)} className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs transition-colors" style={{ backgroundColor: `${CREAM.card}14`, color: CREAM.card }}>
                  <span className="size-1.5 rounded-full" style={{ backgroundColor: company.cor }} />
                  <span className="truncate">{company.nome}</span>
                  <strong className="tabular-nums" style={{ color: cor }}>{p !== undefined ? pct(p) : "—"}</strong>
                </button>
              </span>
            );
          })}
        </div>

        <p className="ml-auto flex shrink-0 items-center gap-3 text-[11px]" style={{ color: `${CREAM.card}80` }}>
          <span>{aoVivo}/{totalFontes} fontes ao vivo</span>
          <span>{liderNome ? `Líder: ${liderNome}` : "—"}</span>
        </p>
      </div>
    </section>
  );
}
