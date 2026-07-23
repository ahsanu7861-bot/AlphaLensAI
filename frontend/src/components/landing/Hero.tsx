import SearchBox from "./SearchBox";

export default function Hero() {
  return (
    <section className="mx-auto flex min-h-[85vh] max-w-6xl flex-col items-center justify-center px-8 text-center">

      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
        AI Market Intelligence
      </span>

      <h1 className="mt-8 text-6xl font-bold leading-tight tracking-tight">

        Every Trade.

        <br />

        Explained.

      </h1>

      <p className="mt-8 max-w-2xl text-xl leading-9 text-slate-400">

        AI-powered technical analysis with transparent reasoning,
        risk assessment and built-in Shariah screening.

      </p>

      <div className="mt-12 w-full max-w-3xl">
        <SearchBox />
      </div>

    </section>
  );
}