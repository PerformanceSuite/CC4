/**
 * InlineHint Component
 *
 * Shows contextual hints on VISLZR/Canvas nodes.
 * Phase 26: Insight Surfaces in UI
 */

import { useState } from 'react'
import { Lightbulb, X, ChevronRight, AlertTriangle, TrendingUp } from 'lucide-react'
import { Insight } from '../../hooks/useInsights'

interface InlineHintProps {
  insight: Insight
  position?: 'top' | 'bottom' | 'left' | 'right'
  onDismiss: (id: string) => void
  onAction?: (id: string, action: string) => void
}

const POSITION_CLASSES = {
  top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
  bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
  left: 'right-full mr-2 top-1/2 -translate-y-1/2',
  right: 'left-full ml-2 top-1/2 -translate-y-1/2',
}

const ARROW_CLASSES = {
  top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-cc-surface',
  bottom:
    'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-cc-surface',
  left:
    'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-cc-surface',
  right:
    'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-cc-surface',
}

export default function InlineHint({ insight, position = 'top', onDismiss, onAction }: InlineHintProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getIcon = () => {
    switch (insight.type) {
      case 'concern':
        return <AlertTriangle className="w-3.5 h-3.5 text-yellow-300" />
      case 'pattern':
        return <TrendingUp className="w-3.5 h-3.5 text-sky-300" />
      default:
        return <Lightbulb className="w-3.5 h-3.5 text-cc-accent" />
    }
  }

  // Collapsed state: small bulb button
  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="absolute -top-1 -right-1 p-1 bg-cc-accent rounded-full shadow-lg hover:scale-110 transition-transform z-10"
        title={insight.title}
        type="button"
      >
        <Lightbulb className="w-3 h-3 text-white" />
      </button>
    )
  }

  return (
    <div className={`absolute ${POSITION_CLASSES[position]} z-20`}>
      <div className="bg-cc-surface border border-cc-border rounded-xl shadow-xl min-w-[220px] max-w-[320px]">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-cc-border">
          <div className="flex items-center gap-2 min-w-0">
            {getIcon()}
            <span className="text-[11px] uppercase tracking-wide font-semibold text-cc-text truncate">
              {insight.title}
            </span>
          </div>

          <button
            onClick={() => {
              setIsExpanded(false)
              onDismiss(insight.id)
            }}
            className="p-1 hover:bg-cc-border/40 rounded-md transition-colors"
            type="button"
            aria-label="Dismiss hint"
          >
            <X className="w-3.5 h-3.5 text-cc-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3">
          <p className="text-xs text-cc-muted leading-relaxed">{insight.description}</p>

          {insight.action ? (
            <button
              onClick={() => onAction?.(insight.id, insight.action!)}
              className="mt-3 w-full flex items-center justify-between px-2.5 py-2 rounded-lg bg-cc-bg border border-cc-border text-xs text-cc-text hover:bg-cc-border/40 transition-colors"
              type="button"
            >
              <span className="truncate">{insight.actionLabel || 'Take action'}</span>
              <ChevronRight className="w-4 h-4 text-cc-muted" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Arrow */}
      <div className={`absolute w-0 h-0 border-8 ${ARROW_CLASSES[position]}`} />
    </div>
  )
}
