import { useState } from "react";
import { revenueByMonth, companies } from "@/data/mock";

const NLG = companies[0]!.color;
const J4S = companies[1]!.color;

const W = 720;
const H = 260;
const PAD = { top: 16, right: 56, bottom: 28, left: 44 };

function topRoundedPath(x: number, y: number, w: number, h: number, r = 4) {
  const rr = Math.min(r, h, w / 2);
  return `M${x},${y + h} L${x},${y + rr} Q${x},${y} ${x + rr},${y} L${x + w - rr},${y} Q${x + w},${y} ${x + w},${y + rr} L${x + w},${y + h} Z`;
}

export function RevenueChart() {
  const [hover, setHover] = useState<number | null>(null);

  const max = 3.5;
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const groupW = innerW / revenueByMonth.length;
  const barW = (groupW * 0.56 - 2) / 2;
  const ticks = [0, 1, 2, 3];
  const scale = (v: number) => innerH - (v / max) * innerH;

  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold text-foreground">Receita mensal por unidade</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Últimos 6 meses · R$ milhões</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {companies.map((c) => (
            <span key={c.id} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-[3px]" style={{ backgroundColor: c.color }} />
              {c.name}
            </span>
          ))}
        </div>
      </div>

      <div className="relative mt-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Receita mensal por unidade">
          <g transform={`translate(${PAD.left},${PAD.top})`}>
            {ticks.map((t) => (
              <g key={t}>
                <line x1={0} x2={innerW} y1={scale(t)} y2={scale(t)} stroke="#1C242F" strokeWidth={1} />
                <text x={-10} y={scale(t) + 4} textAnchor="end" fontSize={11} fill="#6F7987">
                  {t}
                </text>
              </g>
            ))}

            {revenueByMonth.map((d, i) => {
              const gx = i * groupW;
              const isLast = i === revenueByMonth.length - 1;
              const hNlg = (d.nlg / max) * innerH;
              const hJ4s = (d.j4s / max) * innerH;
              const x0 = gx + groupW / 2 - barW - 1;
              const x1 = gx + groupW / 2 + 1;
              return (
                <g
                  key={d.month}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                >
                  <rect x={gx} y={0} width={groupW} height={innerH} fill={hover === i ? "#FFFFFF08" : "transparent"} />
                  <path d={topRoundedPath(x0, scale(d.nlg), barW, hNlg)} fill={NLG} />
                  <path d={topRoundedPath(x1, scale(d.j4s), barW, hJ4s)} fill={J4S} />
                  {isLast && (
                    <>
                      <text x={x0 + barW / 2} y={scale(d.nlg) - 6} textAnchor="middle" fontSize={11} fill={NLG}>
                        {d.nlg.toFixed(2)}
                      </text>
                      <text x={x1 + barW / 2} y={scale(d.j4s) - 6} textAnchor="middle" fontSize={11} fill={J4S}>
                        {d.j4s.toFixed(2)}
                      </text>
                    </>
                  )}
                  <text x={gx + groupW / 2} y={innerH + 18} textAnchor="middle" fontSize={11} fill="#8A94A3">
                    {d.month}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {hover !== null && (
          <div
            className="pointer-events-none absolute top-2 rounded-lg border border-border bg-surface-sunken px-3 py-2 text-xs shadow-lg"
            style={{ left: `${((PAD.left + hover * groupW + groupW / 2) / W) * 100}%`, transform: "translateX(-50%)" }}
          >
            <div className="font-medium text-foreground">{revenueByMonth[hover]!.month}</div>
            <div className="mt-1 space-y-0.5 tabular-nums text-muted-foreground">
              <div style={{ color: NLG }}>NLG Comex R$ {revenueByMonth[hover]!.nlg.toFixed(2)} M</div>
              <div style={{ color: J4S }}>Jornada 4S R$ {revenueByMonth[hover]!.j4s.toFixed(2)} M</div>
            </div>
          </div>
        )}
      </div>

      <details className="mt-4 border-t border-border pt-3">
        <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
          Ver dados em tabela
        </summary>
        <table className="mt-3 w-full text-xs tabular-nums">
          <thead>
            <tr className="text-left text-text-tertiary">
              <th className="py-1.5 font-medium">Mês</th>
              <th className="py-1.5 font-medium">NLG Comex</th>
              <th className="py-1.5 font-medium">Jornada 4S</th>
              <th className="py-1.5 font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            {revenueByMonth.map((d) => (
              <tr key={d.month} className="border-t border-border">
                <td className="py-1.5 text-foreground">{d.month}</td>
                <td className="py-1.5">R$ {d.nlg.toFixed(2)} M</td>
                <td className="py-1.5">R$ {d.j4s.toFixed(2)} M</td>
                <td className="py-1.5">R$ {(d.nlg + d.j4s).toFixed(2)} M</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
}
