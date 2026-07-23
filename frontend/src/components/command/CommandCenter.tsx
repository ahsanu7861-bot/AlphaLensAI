import { Command } from "cmdk";
import { useState } from "react";
import { useCommandStore } from "../../store/commandStore";
import { searchStocks } from "../../lib/searchStocks";

export default function CommandCenter() {
  const { open, setOpen } = useCommandStore();
  const [query, setQuery] = useState("");

  if (!open) return null;

  const results = searchStocks(query);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Command className="w-full">
          <div className="flex items-center border-b border-slate-800 px-4">
            <span className="text-slate-400 mr-2">🔍</span>
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search stocks by name, ticker, or sector..."
              className="w-full bg-transparent py-4 text-slate-100 placeholder-slate-500 outline-none text-sm"
              autoFocus
            />
            <kbd className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded">ESC</kbd>
          </div>

          <Command.List className="max-h-[300px] overflow-y-auto p-2 space-y-1">
            <Command.Empty className="py-6 text-center text-sm text-slate-500">
              No results found.
            </Command.Empty>

            {results.map((stock) => (
              <Command.Item
                key={stock.id}
                onSelect={() => setOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm cursor-pointer hover:bg-slate-800/60 text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-emerald-400">{stock.ticker}</span>
                  <span className="text-slate-300">{stock.company}</span>
                </div>
                <span className="text-xs text-slate-500">{stock.exchange}</span>
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}