import {
  BarChart3,
  Eye,
  LayoutDashboard,
  WalletCards,
} from 'lucide-react'

const navigation = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Stock Analysis', icon: BarChart3 },
  { label: 'Portfolio', icon: WalletCards },
  { label: 'Watchlist', icon: Eye },
]

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-[#0b0f18] lg:flex lg:flex-col">
      <div className="flex h-20 items-center border-b border-white/10 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 font-bold text-black">
          A
        </div>

        <div className="ml-3">
          <p className="text-lg font-semibold tracking-tight">AzaLens</p>
          <p className="text-xs text-slate-500">AI Stock Intelligence</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {navigation.map(({ label, icon: Icon, active }) => (
          <button
            key={label}
            type="button"
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
              active
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="m-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
        <p className="text-sm font-medium text-emerald-400">
          AzaLens Intelligence
        </p>

        <p className="mt-2 text-xs leading-5 text-slate-400">
          Understand the market before making your next decision.
        </p>
      </div>
    </aside>
  )
}
