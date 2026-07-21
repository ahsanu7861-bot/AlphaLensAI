import { useState } from 'react'
import {
  Activity,
  BarChart3,
  Bell,
  BrainCircuit,
  ChevronRight,
  Eye,
  LayoutDashboard,
  Search,
  ShieldCheck,
  TrendingUp,
  WalletCards,
} from 'lucide-react'
import { useAnalysis } from './hooks/useAnalysis'

const navigation = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Stock Analysis', icon: BarChart3 },
  { label: 'Portfolio', icon: WalletCards },
  { label: 'Watchlist', icon: Eye },
]




function App() {
  const [input, setInput] = useState('AAPL')
  const [symbol, setSymbol] = useState('AAPL')

  const { data,isLoading, error } = useAnalysis(symbol)
const metrics = [
  {
    label: 'Market Trend',
    value: data?.trend?.trend ?? 'Loading...',
    detail: `${data?.trend?.score ?? '--'} trend score`,
    icon: TrendingUp,
  },
  {
    label: 'Agreement',
    value: '60%',
    detail: 'Bullish alignment',
    icon: Activity,
  },
  {
    label: 'Technical Risk',
    value: 'Moderate',
    detail: '46 risk score',
    icon: ShieldCheck,
  },
  {
    label: 'Shariah Status',
    value: 'Compliant',
    detail: 'High confidence',
    icon: BrainCircuit,
  },
]
  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextSymbol = input.trim().toUpperCase()

    if (!nextSymbol) {
      return
    }

    setInput(nextSymbol)
    setSymbol(nextSymbol)
  }

  return (
    <div className="min-h-screen bg-[#080b12] text-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-[#0b0f18] lg:flex lg:flex-col">
        <div className="flex h-20 items-center border-b border-white/10 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 font-bold text-black">
            A
          </div>

          <div className="ml-3">
            <p className="text-lg font-semibold tracking-tight">AzaLens</p>
            <p className="text-xs text-slate-500">AI Market Intelligence</p>
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

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-white/10 bg-[#080b12]/90 px-5 backdrop-blur-xl md:px-8">
          <div>
            <p className="text-sm text-slate-500">Welcome back</p>
            <h1 className="text-xl font-semibold">Market Dashboard</h1>
          </div>

          <div className="flex items-center gap-3">
            <form
              onSubmit={handleSearch}
              className="hidden items-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 md:flex"
            >
              <Search size={16} className="shrink-0 text-slate-400" />

              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="AAPL, TSLA, NVDA..."
                aria-label="Stock ticker"
                className="ml-2 w-44 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
              />

              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="ml-3 rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Go'}
              </button>
            </form>

            <button
              type="button"
              aria-label="Notifications"
              className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-400 transition hover:text-white"
            >
              <Bell size={18} />
            </button>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-sm font-semibold">
              AU
            </div>
          </div>
        </header>

        <main className="p-5 md:p-8">
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 via-white/[0.03] to-transparent p-6 md:p-8">
            <div className="max-w-2xl">
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                AI-powered market intelligence
              </span>

              <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">
                Make clearer market decisions.
              </h2>

              <p className="mt-4 max-w-xl leading-7 text-slate-400">
                Analyze technical structure, risk, market agreement and Shariah
                compliance through one intelligent platform.
              </p>

              <button
                type="button"
                onClick={() => {
                  document.querySelector<HTMLInputElement>(
                    'input[aria-label="Stock ticker"]',
                  )?.focus()
                }}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400"
              >
                Analyze a stock
                <ChevronRight size={17} />
              </button>
            </div>
          </section>

          {error && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              Unable to analyze “{symbol}”. Check the ticker and try again.
            </div>
          )}

          <section className="mt-8">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">
                {symbol} Intelligence Snapshot
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Latest AzaLens technical assessment
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map(({ label, value, detail, icon: Icon }) => (
                <article
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-500">{label}</p>
                      <p className="mt-3 text-xl font-semibold">{value}</p>
                    </div>

                    <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400">
                      <Icon size={20} />
                    </div>
                  </div>

                  <p className="mt-5 text-xs text-slate-500">{detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">AI Market Explanation</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Clear interpretation of the technical evidence
                  </p>
                </div>

                <BrainCircuit className="text-emerald-400" size={22} />
              </div>

              <p className="mt-6 leading-7 text-slate-300">
                AAPL currently shows a strong bullish structure, supported by
                moving averages, MACD momentum and trend strength. Conviction
                remains limited by weak relative volume and bearish
                candlestick evidence.
              </p>
            </article>

            <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="font-semibold">Important Levels</h3>

              <div className="mt-6 space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Nearest support
                  </span>
                  <span className="font-medium">$317.40</span>
                </div>

                <div className="h-px bg-white/10" />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Strongest confluence
                  </span>
                  <span className="font-medium">$302.75</span>
                </div>

                <div className="h-px bg-white/10" />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Current price</span>
                  <span className="font-medium text-emerald-400">$325.98</span>
                </div>
              </div>
            </article>
          </section>
        </main>
      </div>
    </div>
  )
}

export default App