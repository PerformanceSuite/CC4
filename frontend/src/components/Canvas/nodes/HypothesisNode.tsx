import React from 'react'
import { Handle, Position } from '@xyflow/react'
import { FlaskConical } from 'lucide-react'

interface HypothesisNodeProps {
  data: {
    label: string
    confidence?: number
  }
}

const HypothesisNode = React.memo(({ data }: HypothesisNodeProps) => {
  const confidenceColor =
    data.confidence === undefined ? 'gray' :
    data.confidence >= 70 ? 'green' :
    data.confidence >= 40 ? 'yellow' : 'red'

  return (
    <div className="bg-cc-surface border-2 border-blue-500/50 rounded-lg px-4 py-3 min-w-[200px]">
      <Handle type="target" position={Position.Top} className="!bg-blue-500" />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-blue-500" />
          <span className="text-xs text-blue-500 uppercase font-medium">Hypothesis</span>
        </div>
        {data.confidence !== undefined && (
          <span className={`text-xs px-2 py-0.5 rounded bg-${confidenceColor}-500/20 text-${confidenceColor}-400`}>
            {data.confidence}%
          </span>
        )}
      </div>

      <p className="text-white text-sm">{data.label}</p>

      <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
    </div>
  )
})

HypothesisNode.displayName = 'HypothesisNode'

export default HypothesisNode
