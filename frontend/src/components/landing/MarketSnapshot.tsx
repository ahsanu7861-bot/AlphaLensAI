import MarketCard from "./MarketCard";

const markets = [
  {
    name: "S&P 500",
    symbol: "SPX",
    value: "6,325",
    change: "+0.82%",
    positive: true,
  },
  {
    name: "Nasdaq",
    symbol: "IXIC",
    value: "20,950",
    change: "+1.14%",
    positive: true,
  },
  {
    name: "Bitcoin",
    symbol: "BTC",
    value: "$118,400",
    change: "+2.63%",
    positive: true,
  },
  {
    name: "Gold",
    symbol: "XAU",
    value: "$3,340",
    change: "-0.42%",
    positive: false,
  },
];

export default function MarketSnapshot() {
  return (
    <section className="mx-auto max-w-7xl px-8 py-24">

      <div className="mb-14 text-center">

        <span className="rounded-full bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
          LIVE MARKET SNAPSHOT
        </span>

        <h2 className="mt-6 text-5xl font-bold text-white">
          Global Markets at a Glance
        </h2>

        <p className="mt-4 text-lg text-slate-400">
          Stay informed with a quick overview of today's market sentiment.
        </p>

      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {markets.map((market) => (
          <MarketCard
            key={market.symbol}
            {...market}
          />
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8">

        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">

          <div>
            <p className="text-sm uppercase tracking-wide text-slate-500">
              AI Market Mood
            </p>

            <h3 className="mt-2 text-3xl font-bold text-white">
              Bullish
            </h3>

            <p className="mt-2 text-slate-400">
              Trend strength, breadth and momentum remain supportive across major indices.
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-500">
              Fear & Greed
            </p>

            <div className="mt-2 text-6xl font-bold text-emerald-400">
              72
            </div>

            <p className="mt-2 text-emerald-400">
              Greed
            </p>
          </div>

        </div>

      </div>

    </section>
  );
}