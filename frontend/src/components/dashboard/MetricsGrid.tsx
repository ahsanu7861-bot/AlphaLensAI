import {
  Activity,
  BrainCircuit,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'
import type { AnalysisResponse } from '../../types/analysis'
import MetricCard from './MetricCard'

type AnalysisData = AnalysisResponse['data']

type MetricsGridProps = {
  data?: AnalysisData
}

export default function MetricsGrid({ data }: MetricsGridProps) {
  const metrics = [
    {
      title: 'Market Trend',
      value: data?.trend?.trend ?? 'Loading...',
      subtitle:
        data?.trend?.score !== undefined
          ? `${data.trend.score} trend score`
          : 'Waiting for analysis...',
      icon: TrendingUp,
    },
    {
      title: 'Agreement',
      value:
        data?.agreement?.confidence !== undefined
          ? `${data.agreement.confidence}%`
          : 'Loading...',
      subtitle:
        data?.agreement?.agreementSummary ??
        'Waiting for agreement analysis...',
      icon: Activity,
    },
    {
      title: 'Technical Risk',
      value: data?.risk?.riskLevel ?? 'Loading...',
      subtitle:
        data?.risk?.riskScore !== undefined
          ? `${data.risk.riskScore} risk score`
          : 'Waiting for risk analysis...',
      icon: ShieldCheck,
    },
    {
      title: 'AAOIFI Status',
      value: data?.shariah?.summary?.status ?? 'Loading...',
      subtitle:
        data?.shariah?.summary?.confidence !== undefined
          ? `AAOIFI · ${String(data.shariah.summary.confidence)} confidence`
          : 'Waiting for screening result...',
      icon: BrainCircuit,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(({ title, value, subtitle, icon: Icon }) => (
        <div key={title} className="relative">
          <div className="pointer-events-none absolute right-5 top-5 z-10 rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400">
            <Icon size={20} />
          </div>

          <MetricCard
            title={title}
            value={value}
            subtitle={subtitle}
          />
        </div>
      ))}
    </div>
  )
}
