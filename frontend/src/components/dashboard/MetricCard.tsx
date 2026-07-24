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
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#131b2d] to-[#0b1019] p-5 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_0_25px_rgba(16,185,129,0.12)]">

      {/* Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-10">

        <div className="flex items-center justify-between">

          <p className="text-sm font-medium text-slate-400">
            {title}
          </p>

          <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
            LIVE
          </span>

        </div>

        <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
          {value}
        </h2>

        {subtitle && (
          <p className="mt-4 text-sm leading-6 text-slate-500">
            {subtitle}
          </p>
        )}

      </div>

    </article>
  )
}