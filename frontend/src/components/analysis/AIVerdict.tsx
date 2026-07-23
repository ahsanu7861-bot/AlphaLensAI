import { Badge, Card } from "../ui";

export default function AIVerdict() {
  return (
    <Card variant="brand" padding="lg">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            AI Verdict
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <h2 className="text-5xl font-bold tracking-tight text-emerald-400">
              BUY
            </h2>

            <Badge variant="success">Bullish</Badge>
          </div>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
            The primary trend remains positive, supported by healthy momentum
            and improving participation. The setup favors continuation while
            price remains above structural support.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                AI Confidence
              </p>

              <p className="mt-2 text-4xl font-bold text-white">
                92%
              </p>
            </div>

            <span className="text-sm font-medium text-emerald-400">
              High confidence
            </span>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[92%] rounded-full bg-emerald-400" />
          </div>

          <p className="mt-3 text-xs leading-5 text-slate-500">
            Confidence reflects trend quality, momentum, volume and setup
            consistency.
          </p>
        </div>
      </div>
    </Card>
  );
}