import { Badge, Card } from "../ui";

const news = [
  {
    category: "Technology",
    title:
      "NVIDIA leads semiconductor rally as AI infrastructure spending accelerates.",
    time: "18 min ago",
  },
  {
    category: "Markets",
    title:
      "US equities trade higher ahead of major earnings releases this week.",
    time: "42 min ago",
  },
  {
    category: "Federal Reserve",
    title:
      "Investors continue monitoring interest-rate expectations and inflation data.",
    time: "1 hour ago",
  },
  {
    category: "Earnings",
    title:
      "Large-cap technology companies remain the primary market drivers.",
    time: "2 hours ago",
  },
];

export default function MarketNews() {
  return (
    <Card variant="glass" padding="lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">
            Market News
          </p>

          <h2 className="mt-3 text-2xl font-bold text-white">
            Headlines Moving Markets
          </h2>
        </div>

        <Badge variant="info">Live Soon</Badge>
      </div>

      <div className="mt-8 space-y-4">
        {news.map((item) => (
          <button
            key={item.title}
            className="w-full rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-left transition hover:border-emerald-400/20 hover:bg-white/[0.04]"
          >
            <div className="flex items-center justify-between">
              <Badge variant="neutral">{item.category}</Badge>

              <span className="text-xs text-slate-500">
                {item.time}
              </span>
            </div>

            <h3 className="mt-4 text-sm leading-6 font-medium text-slate-200">
              {item.title}
            </h3>
          </button>
        ))}
      </div>

      <button className="mt-6 text-sm font-semibold text-emerald-400 hover:text-emerald-300">
        View all news →
      </button>
    </Card>
  );
}