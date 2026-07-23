import { Badge, Card } from "../ui";

const evidence = [
  {
    label: "Trend",
    value: "Bullish",
    description: "Price remains above the major moving averages.",
    badge: "success" as const,
  },
  {
    label: "Momentum",
    value: "Strong",
    description: "Momentum continues to favor buyers.",
    badge: "success" as const,
  },
  {
    label: "RSI",
    value: "61",
    description: "Positive momentum without being overbought.",
    badge: "info" as const,
  },
  {
    label: "MACD",
    value: "Bullish Cross",
    description: "MACD remains above the signal line.",
    badge: "success" as const,
  },
  {
    label: "Volume",
    value: "Above Average",
    description: "Participation supports the current price move.",
    badge: "info" as const,
  },
  {
    label: "Chart Pattern",
    value: "Ascending Structure",
    description: "Higher lows continue to support the uptrend.",
    badge: "brand" as const,
  },
];

export default function TechnicalEvidence() {
  return (
    <Card variant="glass" padding="lg">
      <div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Technical Evidence
          </p>

          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Why the technical picture is bullish
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            A structured summary of trend, momentum, volume and indicator
            alignment.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {evidence.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/5 bg-white/[0.025] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm font-medium text-slate-400">
                  {item.label}
                </p>

                <Badge variant={item.badge}>{item.value}</Badge>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-300">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}