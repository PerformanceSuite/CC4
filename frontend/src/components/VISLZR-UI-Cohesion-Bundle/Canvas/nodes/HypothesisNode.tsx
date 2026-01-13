import React from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { FlaskConical } from 'lucide-react'
import { NodeShell } from './NodeShell'

type HypothesisNodeData = {
  label: string
  confidence?: number
}

const CONF_THEME: Record<'unknown' | 'low' | 'mid' | 'high', { badge: string }> = {
  unknown: { badge: 'bg-gray-500/20 text-gray-300' },
  low: { badge: 'bg-red-500/20 text-red-300' },
  mid: { badge: 'bg-yellow-500/20 text-yellow-300' },
  high: { badge: 'bg-green-500/20 text-green-300' },
}

function bucket(conf?: number): keyof typeof CONF_THEME {
  if (conf === undefined || conf === null) return 'unknown'
  if (conf >= 70) return 'high'
  if (conf >= 40) return 'mid'
  return 'low'
}

export default React.memo(function HypothesisNode(props: NodeProps<HypothesisNodeData>) {
  const { data, selected } = props
  const b = bucket(data?.confidence)
  const theme = CONF_THEME[b]

  const badge =
    data?.confidence !== undefined ? (
      <span className={`text-[11px] px-2 py-0.5 rounded ${theme.badge}`}>{data.confidence}%</span>
    ) : null

  return (
    <div>
      <Handle type="target" position={Position.Top} className="!bg-sky-400" />
      <NodeShell
        title="Hypothesis"
        icon={<FlaskConical className="w-4 h-4" />}
        accentTextClass="text-sky-300"
        accentBorderClass="border-sky-500/35"
        badge={badge}
        selected={selected}
      >
        <p className="text-cc-text text-sm leading-snug">{data?.label}</p>
      </NodeShell>
      <Handle type="source" position={Position.Bottom} className="!bg-sky-400" />
    </div>
  )
})
