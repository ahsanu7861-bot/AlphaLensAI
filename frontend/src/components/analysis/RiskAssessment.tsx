import { Badge, Card } from "../ui";

const riskMetrics = [
  {
    label: "Overall Risk",
    value: "Moderate",
    badge: "warning" as const,
    description: "The setup carries manageable but meaningful downside risk.",
  },
  {
    label: "Volatility",
    value: "Medium",
    badge: "warning" as const,
    description: "Daily price movement remains within a normal swing range.",
  },
  {
    label: "Suggested Position Size",
    value: "2%",
    badge: "info" as const,
    description: "Suggested maximum portfolio allocation for this setup.",
  },
  {
    label: "Maximum Planned Loss",
    value: "3.5%",
    badge: "danger" as const,
    description: "Estimated loss if the setup reaches its invalidation level.",
  },
  {
    label: "Reward / Risk",
    value: "3.2 : 1",
    badge: "success" as const,
    description: "Potential reward currently exceeds the planned risk.",
  },
  {
    label: "Expected Holding Period",
    value: "5–15 Days",
    badge: "neutral" as const,
    description: "Designed as a short-term swing-trading setup.",
  },
];

export default function RiskAssessment() {
  return (
    <Card variant="glass" padding="lg">
      <div>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
              Risk Assessment
            </p>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Understand the downside before taking action
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              A focused view of volatility, position exposure and the planned
              risk profile.
            </p>
          </div>

          <Badge variant="warning">Moderate Risk</Badge>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {riskMetrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-2xl border border-white/5 bg-white/[0.025] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm font-medium text-slate-400">
                  {metric.label}
                </p>

                <Badge variant={metric.badge}>{metric.value}</Badge>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-300">
                {metric.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-amber-400/10 bg-amber-400/[0.04] p-5">
          <p className="text-sm font-medium text-amber-300">
            Risk interpretation
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            The setup is acceptable for a disciplined swing trade, but the
            position should remain limited and the invalidation level must be
            respected.
          </p>
        </div>
      </div>
    </Card>
  );
}