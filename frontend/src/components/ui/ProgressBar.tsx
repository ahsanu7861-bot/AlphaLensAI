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
            <span className="text-sm font-medium text-ink-soft">
              {label}
            </span>
          ) : (
            <span />
          )}

          {showValue && (
            <span className="text-sm font-semibold text-ink">
              {safeValue}%
            </span>
          )}
        </div>
      )}

      <div className="h-2 overflow-hidden rounded-full bg-stroke">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand to-intelligence transition-all duration-700"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  )
}
