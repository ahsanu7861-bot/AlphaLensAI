import type { ReactNode } from 'react'

type SectionHeaderProps = {
  title: string
  description?: string
  action?: ReactNode
}

export default function SectionHeader({
  title,
  description,
  action,
}: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm leading-6 text-ink-muted">
            {description}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
