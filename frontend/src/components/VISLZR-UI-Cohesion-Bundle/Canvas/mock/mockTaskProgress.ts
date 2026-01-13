import { TaskProgressModel, Subtask, useTaskProgressStore } from '../../../stores/taskProgressStore'

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

/**
 * Simple mock pipeline that:
 * 1) Decides which subtasks can be parallel (a small grouping heuristic)
 * 2) Advances progress sequentially, but runs parallel group subtasks concurrently
 *
 * This is meant to drive the VISLZR progress-ring node during Phase 4 UI work.
 */
export async function runMockTask(taskId = 'mock-task-1') {
  const baseSubtasks: Subtask[] = [
    { id: 's1', label: 'Scaffold files', weight: 1, progress: 0, status: 'pending' },
    { id: 's2', label: 'Implement core logic', weight: 2, progress: 0, status: 'pending' },
    { id: 's3', label: 'Write tests', weight: 1, progress: 0, status: 'pending', parallelizable: true },
    { id: 's4', label: 'Docs & polish', weight: 1, progress: 0, status: 'pending', parallelizable: true },
    { id: 's5', label: 'Verify build', weight: 1, progress: 0, status: 'pending' },
  ]

  const parallelGroups = decideParallelGroups(baseSubtasks)

  const model: TaskProgressModel = {
    taskId,
    title: 'Implement VISLZR Progress Ring Node',
    progress: 0,
    status: 'running',
    direction: 'cw',
    subtasks: baseSubtasks,
    parallelGroups,
    updatedAt: Date.now(),
  }

  useTaskProgressStore.getState().upsert(model)

  // Execute groups: treat each group as a stage. Within a group, run concurrently if >1.
  for (const group of parallelGroups) {
    // mark group running
    group.forEach((sid) => patchSubtask(taskId, sid, { status: 'running' }))
    // run concurrently
    await Promise.all(
      group.map(async (sid) => {
        for (let i = 0; i <= 20; i++) {
          patchSubtask(taskId, sid, { progress: i / 20 })
          patchOverall(taskId)
          await sleep(80 + Math.random() * 90)
        }
        patchSubtask(taskId, sid, { progress: 1, status: 'complete' })
        patchOverall(taskId)
      })
    )
  }

  useTaskProgressStore.getState().patch(taskId, { status: 'complete', progress: 1 })
}

function decideParallelGroups(subtasks: Subtask[]): string[][] {
  // heuristic:
  // - sequential stages unless marked parallelizable
  // - make a single parallel group out of all parallelizable tasks that have no deps
  const seq: string[] = []
  const par: string[] = []

  for (const s of subtasks) {
    if (s.parallelizable) par.push(s.id)
    else seq.push(s.id)
  }

  const groups: string[][] = []
  // first sequential until we hit first parallelizable candidate
  if (seq.length) {
    // keep first two as strict sequential to make the demo feel "moving around" the circle
    groups.push([seq[0]])
    if (seq[1]) groups.push([seq[1]])
  }
  if (par.length) groups.push(par)
  // remaining sequential (if any)
  const rest = seq.slice(2)
  for (const id of rest) groups.push([id])
  return groups
}

function patchSubtask(taskId: string, sid: string, patch: Partial<Subtask>) {
  const store = useTaskProgressStore.getState()
  const t = store.tasks[taskId]
  if (!t) return
  store.patch(taskId, {
    subtasks: t.subtasks.map((s) => (s.id === sid ? { ...s, ...patch } : s)),
  })
}

function patchOverall(taskId: string) {
  const store = useTaskProgressStore.getState()
  const t = store.tasks[taskId]
  if (!t) return

  const total = t.subtasks.reduce((acc, s) => acc + s.weight, 0) || 1
  const done = t.subtasks.reduce((acc, s) => acc + s.weight * s.progress, 0)
  store.patch(taskId, { progress: done / total })
}
