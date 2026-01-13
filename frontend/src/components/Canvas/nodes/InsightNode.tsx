import React from 'react'
import { Handle, Position } from '@xyflow/react'
import { Sparkles } from 'lucide-react'

interface InsightNodeProps {
  data: {
    label: string
    importance?: number
  }
}

const InsightNode = React.memo(({ data }: InsightNodeProps) => {
  return (
    <div className="bg-cc-surface border-2 border-purple-500/50 rounded-lg px-4 py-3 min-w-[200px]">
      <Handle type="target" position={Position.Top} className="!bg-purple-500" />

      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-purple-500" />
        <span className="text-xs text-purple-500 uppercase font-medium">Insight</span>
      </div>

      <p className="text-white text-sm">{data.label}</p>

      <Handle type="source" position={Position.Bottom} className="!bg-purple-500" />
    </div>
  )
})

InsightNode.displayName = 'InsightNode'

export default InsightNode
