import { BrainCircuit } from 'lucide-react'

type AIExplanationProps = {
  trend: string
  confidence: string | number
  risk: string
  shariah: string
  explanation: string
}

export default function AIExplanation({
  trend,
  confidence,
  risk,
  shariah,
  explanation,
}: AIExplanationProps) {
  return (
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

      <div className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-xs text-slate-500">Trend</p>

            <p className="mt-2 text-lg font-semibold text-emerald-400">
              {trend}
            </p>
          </div>

          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-xs text-slate-500">Confidence</p>

            <p className="mt-2 text-lg font-semibold">
              {confidence}%
            </p>
          </div>

          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-xs text-slate-500">Risk</p>

            <p className="mt-2 text-lg font-semibold text-yellow-400">
              {risk}
            </p>
          </div>

          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-xs text-slate-500">AAOIFI Shariah</p>

            <p className="mt-2 text-lg font-semibold text-emerald-400">
              {shariah}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <h4 className="mb-2 font-semibold text-emerald-400">
            AI Summary
          </h4>

          <p className="leading-7 text-slate-300">
            {explanation}
          </p>
        </div>
      </div>
    </article>
  )
}
