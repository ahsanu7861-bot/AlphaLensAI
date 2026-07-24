type StatusTone =
  | 'bullish'
  | 'bearish'
  | 'neutral'
  | 'warning'
  | 'compliant'
  | 'nonCompliant'

type StatusBadgeProps = {
  label: string
  tone: StatusTone
}

const toneClasses: Record<StatusTone, string> = {
  bullish:
    'border-positive/20 bg-positive/10 text-positive',
  bearish:
    'border-critical/20 bg-critical/10 text-critical',
  neutral:
    'border-brand/20 bg-brand/10 text-brand',
  warning:
    'border-caution/20 bg-caution/10 text-caution',
  compliant:
    'border-positive/20 bg-positive/10 text-positive',
  nonCompliant:
    'border-critical/20 bg-critical/10 text-critical',
}

export default function StatusBadge({
  label,
  tone,
}: StatusBadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5',
        'text-xs font-semibold tracking-wide',
        toneClasses[tone],
      ].join(' ')}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  )
}
