export default function PreviewHeader() {
  return (
    <header className="flex flex-col justify-between gap-6 border-b border-white/10 pb-6 sm:flex-row sm:items-center">
      <div>
        <div className="flex items-center gap-3">
          <h3 className="text-2xl font-bold text-white">Apple Inc.</h3>

          <span className="rounded-lg bg-white/5 px-2 py-1 text-xs text-slate-400">
            AAPL
          </span>
        </div>

        <p className="mt-2 text-sm text-slate-500">
          NASDAQ · Technology · Updated moments ago
        </p>
      </div>

      <div className="flex items-center gap-5">
        <div>
          <p className="text-right text-xs uppercase tracking-wider text-slate-500">
            AI confidence
          </p>

          <p className="mt-1 text-right text-3xl font-bold text-white">
            92%
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-6 py-3 text-center">
          <p className="text-xs uppercase tracking-wider text-emerald-300">
            Verdict
          </p>

          <p className="mt-1 text-xl font-bold text-emerald-400">
            BUY
          </p>
        </div>
      </div>
    </header>
  );
}