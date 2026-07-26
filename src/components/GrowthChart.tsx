"use client";

interface GrowthPoint {
  date: string;
  cumulative: number;
}

interface GrowthChartProps {
  data: GrowthPoint[];
}

export default function GrowthChart({ data }: GrowthChartProps) {
  if (!data || data.length < 2) return null;

  const maxVal = data[data.length - 1].cumulative;
  const minVal = data[0].cumulative;
  const range = maxVal - minVal || 1;

  const WIDTH = 600;
  const HEIGHT = 160;
  const PAD = { top: 12, bottom: 20, left: 4, right: 4 };
  const chartW = WIDTH - PAD.left - PAD.right;
  const chartH = HEIGHT - PAD.top - PAD.bottom;

  const points = data.map((d, i) => ({
    x: PAD.left + (i / Math.max(data.length - 1, 1)) * chartW,
    y: PAD.top + chartH - ((d.cumulative - minVal) / range) * chartH,
    ...d,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaD = `${pathD} L${points[points.length - 1].x},${PAD.top + chartH} L${points[0].x},${PAD.top + chartH} Z`;

  // Показывать максимум 5 подписей по оси X
  const labelStep = Math.max(1, Math.floor(data.length / 5));

  return (
    <div className="glass-card rounded-2xl p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
        <span aria-hidden="true">📈</span> Рост вкладов
      </h3>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Gradient fill */}
        <defs>
          <linearGradient id="growth-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(245,158,11,0.3)" />
            <stop offset="100%" stopColor="rgba(245,158,11,0.02)" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
          const y = PAD.top + chartH - frac * chartH;
          return (
            <g key={frac}>
              <line
                x1={PAD.left}
                y1={y}
                x2={WIDTH - PAD.right}
                y2={y}
                stroke="rgba(51,65,85,0.5)"
                strokeWidth={1}
              />
              <text
                x={PAD.left - 2}
                y={y + 3}
                textAnchor="end"
                className="fill-slate-600"
                fontSize={9}
              >
                {Math.round(minVal + frac * range)}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaD} fill="url(#growth-gradient)" />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="rgb(245,158,11)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={3}
            className="fill-amber-500"
          />
        ))}

        {/* X axis labels */}
        {data
          .filter((_, i) => i % labelStep === 0 || i === data.length - 1)
          .map((d, i) => {
            const idx = data.indexOf(d);
            const x = PAD.left + (idx / Math.max(data.length - 1, 1)) * chartW;
            return (
              <text
                key={i}
                x={x}
                y={HEIGHT - 4}
                textAnchor="middle"
                className="fill-slate-600"
                fontSize={8}
              >
                {new Date(d.date).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "short",
                })}
              </text>
            );
          })}
      </svg>
    </div>
  );
}
