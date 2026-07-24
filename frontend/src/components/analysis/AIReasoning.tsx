import { Card } from "../ui";

const reasoningPoints = [
  {
    title: "Trend remains constructive",
    description:
      "Price continues to hold above the 20-day and 50-day exponential moving averages, which supports the broader bullish structure.",
  },
  {
    title: "Momentum is supportive",
    description:
      "RSI remains positive without entering an overbought condition, leaving room for further upside continuation.",
  },
  {
    title: "Volume confirms participation",
    description:
      "Recent trading activity is above average, suggesting stronger participation behind the current move.",
  },
  {
    title: "Risk remains manageable",
    description:
      "The setup offers a favorable reward-to-risk profile as long as price remains above the structural invalidation level.",
  },
];

export default function AIReasoning() {
  return (
    <Card variant="glass" padding="lg">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          AI Reasoning
        </p>

        <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          How AzaLens reached this conclusion
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
          The verdict is based on the combined strength of trend, momentum,
          volume, structural levels and risk conditions.
        </p>

        <div className="mt-8 space-y-4">
          {reasoningPoints.map((point, index) => (
            <div
              key={point.title}
              className="grid gap-4 rounded-2xl border border-white/5 bg-white/[0.025] p-5 sm:grid-cols-[44px_minmax(0,1fr)]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-sm font-bold text-emerald-400">
                {index + 1}
              </div>

              <div>
                <h3 className="text-base font-semibold text-white">
                  {point.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {point.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.04] p-5">
          <p className="text-sm font-semibold text-emerald-300">
            AI conclusion
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            The probability currently favors bullish continuation, provided
            price remains above structural support and momentum does not weaken.
          </p>
        </div>
      </div>
    </Card>
  );
}