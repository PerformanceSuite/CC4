import React, { useEffect, useMemo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { ProgressRing } from '../components/ProgressRing'
import { runMockTask } from '../mock/mockTaskProgress'
import { useTaskProgressStore } from '../../../stores/taskProgressStore'

type TaskProgressNodeData = {
  taskId: string
}

export default function TaskProgressNode({ data }: NodeProps<TaskProgressNodeData>) {
  const taskId = data?.taskId ?? 'mock-task-1'
  const model = useTaskProgressStore((s) => s.tasks[taskId])

  // Kick off mock runner the first time this node mounts (Phase 4 demo).
  useEffect(() => {
    if (!model) runMockTask(taskId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId])

  const slices = useMemo(() => {
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
      { id: 'logs', label: 'Logs', hint: 'View output stream' },
      { id: 'fork', label: 'Fork', hint: 'Fork into new branch/task' },
    ],
    []
  )

  return (
    <div className="rounded-2xl bg-cc-surface/70 border border-cc-border shadow-lg px-3 py-3 w-[220px]">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold text-white/90">Task Progress</div>
        <div className="text-[11px] text-white/55">{model?.status ?? 'running'}</div>
      </div>

      <div className="flex items-center justify-center">
        <ProgressRing
          progress={model?.progress ?? 0.02}
          direction={model?.direction ?? 'cw'}
          label={model?.title ?? 'Implement feature'}
          size={150}
          strokeWidth={10}
          slices={slices}
          options={options}
          onOptionClick={(id) => {
            // Phase 4: wire these to the ActionRing + CommandPalette events later.
            console.log('[TaskProgressNode option]', id)
          }}
        />
      </div>

      {model?.parallelGroups?.length ? (
        <div className="mt-2 text-[11px] text-white/55">
          <div className="mb-1">Parallel plan:</div>
          <div className="flex flex-wrap gap-1">
            {model.parallelGroups.map((g, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10"
                title={g.join(', ')}
              >
                {g.length > 1 ? `Group ${idx + 1}: ${g.length}x` : `Stage ${idx + 1}`}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <Handle type="target" position={Position.Left} className="!bg-cc-accent" />
      <Handle type="source" position={Position.Right} className="!bg-cc-accent" />
    </div>
  )
}
