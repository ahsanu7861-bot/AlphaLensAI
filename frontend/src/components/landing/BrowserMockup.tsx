import type { ReactNode } from "react";

type BrowserMockupProps = {
  children: ReactNode;
};

export default function BrowserMockup({
  children,
}: BrowserMockupProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-emerald-950/20">
      <div className="flex h-14 items-center border-b border-white/10 bg-slate-950/80 px-5">
        <div className="flex gap-2">
          <span className="h-3 w-3 rounded-full bg-red-400/80" />
          <span className="h-3 w-3 rounded-full bg-amber-400/80" />
          <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
        </div>

        <div className="mx-auto rounded-lg border border-white/5 bg-white/5 px-6 py-2 text-xs text-slate-400">
          AzaLens AI · Analysis Workspace
        </div>

        <div className="w-[52px]" />
      </div>

      {children}
    </div>
  );
}