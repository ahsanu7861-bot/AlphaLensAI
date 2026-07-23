import { Badge, Card } from "../ui";

const company = {
  name: "Apple Inc.",
  ticker: "NASDAQ:AAPL",
  sector: "Technology",
  price: "$212.43",
  changeAmount: "+$2.18",
  changePercent: "+1.04%",
  marketCap: "$3.18T",
  pe: "31.4",
  dividend: "0.52%",
  range52: "$164.08 — $237.23",
  volume: "63.2M",
};

const statistics = [
  {
    label: "Market Cap",
    value: company.marketCap,
  },
  {
    label: "P/E Ratio",
    value: company.pe,
  },
  {
    label: "Dividend Yield",
    value: company.dividend,
  },
  {
    label: "52 Week Range",
    value: company.range52,
  },
  {
    label: "Average Volume",
    value: company.volume,
  },
];

export default function CompanyOverview() {
  return (
    <Card variant="glass" padding="lg">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {company.name}
              </h1>

              <Badge variant="brand">{company.sector}</Badge>
            </div>

            <p className="mt-2 text-sm font-medium tracking-wide text-slate-500">
              {company.ticker}
            </p>
          </div>

          <div className="lg:text-right">
            <p className="text-sm font-medium uppercase tracking-widest text-slate-500">
              Current price
            </p>

            <div className="mt-2 flex flex-wrap items-baseline gap-3 lg:justify-end">
              <p className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                {company.price}
              </p>

              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
                <span>{company.changeAmount}</span>
                <span>{company.changePercent}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-white/10" />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {statistics.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/5 bg-white/[0.025] p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {stat.label}
              </p>

              <p className="mt-3 text-lg font-semibold text-white">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}