import { Badge, Card } from "../ui";

const factors = [
  { name: "Trend", score: 92 },
  { name: "Momentum", score: 86 },
  { name: "Volume", score: 81 },
  { name: "Market Breadth", score: 79 },
];

export default function MarketSentiment() {
  const overallScore = 84;

  return (
    <Card variant="brand" padding="lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">
            AI Market Sentiment
          </p>

          <h2 className="mt-3 text-2xl font-bold text-white">
            Overall Market Outlook
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400 max-w-xl">
            AzaLens evaluates thousands of stocks to estimate the current
            strength of the overall equity market.
          </p>
        </div>

        <Badge variant="success">Bullish</Badge>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Score */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-[10px] border-emerald-400/20">
            <div className="text-center">
              <p className="text-5xl font-bold text-white">
                {overallScore}
              </p>

              <p className="mt-2 text-sm text-slate-400">
                AI Score
              </p>
            </div>
          </div>

          <p className="mt-6 text-lg font-semibold text-emerald-400">
            Moderately Bullish
          </p>
        </div>

        {/* Breakdown */}
        <div className="space-y-6">
          {factors.map((factor) => (
            <div key={factor.name}>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-white">
                  {factor.name}
                </p>

                <p className="text-sm font-semibold text-emerald-400">
                  {factor.score}
                </p>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all"
                  style={{ width: `${factor.score}%` }}
                />
              </div>
            </div>
          ))}

          <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.05] p-5">
            <p className="text-sm font-semibold text-emerald-300">
              AI Summary
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              Market conditions remain constructive. Technology leadership,
              positive momentum and healthy participation suggest a favorable
              environment for selective swing trading.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}