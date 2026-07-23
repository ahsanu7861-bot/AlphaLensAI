import { Badge, Card } from "../ui";

const indices = [
  {
    symbol: "SPX",
    name: "S&P 500",
    value: "6,297.36",
    change: "+0.42%",
    positive: true,
  },
  {
    symbol: "IXIC",
    name: "Nasdaq",
    value: "20,974.17",
    change: "+0.81%",
    positive: true,
  },
  {
    symbol: "DJI",
    name: "Dow Jones",
    value: "44,502.44",
    change: "-0.18%",
    positive: false,
  },
  {
    symbol: "RUT",
    name: "Russell 2000",
    value: "2,241.64",
    change: "+0.31%",
    positive: true,
  },
];

export default function MarketSnapshot() {
  return (
    <Card variant="glass" padding="lg">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">
            Market Snapshot
          </p>

          <h2 className="mt-3 text-2xl font-bold text-white">
            Major US Indices
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Live overview of today's market performance.
          </p>
        </div>

        <Badge variant="info">US Markets</Badge>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {indices.map((index) => (
          <div
            key={index.symbol}
            className="rounded-2xl border border-white/5 bg-white/[0.025] p-5 transition hover:border-emerald-400/20 hover:bg-white/[0.04]"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  {index.symbol}
                </p>

                <h3 className="mt-2 text-base font-semibold text-white">
                  {index.name}
                </h3>
              </div>

              <Badge
                variant={index.positive ? "success" : "danger"}
              >
                {index.change}
              </Badge>
            </div>

            <p className="mt-8 text-3xl font-bold tracking-tight text-white">
              {index.value}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}