import { useCommandStore } from "../../store/commandStore";

export default function SearchBar() {
  const setOpen = useCommandStore((state) => state.setOpen);

  return (
    <button
      onClick={() => setOpen(true)}
      className="flex items-center justify-between w-full max-w-md px-4 py-2.5 text-sm text-slate-400 bg-slate-900/80 border border-slate-800 rounded-xl hover:border-slate-700 hover:text-slate-200 transition-colors shadow-sm"
    >
      <div className="flex items-center gap-2.5">
        <span>🔍</span>
        <span>Search stocks...</span>
      </div>

      <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-800 rounded border border-slate-700/60">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  );
}