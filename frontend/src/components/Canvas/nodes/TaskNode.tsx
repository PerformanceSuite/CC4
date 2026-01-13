import React from 'react'
import { Handle, Position } from '@xyflow/react'
import { CheckSquare } from 'lucide-react'

interface TaskNodeProps {
  data: {
    label: string
    status: 'backlog' | 'in_progress' | 'review' | 'done'
  }
}

const statusColors = {
  backlog: 'gray',
  in_progress: 'blue',
  review: 'yellow',
  done: 'green',
}

const TaskNode = React.memo(({ data }: TaskNodeProps) => {
  const color = statusColors[data.status] || 'gray'

  return (
    <div className={`bg-cc-surface border-2 border-${color}-500/50 rounded-lg px-4 py-3 min-w-[200px]`}>
      <Handle type="target" position={Position.Top} className={`!bg-${color}-500`} />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <CheckSquare className={`w-4 h-4 text-${color}-500`} />
          <span className={`text-xs text-${color}-500 uppercase font-medium`}>Task</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded bg-${color}-500/20 text-${color}-400`}>
          {data.status.replace('_', ' ')}
        </span>
      </div>

      <p className="text-white text-sm">{data.label}</p>

      <Handle type="source" position={Position.Bottom} className={`!bg-${color}-500`} />
    </div>
  )
})

TaskNode.displayName = 'TaskNode'

export default TaskNode
