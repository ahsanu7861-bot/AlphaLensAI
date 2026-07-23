const navigation = [
  "Analysis",
  "Scanner",
  "Portfolio",
  "Watchlist",
  "Settings",
];

export default function PreviewSidebar() {
  return (
    <aside className="hidden border-r border-white/10 bg-slate-950/50 p-5 md:block">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 font-bold text-slate-950">
          A
        </div>

        <div>
          <p className="font-semibold text-white">AzaLens</p>
          <p className="text-[10px] uppercase tracking-widest text-slate-500">
            Intelligence
          </p>
        </div>
      </div>

      <nav className="space-y-2">
        {navigation.map((item, index) => (
          <button
            key={item}
            type="button"
            className={`w-full rounded-xl px-4 py-3 text-left text-sm transition ${
              index === 0
                ? "bg-emerald-500/10 font-medium text-emerald-400"
                : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
            }`}
          >
            {item}
          </button>
        ))}
      </nav>
    </aside>
  );
}