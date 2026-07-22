import { useState } from 'react'
import {
  BarChart3,
  Bell,
  Eye,
  LayoutDashboard,
  Search,
  WalletCards,
} from 'lucide-react'
import { useAnalysis } from './hooks/useAnalysis'
import StockChart from './components/StockChart'
import ImportantLevels from './components/dashboard/ImportantLevels'
import AIVerdictPanel from './components/dashboard/AIVerdictPanel'
import TechnicalIndicators from './components/dashboard/TechnicalIndicators'
import EvidenceMatrix from './components/dashboard/EvidenceMatrix'
import TradePlan from './components/dashboard/TradePlan'
import AIExplanation from './components/dashboard/AIExplanation'

const navigation = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Stock Analysis', icon: BarChart3 },
  { label: 'Portfolio', icon: WalletCards },
  { label: 'Watchlist', icon: Eye },
]

function App() {
  const [input, setInput] = useState('AAPL')
  const [symbol, setSymbol] = useState('AAPL')

  const { data, isLoading, error } = useAnalysis(symbol)

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextSymbol = input.trim().toUpperCase()

    if (!nextSymbol) {
      return
    }

    setInput(nextSymbol)
    setSymbol(nextSymbol)
  }

  const explanation =
    data?.agreement?.agreementSummary ?? 'Waiting for AI analysis...'

  const trend = data?.trend?.trend ?? '--'
  const confidence = data?.agreement?.confidence ?? '--'
  const risk = data?.risk?.riskLevel ?? '--'
  const shariah = data?.shariah?.summary?.status ?? '--'
const evidenceScores = {
  trendScore: data?.trend?.score ?? 95,
  momentumScore: 82,
  volumeScore: 71,
  volatilityScore: 56,
  structureScore: 88,
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
  {error && (
    <div className="mb-8 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
      Unable to analyze “{symbol}”. Check the ticker and try again.
    </div>
  )}

  <AIVerdictPanel
    symbol={symbol}
    price={data?.market?.data?.price ?? 0}
    changePercent={data?.market?.data?.changePercent ?? 0}
    trend={data?.trend?.trend ?? 'Neutral'}
    conviction={data?.agreement?.confidence ?? 0}
    riskLevel={data?.risk?.riskLevel ?? 'Unknown'}
    shariahStatus={data?.shariah?.summary?.status ?? 'Unknown'}
    thesis={
      data?.explanation?.overallAssessment ??
      'AzaLens is generating the current market thesis...'
    }
    support={data?.confluence?.nearestSupport?.zone?.center}
    resistance={data?.confluence?.strongestZone?.zone?.center}
  />

  <div className="mt-8">
    <StockChart symbol={symbol} />
  </div>

  <div className="mt-8">
    <TechnicalIndicators data={data} />
  </div>
<EvidenceMatrix {...evidenceScores} />
  <section className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
    <TradePlan
  verdict="BUY"
  conviction={data?.agreement?.confidence ?? 0}
  entry="$318 - $320"
  confirmation="Break above $330"
  stop="Below EMA20"
  target1="$336"
  target2="$344"
  summary="Trend, momentum and volume remain supportive. Price is approaching resistance, so confirmation above $330 or a pullback toward support would provide a higher-quality technical setup."
/>
    <AIExplanation
      trend={trend}
      confidence={confidence}
      risk={risk}
      shariah={shariah}
      explanation={explanation}
    />

    <ImportantLevels
      support={data?.confluence?.nearestSupport?.zone?.center}
      confluence={data?.confluence?.strongestZone?.zone?.center}
      currentPrice={data?.market?.data?.price}
    />
  </section>
</main>
</div>
</div> 
)
} export default App