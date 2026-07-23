import { Badge, Card } from "../ui";

const watchlist = [
  {
    ticker: "AAPL",
    company: "Apple",
    price: "$212.43",
    change: "+1.04%",
    score: 92,
    verdict: "BUY",
  },
  {
    ticker: "NVDA",
    company: "NVIDIA",
    price: "$171.38",
    change: "+2.74%",
    score: 95,
    verdict: "BUY",
  },
  {
    ticker: "AMD",
    company: "AMD",
    price: "$164.92",
    change: "-0.42%",
    score: 86,
    verdict: "WATCH",
  },
];

export default function WatchlistPreview() {
  return (
    <Card variant="glass" padding="lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">
            Watchlist
          </p>

          <h2 className="mt-3 text-2xl font-bold text-white">
            Your Favorite Stocks
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Quick overview of your monitored companies.
          </p>
        </div>

        <Badge variant="info">
          {watchlist.length} Stocks
        </Badge>
      </div>

      <div className="mt-8 space-y-3">
        {watchlist.map((stock) => (
          <button
            key={stock.ticker}
            className="flex w-full items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition hover:border-emerald-400/20 hover:bg-white/[0.04]"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.05] text-sm font-bold text-white">
                {stock.ticker.slice(0, 2)}
              </div>

              <div className="text-left">
                <p className="font-semibold text-white">
                  {stock.company}
                </p>

                <p className="text-sm text-slate-500">
                  {stock.ticker}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="font-semibold text-white">
                {stock.price}
              </p>

              <p
                className={`text-sm ${
                  stock.change.startsWith("+")
                    ? "text-emerald-400"
                    : "text-rose-400"
                }`}
              >
                {stock.change}
              </p>
            </div>

            <div className="hidden lg:block text-center">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                AI
              </p>

              <p className="font-bold text-white">
                {stock.score}
              </p>
            </div>

            <Badge
              variant={
                stock.verdict === "BUY"
                  ? "success"
                  : "warning"
              }
            >
              {stock.verdict}
            </Badge>
          </button>
        ))}
      </div>

      <button className="mt-6 text-sm font-semibold text-emerald-400 hover:text-emerald-300">
        View Full Watchlist →
      </button>
    </Card>
  );
}