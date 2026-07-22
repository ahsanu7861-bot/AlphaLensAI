import {
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { Card, ProgressBar, StatusBadge } from '../ui'

type AIVerdictPanelProps = {
  symbol: string
  price: number
  changePercent: number
  trend: string
  conviction: number
  riskLevel: string
  shariahStatus: string
  thesis: string
  support?: number
  resistance?: number
}

export default function AIVerdictPanel({
  symbol,
  price,
  changePercent,
  trend,
  conviction,
  riskLevel,
  shariahStatus,
  thesis,
  support,
  resistance,
}: AIVerdictPanelProps) {
  const normalizedTrend = trend.toLowerCase()
  const isBullish = normalizedTrend.includes('bull')
  const isBearish = normalizedTrend.includes('bear')
  const isPositive = changePercent >= 0

  const verdict = isBullish ? 'BUY BIAS' : isBearish ? 'SELL BIAS' : 'WAIT'

  const verdictTone = isBullish
    ? 'bullish'
    : isBearish
      ? 'bearish'
      : 'neutral'

  const riskTone =
    riskLevel.toLowerCase().includes('high')
      ? 'bearish'
      : riskLevel.toLowerCase().includes('moderate')
        ? 'warning'
        : 'bullish'

  const isCompliant = shariahStatus
    .toLowerCase()
    .includes('compliant')

  const confidenceLabel =
    conviction >= 80
      ? 'High conviction'
      : conviction >= 60
        ? 'Moderate conviction'
        : 'Low conviction'

  return (
    <Card interactive className="p-6 lg:p-8">
      <div className="grid gap-8 xl:grid-cols-[1.35fr_0.65fr]">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
                AI Market Intelligence
              </p>

              <div className="mt-3 flex flex-wrap items-end gap-4">
                <h1 className="text-4xl font-bold tracking-tight text-white">
                  {symbol}
                </h1>

                <div className="flex items-center gap-2">
                  <span className="text-3xl font-semibold text-white">
                    ${price.toFixed(2)}
                  </span>

                  <span
                    className={[
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-1',
                      'text-sm font-semibold',
                      isPositive
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-red-500/10 text-red-400',
                    ].join(' ')}
                  >
                    {isPositive ? (
                      <TrendingUp size={15} />
                    ) : (
                      <TrendingDown size={15} />
                    )}

                    {changePercent > 0 ? '+' : ''}
                    {changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            <StatusBadge label={trend} tone={verdictTone} />
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <Sparkles size={17} className="text-emerald-400" />
                  AI Verdict
                </div>

                <div
                  className={[
                    'mt-3 text-5xl font-bold tracking-tight',
                    isBullish
                      ? 'text-emerald-400'
                      : isBearish
                        ? 'text-red-400'
                        : 'text-sky-400',
                  ].join(' ')}
                >
                  {verdict}
                </div>
              </div>

              <div className="min-w-[190px]">
                <ProgressBar
                  value={conviction}
                  label="Conviction"
                />

                <p className="mt-2 text-right text-xs font-medium text-slate-500">
                  {confidenceLabel}
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-white/10 pt-6">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                Market Thesis
              </p>

              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
                {thesis}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <div className="flex items-center gap-2">
                <Target size={18} className="text-emerald-400" />
                <p className="font-semibold text-white">
                  What to watch
                </p>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-400">
                {resistance !== undefined && (
                  <div className="flex items-start gap-2">
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 shrink-0 text-emerald-400"
                    />
                    <span>
                      Watch for a decisive move above resistance near{' '}
                      <strong className="text-slate-200">
                        ${resistance.toFixed(2)}
                      </strong>
                    </span>
                  </div>
                )}

                {support !== undefined && (
                  <div className="flex items-start gap-2">
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 shrink-0 text-emerald-400"
                    />
                    <span>
                      A pullback toward support near{' '}
                      <strong className="text-slate-200">
                        ${support.toFixed(2)}
                      </strong>{' '}
                      may improve entry quality
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <AlertTriangle
                    size={16}
                    className="mt-0.5 shrink-0 text-amber-400"
                  />
                  <span>
                    Confirm momentum and volume before acting on the bias
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-400" />
                <p className="font-semibold text-white">
                  Decision filters
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <StatusBadge
                  label={`${riskLevel} Risk`}
                  tone={riskTone}
                />

                <StatusBadge
                  label={shariahStatus}
                  tone={
                    isCompliant
                      ? 'compliant'
                      : 'nonCompliant'
                  }
                />
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-500">
                Risk and Shariah screening should be reviewed alongside
                the technical verdict before making any decision.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-400">
            Intelligence Snapshot
          </p>

          <div className="mt-6 space-y-6">
            <div>
              <p className="text-sm text-slate-500">
                Verdict
              </p>
              <p className="mt-1 text-2xl font-bold text-white">
                {verdict}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Conviction
              </p>
              <p className="mt-1 text-2xl font-bold text-white">
                {conviction}%
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Risk
              </p>
              <p className="mt-1 text-2xl font-bold text-white">
                {riskLevel}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Shariah
              </p>
              <p
                className={[
                  'mt-1 text-2xl font-bold',
                  isCompliant
                    ? 'text-emerald-400'
                    : 'text-red-400',
                ].join(' ')}
              >
                {shariahStatus}
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-emerald-500/15 pt-6">
            <p className="text-xs leading-5 text-slate-500">
              AzaLens presents an analytical bias, not guaranteed financial
              advice. Always consider position sizing and independent review.
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}