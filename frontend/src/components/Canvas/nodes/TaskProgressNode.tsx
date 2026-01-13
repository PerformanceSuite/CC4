import React, { useEffect, useMemo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { ProgressRing } from '../components/ProgressRing'
import { runMockTask } from '../mock/mockTaskProgress'
import { useTaskProgressStore } from '../../../stores/taskProgressStore'
import { NodeShell } from './NodeShell'
import { ListChecks } from 'lucide-react'

type TaskProgressNodeData = {
  taskId: string
}

export default function TaskProgressNode({ data, selected }: NodeProps<TaskProgressNodeData>) {
  const taskId = data?.taskId ?? 'mock-task-1'
  const model = useTaskProgressStore((s) => s.tasks[taskId])

  // Kick off mock runner the first time this node mounts
  useEffect(() => {
    if (taskId.startsWith('mock-')) runMockTask(taskId)
  }, [taskId])

  const subtasks = useMemo(() => {
    if (!model) return []
    return model.subtasks.map((s) => ({
      id: s.id,
      label: s.label,
      weight: s.weight,
      progress: s.progress,
      status: s.status,
    }))
  }, [model])

  const options = useMemo(
    () => [
      { id: 'open', label: 'Open', hint: 'Open task detail' },
      { id: 'pause', label: 'Pause', hint: 'Pause execution' },
      { id: 'logs', label: 'Logs', hint: 'View output logs' },
    ],
    []
  )

  const overall = model?.progress ?? 0

  return (
    <div className="w-[260px]">
      <Handle type="target" position={Position.Top} className="!bg-cc-accent" />

      <NodeShell
        title="Task Progress"
        icon={<ListChecks className="w-4 h-4" />}
        accentTextClass="text-cc-accent"
        accentBorderClass="border-cc-border"
        selected={selected}
        className="bg-cc-surface/80 backdrop-blur"
        badge={
          <span className="text-[11px] px-2 py-0.5 rounded bg-cc-border/40 text-cc-muted">
            {Math.round(overall)}%
          </span>
        }
      >
        <div className="flex items-start gap-3">
          <div className="shrink-0">
            <ProgressRing progress={overall} size={72} thickness={7} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="space-y-1.5">
              {subtasks.slice(0, 4).map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-cc-text truncate">{s.label}</span>
                  <span className="text-[11px] text-cc-muted tabular-nums">{Math.round(s.progress)}%</span>
                </div>
              ))}
            </div>

            {subtasks.length > 4 ? (
              <div className="mt-2 text-[11px] text-cc-muted">+{subtasks.length - 4} more</div>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-2">
              {options.map((o) => (
                <button
                  key={o.id}
                  className="text-[11px] px-2 py-1 rounded-md bg-cc-bg border border-cc-border text-cc-text hover:bg-cc-border/40 transition-colors"
                  title={o.hint}
                  type="button"
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </NodeShell>

      <Handle type="source" position={Position.Bottom} className="!bg-cc-accent" />
    </div>
  )
}
