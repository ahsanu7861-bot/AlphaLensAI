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
    'border-emerald-400/20 bg-emerald-500/10 text-emerald-400',
  bearish:
    'border-red-400/20 bg-red-500/10 text-red-400',
  neutral:
    'border-sky-400/20 bg-sky-500/10 text-sky-400',
  warning:
    'border-amber-400/20 bg-amber-500/10 text-amber-400',
  compliant:
    'border-emerald-400/20 bg-emerald-500/10 text-emerald-400',
  nonCompliant:
    'border-red-400/20 bg-red-500/10 text-red-400',
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