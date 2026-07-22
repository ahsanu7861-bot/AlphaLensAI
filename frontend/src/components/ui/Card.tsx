import type { HTMLAttributes, ReactNode } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  interactive?: boolean
}

export default function Card({
  children,
  className = '',
  interactive = false,
  ...props
}: CardProps) {
  return (
    <div
      className={[
        'relative overflow-hidden rounded-2xl border border-white/10',
        'bg-gradient-to-br from-[#111827] to-[#0b111b]',
        interactive
          ? 'transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_0_28px_rgba(16,185,129,0.10)]'
          : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}