import {
  ArrowRight,
  Shield,
  Target,
  TrendingUp,
} from 'lucide-react'

import { Card, SectionHeader, StatusBadge } from '../ui'

type TradePlanProps = {
  verdict: 'BUY' | 'SELL' | 'WAIT'
  conviction: number

  entry: string
  confirmation: string
  stop: string
  target1: string
  target2: string

  summary: string
}

export default function TradePlan({
  verdict,
  conviction,
  entry,
  confirmation,
  stop,
  target1,
  target2,
  summary,
}: TradePlanProps) {
  return (
    <section className="mt-8">

      <SectionHeader
        title="AI Trade Plan"
        description="Current technical roadmap generated from the evidence."
      />

      <Card
        interactive
        className="mt-5 p-7"
      >

        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">

          {/* LEFT */}

          <div>

            <div className="flex items-center gap-3">

              <StatusBadge
                tone={
                  verdict === 'BUY'
                    ? 'bullish'
                    : verdict === 'SELL'
                    ? 'bearish'
                    : 'neutral'
                }
                label={verdict}
              />

              <span className="text-sm text-slate-500">
                {conviction}% conviction
              </span>

            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-2">

              <div className="rounded-xl bg-white/5 p-5">

                <Target className="mb-3 text-emerald-400" />

                <p className="text-sm text-slate-500">
                  Preferred Entry
                </p>

                <p className="mt-2 text-2xl font-bold text-white">
                  {entry}
                </p>

              </div>

              <div className="rounded-xl bg-white/5 p-5">

                <TrendingUp className="mb-3 text-sky-400" />

                <p className="text-sm text-slate-500">
                  Confirmation
                </p>

                <p className="mt-2 text-xl font-semibold text-white">
                  {confirmation}
                </p>

              </div>

              <div className="rounded-xl bg-white/5 p-5">

                <Shield className="mb-3 text-amber-400" />

                <p className="text-sm text-slate-500">
                  Risk Control
                </p>

                <p className="mt-2 text-xl font-semibold text-white">
                  {stop}
                </p>

              </div>

              <div className="rounded-xl bg-white/5 p-5">

                <ArrowRight className="mb-3 text-emerald-400" />

                <p className="text-sm text-slate-500">
                  Targets
                </p>

                <p className="mt-2 text-xl font-semibold text-white">
                  {target1}
                </p>

                <p className="text-slate-500">
                  {target2}
                </p>

              </div>

            </div>

          </div>

          {/* RIGHT */}

          <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-6">

            <h3 className="text-lg font-semibold text-white">
              Why this plan?
            </h3>

            <p className="mt-4 leading-7 text-slate-300">
              {summary}
            </p>

          </div>

        </div>

      </Card>

    </section>
  )
}