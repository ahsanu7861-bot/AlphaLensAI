type ImportantLevelsProps = {
  support?: string | number
  confluence?: string | number
  currentPrice?: string | number
}

function formatPrice(value?: string | number) {
  if (value === undefined || value === null || value === '') {
    return '--'
  }

  const numericValue = Number(value)

  if (Number.isNaN(numericValue)) {
    return String(value)
  }

  return `$${numericValue.toFixed(2)}`
}

export default function ImportantLevels({
  support,
  confluence,
  currentPrice,
}: ImportantLevelsProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <h3 className="font-semibold">Important Levels</h3>

      <div className="mt-6 space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">
            Nearest support
          </span>

          <span className="font-medium">
            {formatPrice(support)}
          </span>
        </div>

        <div className="h-px bg-white/10" />

        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">
            Strongest confluence
          </span>

          <span className="font-medium">
            {formatPrice(confluence)}
          </span>
        </div>

        <div className="h-px bg-white/10" />

        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">
            Current price
          </span>

          <span className="font-medium text-emerald-400">
            {formatPrice(currentPrice)}
          </span>
        </div>
      </div>
    </article>
  )
}