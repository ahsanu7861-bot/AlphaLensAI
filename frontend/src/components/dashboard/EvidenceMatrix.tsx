import {
  Activity,
  BarChart3,
  Shield,
  TrendingUp,
  Waves,
} from 'lucide-react'

import { Card, ProgressBar, SectionHeader } from '../ui'

type EvidenceMatrixProps = {
  trendScore: number
  momentumScore: number
  volumeScore: number
  volatilityScore: number
  structureScore: number
}

const evidence = [
  {
    key: 'trend',
    title: 'Trend',
    icon: TrendingUp,
    description: 'EMA alignment and trend direction',
  },
  {
    key: 'momentum',
    title: 'Momentum',
    icon: Activity,
    description: 'RSI + MACD',
  },
  {
    key: 'volume',
    title: 'Volume',
    icon: BarChart3,
    description: 'OBV + Relative Volume',
  },
  {
    key: 'volatility',
    title: 'Volatility',
    icon: Waves,
    description: 'ATR',
  },
  {
    key: 'structure',
    title: 'Market Structure',
    icon: Shield,
    description: 'Support / Resistance',
  },
] as const

export default function EvidenceMatrix({
  trendScore,
  momentumScore,
  volumeScore,
  volatilityScore,
  structureScore,
}: EvidenceMatrixProps) {
  const scores = {
    trend: trendScore,
    momentum: momentumScore,
    volume: volumeScore,
    volatility: volatilityScore,
    structure: structureScore,
  }

  return (
    <section className="mt-8">

      <SectionHeader
        title="Evidence Matrix"
        description="How AzaLens reached its current market verdict."
      />

      <div className="mt-5 space-y-5">

        {evidence.map(({ key, title, icon: Icon, description }) => (

          <Card
            key={key}
            interactive
            className="p-5"
          >

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Icon size={20} />
                </div>

                <div>

                  <h3 className="font-semibold text-white">
                    {title}
                  </h3>

                  <p className="text-sm text-slate-500">
                    {description}
                  </p>

                </div>

              </div>

              <div className="w-56">

                <ProgressBar
                  value={scores[key]}
                />

              </div>

            </div>

          </Card>

        ))}

      </div>

    </section>
  )
}