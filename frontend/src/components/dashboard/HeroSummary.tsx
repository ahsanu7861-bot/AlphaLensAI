import { TrendingDown, TrendingUp } from 'lucide-react'
import { Card, ProgressBar, StatusBadge } from '../ui'

type HeroSummaryProps = {
  symbol: string
  price: number
  changePercent: number
  trend: string
  conviction: number
  thesis: string
}

export default function HeroSummary({
  symbol,
  price,
  changePercent,
  trend,
  conviction,
  thesis,
}: HeroSummaryProps) {
  const isPositive = changePercent >= 0

  const trendTone =
    trend.toLowerCase().includes('bull')
      ? 'bullish'
      : trend.toLowerCase().includes('bear')
      ? 'bearish'
      : 'neutral'

  return (
    <Card interactive className="p-8">

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">

        {/* LEFT */}

        <div className="flex-1">

          <div className="flex items-center gap-3">

            <h1 className="text-4xl font-bold tracking-tight text-white">
              {symbol}
            </h1>

            <StatusBadge
              label={trend}
              tone={trendTone}
            />

          </div>

          <div className="mt-6 flex items-center gap-5">

            <span className="text-5xl font-bold text-white">
              ${price.toFixed(2)}
            </span>

            <div
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold ${
                isPositive
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-red-500/10 text-red-400'
              }`}
            >
              {isPositive ? (
                <TrendingUp size={16} />
              ) : (
                <TrendingDown size={16} />
              )}

              {changePercent.toFixed(2)}%
            </div>

          </div>

          <p className="mt-8 max-w-2xl text-base leading-7 text-slate-400">
            {thesis}
          </p>

        </div>

        {/* RIGHT */}

        <div className="w-full max-w-sm">

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">

            <p className="text-sm uppercase tracking-widest text-slate-500">
              AI Conviction
            </p>

            <div className="mt-3 text-4xl font-bold text-white">
              {conviction}%
            </div>

            <div className="mt-6">
              <ProgressBar value={conviction} />
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Confidence based on trend, momentum,
              volume and confluence analysis.
            </p>

          </div>

        </div>

      </div>

    </Card>
  )
}