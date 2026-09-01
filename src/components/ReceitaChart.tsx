import { useState } from "react";
import { RECEITA_MENSAL } from "@/data/mock";
import { CORES } from "@/config/dashboards";

const W = 720;
const H = 300;
const PAD = { top: 24, right: 16, bottom: 36, left: 52 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

/** Barra com as pontas de dado arredondadas (4px) e a base plana no eixo. */
function barPath(x: number, y: number, w: number, h: number, r = 4) {
  const raio = Math.min(r, h, w / 2);
  return [
    `M ${x} ${y + h}`,
    `L ${x} ${y + raio}`,
    `Q ${x} ${y} ${x + raio} ${y}`,
    `L ${x + w - raio} ${y}`,
    `Q ${x + w} ${y} ${x + w} ${y + raio}`,
    `L ${x + w} ${y + h}`,
    "Z",
  ].join(" ");
}

const SERIES = [
  { id: "nlgcomex" as const, nome: "NLG Comex", cor: CORES.nlg },
  { id: "pulse4s" as const, nome: "Jornada 4S", cor: CORES.pulse },
];

export default function ReceitaChart() {
  const [ativo, setAtivo] = useState<number | null>(null);

  const maxValor = Math.max(
    ...RECEITA_MENSAL.flatMap((d) => [d.nlgcomex, d.pulse4s])
  );
  const teto = Math.ceil(maxValor / 100) * 100;
  const ticks = [0, teto / 2, teto];

  const passo = PLOT_W / RECEITA_MENSAL.length;
  const larguraBarra = Math.min(26, (passo - 22) / 2);
  const gap = 2; // respiro de superfície entre barras adjacentes

  const y = (v: number) => PAD.top + PLOT_H - (v / teto) * PLOT_H;

  return (
    <div className="relative">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold text-[#E9EDF2]">
            Receita por unidade no ano
          </h3>
          <p className="text-[13px] text-[#8A94A3]">
            Em R$ mil · mês a mês do ano corrente
          </p>
        </div>
        <div className="flex items-center gap-4">
          {SERIES.map((s) => (
            <span
              key={s.id}
              className="flex items-center gap-2 text-[13px] text-[#B9C2CE]"
            >
              <span
                className="h-2.5 w-2.5 rounded-[3px]"
                style={{ background: s.cor }}
                aria-hidden="true"
              />
              {s.nome}
            </span>
          ))}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="Gráfico de barras da receita mensal por unidade nos últimos seis meses"
        onMouseLeave={() => setAtivo(null)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(t)}
              y2={y(t)}
              stroke="#232B36"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 10}
              y={y(t) + 4}
              textAnchor="end"
              className="fill-[#6F7987] text-[11px]"
            >
              {t}
            </text>
          </g>
        ))}

        {RECEITA_MENSAL.map((d, i) => {
          const centro = PAD.left + passo * i + passo / 2;
          const x0 = centro - larguraBarra - gap / 2;
          const x1 = centro + gap / 2;
          const ultimo = i === RECEITA_MENSAL.length - 1;
          return (
            <g
              key={d.mes}
              onMouseEnter={() => setAtivo(i)}
              onFocus={() => setAtivo(i)}
              tabIndex={0}
              className="outline-none"
            >
              <rect
                x={PAD.left + passo * i}
                y={PAD.top}
                width={passo}
                height={PLOT_H}
                fill="transparent"
              />
              <path
                d={barPath(x0, y(d.nlgcomex), larguraBarra, PLOT_H - (y(d.nlgcomex) - PAD.top))}
                fill={CORES.nlg}
                opacity={ativo === null || ativo === i ? 1 : 0.45}
              />
              <path
                d={barPath(x1, y(d.pulse4s), larguraBarra, PLOT_H - (y(d.pulse4s) - PAD.top))}
                fill={CORES.pulse}
                opacity={ativo === null || ativo === i ? 1 : 0.45}
              />
              {ultimo && (
                <>
                  <text
                    x={x0 + larguraBarra / 2}
                    y={y(d.nlgcomex) - 8}
                    textAnchor="middle"
                    className="fill-[#E9EDF2] text-[11px] font-medium"
                  >
                    {d.nlgcomex}
                  </text>
                  <text
                    x={x1 + larguraBarra / 2}
                    y={y(d.pulse4s) - 8}
                    textAnchor="middle"
                    className="fill-[#E9EDF2] text-[11px] font-medium"
                  >
                    {d.pulse4s}
                  </text>
                </>
              )}
              <text
                x={centro}
                y={H - 12}
                textAnchor="middle"
                className="fill-[#6F7987] text-[11px]"
              >
                {d.mes}
              </text>
            </g>
          );
        })}

        <line
          x1={PAD.left}
          x2={W - PAD.right}
          y1={PAD.top + PLOT_H}
          y2={PAD.top + PLOT_H}
          stroke="#2E3846"
          strokeWidth={1}
        />
      </svg>

      {ativo !== null && (
        <div
          className="pointer-events-none absolute top-16 z-10 min-w-[150px] -translate-x-1/2 rounded-lg border border-[#2A3341] bg-[#0D1219] p-3 shadow-xl"
          style={{
            left: `${((PAD.left + passo * ativo + passo / 2) / W) * 100}%`,
          }}
        >
          <p className="mb-2 text-[12px] font-medium text-[#E9EDF2]">
            {RECEITA_MENSAL[ativo]!.mes}
          </p>
          {SERIES.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between gap-4 py-0.5"
            >
              <span className="flex items-center gap-2 text-[12px] text-[#8A94A3]">
                <span
                  className="h-2 w-2 rounded-[2px]"
                  style={{ background: s.cor }}
                />
                {s.nome}
              </span>
              <span className="text-[12px] font-medium tabular-nums text-[#E9EDF2]">
                {RECEITA_MENSAL[ativo]![s.id]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
