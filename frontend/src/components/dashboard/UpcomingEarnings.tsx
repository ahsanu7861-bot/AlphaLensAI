import { Badge, Card } from "../ui";

const earnings = [
  {
    ticker: "TSLA",
    company: "Tesla",
    date: "Today",
    session: "After Market",
  },
  {
    ticker: "GOOGL",
    company: "Alphabet",
    date: "Tomorrow",
    session: "After Market",
  },
  {
    ticker: "MSFT",
    company: "Microsoft",
    date: "Jul 29",
    session: "After Market",
  },
  {
    ticker: "AMZN",
    company: "Amazon",
    date: "Jul 30",
    session: "Before Market",
  },
];

export default function UpcomingEarnings() {
  return (
    <Card variant="glass" padding="lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">
            Earnings Calendar
          </p>

          <h2 className="mt-3 text-2xl font-bold text-white">
            Upcoming Reports
          </h2>
        </div>

        <Badge variant="warning">This Week</Badge>
      </div>

      <div className="mt-8 space-y-4">
        {earnings.map((item) => (
          <div
            key={item.ticker}
            className="rounded-2xl border border-white/5 bg-white/[0.02] p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">
                  {item.company}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {item.ticker}
                </p>
              </div>

              <Badge variant="info">{item.date}</Badge>
            </div>

            <p className="mt-4 text-sm text-slate-400">
              {item.session}
            </p>
          </div>
        ))}
      </div>

      <button className="mt-6 text-sm font-semibold text-emerald-400 hover:text-emerald-300">
        Full earnings calendar →
      </button>
    </Card>
  );
}