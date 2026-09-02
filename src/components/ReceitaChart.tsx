import { useState } from "react";
import { RECEITA_MENSAL } from "@/data/mock";
import { CORES } from "@/config/dashboards";

/**
 * Receita mensal da NLG no ano corrente.
 *
 * Série única de propósito: a Jornada 4S não publica série mensal, e desenhar
 * uma segunda série vazia — ou preenchida com estimativa — seria pior que não
 * desenhar nada. Com uma série só, o título nomeia o dado e a legenda some.
 */

const W = 760;
const H = 240;
const PAD = { top: 26, right: 14, bottom: 32, left: 54 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

function barra(x: number, y: number, w: number, h: number, r = 4) {
  const raio = Math.max(0, Math.min(r, h, w / 2));
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

const fmt = (v: number) => v.toLocaleString("pt-BR");

export default function ReceitaChart() {
  const [ativo, setAtivo] = useState<number | null>(null);

  const valores = RECEITA_MENSAL.map((d) => d.nlgcomex);
  const maxValor = Math.max(...valores);
  const teto = Math.ceil(maxValor / 1000) * 1000;
  const ticks = [0, teto / 2, teto];
  const iMax = valores.indexOf(maxValor);

  const passo = PLOT_W / RECEITA_MENSAL.length;
  const largura = Math.min(40, passo - 16);
  const y = (v: number) => PAD.top + PLOT_H - (v / teto) * PLOT_H;

  return (
    <div className="relative">
      <div className="mb-4">
        <h3 className="text-[15px] font-semibold text-[#E9EDF2]">
          Receita mensal da NLG Comex
        </h3>
        <p className="text-[13px] text-[#8A94A3]">
          Em R$ mil · ano corrente · derivada do progresso mensal da meta
        </p>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="Colunas da receita mensal da NLG Comex no ano corrente"
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
              {fmt(t)}
            </text>
          </g>
        ))}

        {RECEITA_MENSAL.map((d, i) => {
          const centro = PAD.left + passo * i + passo / 2;
          const x0 = centro - largura / 2;
          const altura = PLOT_H - (y(d.nlgcomex) - PAD.top);
          return (
            <g
              key={d.mes}
              tabIndex={0}
              className="outline-none"
              onMouseEnter={() => setAtivo(i)}
              onFocus={() => setAtivo(i)}
              onBlur={() => setAtivo(null)}
            >
              <rect
                x={PAD.left + passo * i + 2}
                y={PAD.top}
                width={passo - 4}
                height={PLOT_H}
                rx={6}
                fill="#E9EDF2"
                opacity={ativo === i ? 0.05 : 0}
              />
              <path d={barra(x0, y(d.nlgcomex), largura, altura)} fill={CORES.nlg} />
              {i === iMax && (
                <text
                  x={centro}
                  y={y(d.nlgcomex) - 8}
                  textAnchor="middle"
                  className="fill-[#E9EDF2] text-[11px] font-semibold"
                >
                  {fmt(d.nlgcomex)}
                </text>
              )}
              <text
                x={centro}
                y={H - 11}
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
        />
      </svg>

      {ativo !== null && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg border border-[#2A3341] bg-[#0D1219] px-3 py-2 shadow-xl"
          style={{
            left: `${
              ((PAD.left + passo * ativo + passo / 2) / W) * 100 >= 60
                ? ((PAD.left + passo * ativo) / W) * 100 - 18
                : ((PAD.left + passo * ativo + passo) / W) * 100 + 2
            }%`,
            top: "56px",
          }}
        >
          <p className="text-[12px] font-medium text-[#E9EDF2]">
            {RECEITA_MENSAL[ativo].mes}
          </p>
          <p className="text-[13px] font-semibold tabular-nums text-[#E9EDF2]">
            R$ {fmt(RECEITA_MENSAL[ativo].nlgcomex)} mil
          </p>
        </div>
      )}
    </div>
  );
}
