import { Card } from "../ui";

type GreetingHeroProps = {
  userName?: string;
};

export default function GreetingHero({
  userName = "Ahsan",
}: GreetingHeroProps) {
  return (
    <Card variant="brand" padding="lg">
      <div className="flex flex-col justify-between gap-8 xl:flex-row xl:items-end">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">
            AzaLens Intelligence
          </p>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Good afternoon, {userName}
            <span className="ml-2" aria-hidden="true">
              👋
            </span>
          </h1>

          <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
            Markets are moderately bullish today, led by technology and
            semiconductor stocks.
          </p>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400">
            <p>
              <span className="font-semibold text-white">9,842</span> global
              stocks analyzed
            </p>

            <p>
              <span className="font-semibold text-emerald-400">4</span> new
              high-confidence opportunities
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
          >
            Open Watchlist
          </button>

          <button
            type="button"
            className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
          >
            Analyze a Stock
          </button>
        </div>
      </div>
    </Card>
  );
}