import { Search } from "lucide-react";

export default function AICommandBar() {
  return (
    <section className="mb-8">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">

        <div className="flex items-center gap-3">

          <Search className="text-slate-400" size={20} />

          <input
            placeholder="Analyze a stock ticker..."
            className="w-full bg-transparent text-lg text-white placeholder:text-slate-500 outline-none"
          />

        </div>

        <div className="mt-4 flex flex-wrap gap-2">

          {["AAPL","NVDA","TSLA","ASML","TM","NVS"].map(symbol=>(
            <button
              key={symbol}
              className="rounded-full bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-emerald-500/20 transition"
            >
              {symbol}
            </button>
          ))}

        </div>

      </div>
    </section>
  )
}
