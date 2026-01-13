import React from 'react'
import { Handle, Position } from '@xyflow/react'
import { Lightbulb, Sparkles } from 'lucide-react'

interface IdeaNodeProps {
  data: {
    label: string
    status: 'new' | 'processing' | 'crystallized'
    project_id?: string | null
    insightCount?: number
  }
  selected?: boolean
}

const IdeaNode = React.memo(({ data, selected }: IdeaNodeProps) => {
  const hasInsights = data.insightCount && data.insightCount > 0

  return (
    <div className="bg-cc-surface border-2 border-yellow-500/50 rounded-lg px-4 py-3 min-w-[200px] relative">
      <Handle type="target" position={Position.Top} className="!bg-yellow-500" />

      {/* Insight indicator badge */}
      {hasInsights && (
        <div
          className="absolute -top-2 -right-2 flex items-center gap-1 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full shadow-md"
          title={`${data.insightCount} insight${data.insightCount > 1 ? 's' : ''} available`}
        >
          <Sparkles className="w-3 h-3" />
          <span className="font-medium">{data.insightCount}</span>
        </div>
      )}

      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="w-4 h-4 text-yellow-500" />
        <span className="text-xs text-yellow-500 uppercase font-medium">Idea</span>
      </div>

      <p className="text-white text-sm">{data.label}</p>

      <Handle type="source" position={Position.Bottom} className="!bg-yellow-500" />
    </div>
  )
})

IdeaNode.displayName = 'IdeaNode'

export default IdeaNode
