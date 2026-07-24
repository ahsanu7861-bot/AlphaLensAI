
const opportunities = [
  {
    ticker: "NVDA",
    company: "NVIDIA",
    price: "$171.38",
    change: "+2.74%",
    aiScore: 95,
    verdict: "BUY",
    shariah: "Compliant",
  },
  {
    ticker: "META",
    company: "Meta Platforms",
    price: "$742.11",
    change: "+1.83%",
    aiScore: 92,
    verdict: "BUY",
    shariah: "Compliant",
  },
  {
    ticker: "MSFT",
    company: "Microsoft",
    price: "$521.62",
    change: "+0.88%",
    aiScore: 90,
    verdict: "BUY",
    shariah: "Compliant",
  },
  {
    ticker: "GOOGL",
    company: "Alphabet",
    price: "$198.14",
    change: "+1.16%",
    aiScore: 89,
    verdict: "BUY",
    shariah: "Compliant",
  },
  {
    ticker: "AMD",
    company: "AMD",
    price: "$164.92",
    change: "-0.42%",
    aiScore: 86,
    verdict: "WATCH",
    shariah: "Compliant",
  },
];

export default function TopOpportunities() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm">
      <h3 className="mb-4 text-sm font-semibold tracking-wide text-slate-300 uppercase">
        Top AI Opportunities
      </h3>
      <div className="space-y-3">
        {opportunities.map((item) => (
          <div
            key={item.ticker}
            className="flex items-center justify-between rounded-lg border border-slate-800/60 bg-slate-950/40 p-3 hover:border-slate-700 transition-colors"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{item.ticker}</span>
                <span className="text-xs text-slate-400">{item.company}</span>
              </div>
              <div className="mt-1 text-xs text-emerald-400">
                Shariah: {item.shariah}
              </div>
            </div>

            <div className="text-right">
              <div className="font-mono text-sm font-semibold text-slate-100">
                {item.price}
              </div>
              <div
                className={`text-xs font-medium ${
                  item.change.startsWith("+")
                    ? "text-emerald-400"
                    : "text-rose-400"
                }`}
              >
                {item.change}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}