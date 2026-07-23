import { Badge, Card } from "../ui";

const marketDetails = [
  {
    label: "Primary Trend",
    value: "Bullish",
    badge: "success" as const,
  },
  {
    label: "EMA 20",
    value: "Price Above",
    badge: "success" as const,
  },
  {
    label: "EMA 50",
    value: "Price Above",
    badge: "success" as const,
  },
  {
    label: "Support",
    value: "$211.80",
    badge: "neutral" as const,
  },
  {
    label: "Resistance",
    value: "$220.10",
    badge: "warning" as const,
  },
  {
    label: "Volume",
    value: "Above Average",
    badge: "info" as const,
  },
];

export default function MarketStructure() {
  return (
    <Card variant="glass" padding="lg">
      <div>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Market Structure
            </p>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Price trend and structural levels
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              A visual view of the current trend, moving averages, support,
              resistance and trading activity.
            </p>
          </div>

          <Badge variant="success">Bullish Structure</Badge>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50">
          <div className="flex min-h-[360px] items-center justify-center p-8">
            <div className="w-full max-w-4xl">
              <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-slate-500">
                <span>$220.10 resistance</span>
                <span>Chart preview</span>
              </div>

              <div className="relative mt-6 h-64 overflow-hidden rounded-xl border border-white/5 bg-gradient-to-b from-emerald-500/[0.06] to-transparent">
                <div className="absolute inset-x-0 top-[20%] border-t border-dashed border-amber-400/40" />
                <div className="absolute inset-x-0 bottom-[22%] border-t border-dashed border-emerald-400/30" />

                <svg
                  viewBox="0 0 1000 260"
                  preserveAspectRatio="none"
                  className="absolute inset-0 h-full w-full"
                  aria-label="Illustrative bullish market structure chart"
                  role="img"
                >
                  <defs>
                    <linearGradient
                      id="marketStructureArea"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="currentColor"
                        stopOpacity="0.28"
                      />
                      <stop
                        offset="100%"
                        stopColor="currentColor"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>

                  <path
                    d="M0 220 C80 205 120 185 180 192 C245 198 265 150 335 158 C400 166 420 118 495 126 C560 136 590 92 660 103 C730 115 755 70 825 80 C895 91 925 45 1000 35 L1000 260 L0 260 Z"
                    fill="url(#marketStructureArea)"
                    className="text-emerald-400"
                  />

                  <path
                    d="M0 220 C80 205 120 185 180 192 C245 198 265 150 335 158 C400 166 420 118 495 126 C560 136 590 92 660 103 C730 115 755 70 825 80 C895 91 925 45 1000 35"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    className="text-emerald-400"
                  />
                </svg>

                <div className="absolute bottom-4 left-4 rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-xs text-slate-400">
                  Illustrative chart — live market data coming later
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>$211.80 support</span>
                <span>EMA 20 and EMA 50 aligned bullishly</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {marketDetails.map((detail) => (
            <div
              key={detail.label}
              className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/[0.025] p-5"
            >
              <p className="text-sm font-medium text-slate-400">
                {detail.label}
              </p>

              <Badge variant={detail.badge}>{detail.value}</Badge>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}