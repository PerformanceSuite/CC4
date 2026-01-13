import React from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Sparkles } from 'lucide-react'
import { NodeShell } from './NodeShell'

type InsightNodeData = {
  label: string
  importance?: number
}

export default React.memo(function InsightNode(props: NodeProps<InsightNodeData>) {
  const { data, selected } = props
  const importance = data?.importance

  const badge =
    typeof importance === 'number' ? (
      <span className="text-[11px] px-2 py-0.5 rounded bg-purple-500/15 text-purple-300">
        {Math.round(importance)}%
      </span>
    ) : null

  return (
    <div>
      <Handle type="target" position={Position.Top} className="!bg-purple-400" />
      <NodeShell
        title="Insight"
        icon={<Sparkles className="w-4 h-4" />}
        accentTextClass="text-purple-300"
        accentBorderClass="border-purple-500/35"
        badge={badge}
        selected={selected}
      >
        <p className="text-cc-text text-sm leading-snug">{data?.label}</p>
      </NodeShell>
      <Handle type="source" position={Position.Bottom} className="!bg-purple-400" />
    </div>
  )
})
