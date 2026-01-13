import React from 'react'
import type { ReactNode } from 'react'

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

type NodeShellProps = {
  icon?: ReactNode
  title: string
  badge?: ReactNode
  corner?: ReactNode
  accentTextClass?: string
  accentBorderClass?: string
  className?: string
  selected?: boolean
  children: ReactNode
}

export function NodeShell({
  icon,
  title,
  badge,
  corner,
  accentTextClass = 'text-cc-accent',
  accentBorderClass = 'border-cc-border',
  className,
  selected,
  children,
}: NodeShellProps) {
  return (
    <div
      className={cn(
        'relative min-w-[220px] rounded-xl bg-cc-surface border shadow-lg/20 px-4 py-3',
        accentBorderClass,
        selected && 'ring-2 ring-cc-accent/35',
        className
      )}
    >
      {corner}

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon ? <span className={cn('w-4 h-4', accentTextClass)}>{icon}</span> : null}
          <span className={cn('text-[11px] uppercase tracking-wide font-semibold', accentTextClass)}>
            {title}
          </span>
        </div>
        {badge ? <div>{badge}</div> : null}
      </div>

      {children}
    </div>
  )
}
