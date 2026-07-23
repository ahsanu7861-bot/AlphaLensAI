const plan = [
  {
    label: "Entry zone",
    value: "$211.80 – $214.20",
  },
  {
    label: "Confirmation",
    value: "Close above $215.10",
  },
  {
    label: "Stop loss",
    value: "$206.80",
  },
  {
    label: "Primary target",
    value: "$226.90",
  },
];

export default function PreviewTradePlan() {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-6">
      <div>
        <p className="text-sm text-emerald-400">AI Trade Plan</p>

        <h4 className="mt-2 text-xl font-semibold text-white">
          Defined risk. Clear execution.
        </h4>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          The setup remains valid while price holds above structural
          support.
        </p>
      </div>

      <div className="mt-7 space-y-5">
        {plan.map((item) => (
          <div
            key={item.label}
            className="border-b border-white/10 pb-4 last:border-none last:pb-0"
          >
            <p className="text-xs uppercase tracking-wider text-slate-500">
              {item.label}
            </p>

            <p className="mt-1 font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-7">
        <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Reward / Risk</span>
            <span className="font-semibold text-emerald-400">3.2 : 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}