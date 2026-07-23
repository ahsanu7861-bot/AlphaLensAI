import { Badge, Card } from "../ui";

const planItems = [
  {
    label: "Entry Zone",
    value: "$211.80 – $214.20",
    description: "Preferred area for considering an entry.",
  },
  {
    label: "Confirmation",
    value: "Close above $215.10",
    description: "Confirms renewed strength before execution.",
  },
  {
    label: "Stop Loss",
    value: "$206.80",
    description: "The setup is invalid below this level.",
  },
  {
    label: "Target 1",
    value: "$220.00",
    description: "First area for partial profit-taking.",
  },
  {
    label: "Target 2",
    value: "$226.90",
    description: "Primary target based on the current structure.",
  },
  {
    label: "Target 3",
    value: "$233.00",
    description: "Extended target if momentum remains strong.",
  },
];

export default function TradePlan() {
  return (
    <Card variant="brand" padding="lg">
      <div>
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
              AI Trade Plan
            </p>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Defined risk. Clear execution.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              The setup remains valid while price holds above structural
              support and the confirmation conditions remain intact.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-5 lg:min-w-52">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Reward / Risk
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-400">
              3.2 : 1
            </p>

            <Badge variant="success">Favorable</Badge>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {planItems.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/5 bg-slate-950/30 p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {item.label}
              </p>

              <p className="mt-3 text-lg font-semibold text-white">
                {item.value}
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-amber-400/10 bg-amber-400/[0.04] p-5">
          <p className="text-sm font-semibold text-amber-300">
            Execution discipline
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Do not enter solely because the stock is inside the entry zone.
            Wait for confirmation, respect the stop loss and size the position
            according to the risk assessment.
          </p>
        </div>

        <p className="mt-4 text-xs leading-5 text-slate-500">
          This plan is for research and educational purposes and is not
          personalized financial advice.
        </p>
      </div>
    </Card>
  );
}