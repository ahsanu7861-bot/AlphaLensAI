import { Badge, Card } from "../ui";

const screeningMetrics = [
  {
    label: "Business Activity",
    value: "Permissible",
    badge: "success" as const,
    description: "The company’s primary business activity passes the screening.",
  },
  {
    label: "Debt Ratio",
    value: "18.0%",
    badge: "success" as const,
    description: "Interest-bearing debt remains within the configured threshold.",
  },
  {
    label: "Interest Income",
    value: "2.1%",
    badge: "success" as const,
    description: "Non-permissible income remains below the screening limit.",
  },
  {
    label: "Cash & Interest Securities",
    value: "11.0%",
    badge: "success" as const,
    description: "Cash and interest-bearing holdings remain within the limit.",
  },
  {
    label: "Receivables Ratio",
    value: "14.2%",
    badge: "success" as const,
    description: "Receivables remain within the configured compliance threshold.",
  },
  {
    label: "Dividend Purification",
    value: "0.18%",
    badge: "info" as const,
    description: "Estimated portion of dividend income requiring purification.",
  },
];

export default function IslamicCompliance() {
  return (
    <Card variant="brand" padding="lg">
      <div>
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Islamic Compliance
            </p>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Shariah screening report
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              A structured review of business activity and financial ratios
              against the selected Shariah screening methodology.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-5 lg:min-w-56">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Overall Status
            </p>

            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/15 text-xl text-emerald-400">
                ✓
              </span>

              <div>
                <p className="text-xl font-bold text-white">
                  Compliant
                </p>

                <p className="text-sm text-emerald-400">
                  Screening passed
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {screeningMetrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-2xl border border-white/5 bg-slate-950/30 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm font-medium text-slate-400">
                  {metric.label}
                </p>

                <Badge variant={metric.badge}>
                  {metric.value}
                </Badge>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-300">
                {metric.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-white/5 bg-slate-950/30 p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-white">
                Screening methodology
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-400">
                Results are based on the selected methodology and the latest
                available company financial data.
              </p>
            </div>

            <Badge variant="neutral">AAOIFI</Badge>
          </div>
        </div>

        <p className="mt-4 text-xs leading-5 text-slate-500">
          This screening is provided for research purposes and should not be
          treated as a religious ruling or personal investment advice.
        </p>
      </div>
    </Card>
  );
}