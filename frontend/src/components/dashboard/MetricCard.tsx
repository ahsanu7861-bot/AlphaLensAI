type MetricCardProps = {
  title: string
  value: string | number
  subtitle?: string
}

export default function MetricCard({
  title,
  value,
  subtitle,
}: MetricCardProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20">
      <p className="text-sm text-slate-500">{title}</p>

      <p className="mt-3 text-xl font-semibold text-white">
        {value}
      </p>

      {subtitle && (
        <p className="mt-4 text-xs text-slate-500">
          {subtitle}
        </p>
      )}
    </article>
  )
}