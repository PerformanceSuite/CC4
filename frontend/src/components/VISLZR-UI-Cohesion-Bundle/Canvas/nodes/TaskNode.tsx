import React from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { CheckSquare } from 'lucide-react'
import { NodeShell } from './NodeShell'

type TaskStatus = 'backlog' | 'in_progress' | 'review' | 'done'

type TaskNodeData = {
  label: string
  status: TaskStatus
}

const STATUS_THEME: Record<TaskStatus, { border: string; text: string; handle: string; badge: string }> = {
  backlog: {
    border: 'border-slate-500/35',
    text: 'text-slate-300',
    handle: '!bg-slate-400',
    badge: 'bg-slate-500/15 text-slate-300',
  },
  in_progress: {
    border: 'border-sky-500/35',
    text: 'text-sky-300',
    handle: '!bg-sky-400',
    badge: 'bg-sky-500/15 text-sky-300',
  },
  review: {
    border: 'border-amber-500/35',
    text: 'text-amber-300',
    handle: '!bg-amber-400',
    badge: 'bg-amber-500/15 text-amber-300',
  },
  done: {
    border: 'border-emerald-500/35',
    text: 'text-emerald-300',
    handle: '!bg-emerald-400',
    badge: 'bg-emerald-500/15 text-emerald-300',
  },
}

export default React.memo(function TaskNode(props: NodeProps<TaskNodeData>) {
  const { data, selected } = props
  const status = (data?.status ?? 'backlog') as TaskStatus
  const t = STATUS_THEME[status]

  return (
    <div>
      <Handle type="target" position={Position.Top} className={t.handle} />
      <NodeShell
        title="Task"
        icon={<CheckSquare className="w-4 h-4" />}
        accentTextClass={t.text}
        accentBorderClass={t.border}
        badge={<span className={`text-[11px] px-2 py-0.5 rounded ${t.badge}`}>{status.replace('_', ' ')}</span>}
        selected={selected}
      >
        <p className="text-cc-text text-sm leading-snug">{data?.label}</p>
      </NodeShell>
      <Handle type="source" position={Position.Bottom} className={t.handle} />
    </div>
  )
})
