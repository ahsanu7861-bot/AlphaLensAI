const evidence = [
  {
    label: "Trend",
    value: "Bullish",
    score: 94,
    valueClass: "text-emerald-400",
  },
  {
    label: "Momentum",
    value: "Strong",
    score: 88,
    valueClass: "text-emerald-400",
  },
  {
    label: "Volume",
    value: "Above average",
    score: 81,
    valueClass: "text-sky-400",
  },
  {
    label: "Risk",
    value: "Medium",
    score: 64,
    valueClass: "text-amber-400",
  },
];

export default function PreviewEvidence() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div>
        <p className="text-sm text-slate-500">Technical Evidence</p>
        <h4 className="mt-1 text-lg font-semibold text-white">
          Why AzaLens is bullish
        </h4>
      </div>

      <div className="mt-6 space-y-5">
        {evidence.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">{item.label}</span>

              <span className={`text-sm font-medium ${item.valueClass}`}>
                {item.value}
              </span>
            </div>

            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${item.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}