import { Badge, Card } from "../ui";

const allocation = [
  { sector: "Technology", value: 48 },
  { sector: "Healthcare", value: 22 },
  { sector: "Industrials", value: 18 },
  { sector: "Cash", value: 12 },
];

export default function PortfolioSummary() {
  return (
    <Card variant="brand" padding="lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">
            Portfolio
          </p>

          <h2 className="mt-3 text-2xl font-bold text-white">
            Portfolio Summary
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Snapshot of your current holdings.
          </p>
        </div>

        <Badge variant="success">
          +2.18%
        </Badge>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <Metric title="Portfolio Value" value="$128,420" />
        <Metric title="Today's Gain" value="+$2,731" />
        <Metric title="Risk Score" value="74 / 100" />
        <Metric title="Shariah" value="98% Pass" />
      </div>

      <div className="mt-8">
        <p className="text-sm font-semibold text-white">
          Allocation
        </p>

        <div className="mt-5 space-y-5">
          {allocation.map((item) => (
            <div key={item.sector}>
              <div className="mb-2 flex justify-between">
                <span className="text-sm text-slate-300">
                  {item.sector}
                </span>

                <span className="text-sm font-semibold text-white">
                  {item.value}%
                </span>
              </div>

              <div className="h-2 rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-emerald-400"
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="mt-8 text-sm font-semibold text-emerald-400 hover:text-emerald-300">
        Open Portfolio →
      </button>
    </Card>
  );
}

function Metric({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <p className="text-xs uppercase tracking-wider text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}