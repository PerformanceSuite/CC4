import React, { useMemo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Lightbulb, Sparkles } from 'lucide-react'
import { NodeShell } from './NodeShell'

type IdeaStatus = 'new' | 'processing' | 'crystallized'

type IdeaNodeData = {
  label: string
  status: IdeaStatus
  project_id?: string | null
  insightCount?: number
}

const STATUS_THEME: Record<IdeaStatus, { border: string; text: string; handle: string; badge: string }> = {
  new: {
    border: 'border-yellow-500/35',
    text: 'text-yellow-300',
    handle: '!bg-yellow-400',
    badge: 'bg-yellow-500/15 text-yellow-300',
  },
  processing: {
    border: 'border-sky-500/35',
    text: 'text-sky-300',
    handle: '!bg-sky-400',
    badge: 'bg-sky-500/15 text-sky-300',
  },
  crystallized: {
    border: 'border-purple-500/35',
    text: 'text-purple-300',
    handle: '!bg-purple-400',
    badge: 'bg-purple-500/15 text-purple-300',
  },
}

export default React.memo(function IdeaNode(props: NodeProps<IdeaNodeData>) {
  const { data, selected } = props
  const status = (data?.status ?? 'new') as IdeaStatus
  const t = STATUS_THEME[status]

  const insightCount = data?.insightCount ?? 0
  const hasInsights = insightCount > 0

  const corner = useMemo(() => {
    if (!hasInsights) return null
    return (
      <div
        className="absolute -top-2 -right-2 flex items-center gap-1 bg-cc-accent text-white text-xs px-2 py-0.5 rounded-full shadow-md"
        title={`${insightCount} insight${insightCount === 1 ? '' : 's'} available`}
      >
        <Sparkles className="w-3 h-3" />
        <span className="font-medium">{insightCount}</span>
      </div>
    )
  }, [hasInsights, insightCount])

  return (
    <div>
      <Handle type="target" position={Position.Top} className={t.handle} />
      <NodeShell
        title="Idea"
        icon={<Lightbulb className="w-4 h-4" />}
        accentTextClass={t.text}
        accentBorderClass={t.border}
        badge={<span className={`text-[11px] px-2 py-0.5 rounded ${t.badge}`}>{status.replace('_', ' ')}</span>}
        corner={corner}
        selected={selected}
      >
        <p className="text-cc-text text-sm leading-snug">{data?.label}</p>
      </NodeShell>
      <Handle type="source" position={Position.Bottom} className={t.handle} />
    </div>
  )
})
