type ProgressBarProps = {
  value: number
  label?: string
  showValue?: boolean
}

export default function ProgressBar({
  value,
  label,
  showValue = true,
}: ProgressBarProps) {
  const safeValue = Math.min(100, Math.max(0, value))

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="mb-2 flex items-center justify-between">
          {label ? (
            <span className="text-sm font-medium text-slate-400">
              {label}
            </span>
          ) : (
            <span />
          )}

          {showValue && (
            <span className="text-sm font-semibold text-white">
              {safeValue}%
            </span>
          )}
        </div>
      )}

      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-700"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  )
}