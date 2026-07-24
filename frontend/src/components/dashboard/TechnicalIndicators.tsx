import {
  Activity,
  BarChart3,
  Gauge,
  LineChart,
  MoveUpRight,
  Radio,
  Sigma,
  Waves,
} from 'lucide-react'
import type { AnalysisResponse } from '../../types/analysis'
import { Card, SectionHeader } from '../ui'

type AnalysisData = AnalysisResponse['data']

type TechnicalIndicatorsProps = {
  data?: AnalysisData
}

type IndicatorItem = {
  label: string
  value: string
  interpretation: string
  icon: typeof Activity
  tone: 'positive' | 'neutral' | 'warning'
}

const toneClasses = {
  positive: {
    icon: 'bg-emerald-500/10 text-emerald-400',
    dot: 'bg-emerald-400',
    text: 'text-emerald-400',
  },
  neutral: {
    icon: 'bg-sky-500/10 text-sky-400',
    dot: 'bg-sky-400',
    text: 'text-sky-400',
  },
  warning: {
    icon: 'bg-amber-500/10 text-amber-400',
    dot: 'bg-amber-400',
    text: 'text-amber-400',
  },
}

function getRsiState(rsi?: number): IndicatorItem['tone'] {
  if (rsi === undefined) return 'neutral'
  if (rsi > 70 || rsi < 30) return 'warning'
  if (rsi >= 50) return 'positive'
  return 'neutral'
}

function getRsiInterpretation(rsi?: number) {
  if (rsi === undefined) return 'Waiting for data'
  if (rsi > 70) return 'Overbought momentum'
  if (rsi < 30) return 'Oversold momentum'
  if (rsi >= 50) return 'Healthy momentum'
  return 'Soft momentum'
}

export default function TechnicalIndicators({
  data,
}: TechnicalIndicatorsProps) {
  const rsi = data?.indicators.rsi.rsi
  const ema20 = data?.indicators.ema.ema20
  const sma50 = data?.indicators.sma.sma50
  const macd = data?.indicators.macd.macd
  const adx = data?.indicators.adx.adx
  const atr = data?.indicators.atr.atr
  const rvol = data?.indicators.rvol.rvol
  const obv = data?.indicators.obv.signal

  const indicators: IndicatorItem[] = [
    {
      label: 'RSI',
      value: rsi !== undefined ? rsi.toFixed(2) : '—',
      interpretation: getRsiInterpretation(rsi),
      icon: Gauge,
      tone: getRsiState(rsi),
    },
    {
      label: 'EMA 20',
      value: ema20 !== undefined ? `$${ema20.toFixed(2)}` : '—',
      interpretation: 'Short-term trend',
      icon: MoveUpRight,
      tone: 'positive',
    },
    {
      label: 'SMA 50',
      value: sma50 !== undefined ? `$${sma50.toFixed(2)}` : '—',
      interpretation: 'Medium-term baseline',
      icon: LineChart,
      tone: 'neutral',
    },
    {
      label: 'MACD',
      value: macd !== undefined ? macd.toFixed(2) : '—',
      interpretation:
        macd !== undefined && macd >= 0
          ? 'Bullish momentum'
          : 'Bearish momentum',
      icon: Waves,
      tone:
        macd === undefined
          ? 'neutral'
          : macd >= 0
            ? 'positive'
            : 'warning',
    },
    {
      label: 'ADX',
      value: adx !== undefined ? adx.toFixed(2) : '—',
      interpretation:
        adx === undefined
          ? 'Waiting for data'
          : adx >= 25
            ? 'Strong trend'
            : 'Weak trend strength',
      icon: Activity,
      tone:
        adx === undefined
          ? 'neutral'
          : adx >= 25
            ? 'positive'
            : 'warning',
    },
    {
      label: 'ATR',
      value: atr !== undefined ? atr.toFixed(2) : '—',
      interpretation: 'Current volatility',
      icon: Sigma,
      tone: 'neutral',
    },
    {
      label: 'Relative Volume',
      value: rvol !== undefined ? `${rvol.toFixed(2)}×` : '—',
      interpretation:
        rvol === undefined
          ? 'Waiting for data'
          : rvol >= 1
            ? 'Above average activity'
            : 'Below average activity',
      icon: BarChart3,
      tone:
        rvol === undefined
          ? 'neutral'
          : rvol >= 1
            ? 'positive'
            : 'warning',
    },
    {
      label: 'OBV',
      value: obv ?? '—',
      interpretation: 'Volume-flow signal',
      icon: Radio,
      tone:
        obv?.toLowerCase().includes('bull') ||
        obv?.toLowerCase().includes('positive')
          ? 'positive'
          : 'neutral',
    },
  ]

  return (
    <section>
      <SectionHeader
        title="Technical Evidence"
        description="The indicators supporting the current AzaLens verdict."
      />

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {indicators.map(
          ({
            label,
            value,
            interpretation,
            icon: Icon,
            tone,
          }) => {
            const classes = toneClasses[tone]

            return (
              <Card
                key={label}
                interactive
                className="group p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    className={[
                      'flex h-10 w-10 items-center justify-center rounded-xl',
                      classes.icon,
                    ].join(' ')}
                  >
                    <Icon size={19} />
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    <span
                      className={[
                        'h-1.5 w-1.5 rounded-full',
                        classes.dot,
                      ].join(' ')}
                    />
                    Live
                  </span>
                </div>

                <p className="mt-6 text-sm font-medium text-slate-500">
                  {label}
                </p>

                <p className="mt-2 text-2xl font-bold tracking-tight text-white">
                  {value}
                </p>

                <p
                  className={[
                    'mt-3 text-sm font-medium',
                    classes.text,
                  ].join(' ')}
                >
                  {interpretation}
                </p>
              </Card>
            )
          },
        )}
      </div>
    </section>
  )
}