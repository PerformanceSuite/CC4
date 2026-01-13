import { create } from 'zustand'

export type TaskStatus = 'pending' | 'running' | 'blocked' | 'complete' | 'failed'

export type Subtask = {
  id: string
  label: string
  /** 0..1 */
  weight: number
  /** 0..1 */
  progress: number
  status: TaskStatus
  /** if true, this subtask can run in parallel with other parallelizable tasks */
  parallelizable?: boolean
}

export type TaskProgressModel = {
  taskId: string
  title: string
  /** 0..1 */
  progress: number
  status: TaskStatus
  direction: 'cw' | 'ccw'
  subtasks: Subtask[]
  /** the pipeline decision output: which subtasks are allowed to run in parallel */
  parallelGroups: string[][]
  updatedAt: number
}

type Store = {
  tasks: Record<string, TaskProgressModel>
  upsert: (model: TaskProgressModel) => void
  patch: (taskId: string, partial: Partial<TaskProgressModel>) => void
  reset: () => void
}

export const useTaskProgressStore = create<Store>((set) => ({
  tasks: {},
  upsert: (model) =>
    set((s) => ({
      tasks: {
        ...s.tasks,
        [model.taskId]: { ...model, updatedAt: Date.now() },
      },
    })),
  patch: (taskId, partial) =>
    set((s) => {
      const prev = s.tasks[taskId]
      if (!prev) return s
      return {
        tasks: {
          ...s.tasks,
          [taskId]: { ...prev, ...partial, updatedAt: Date.now() },
        },
      }
    }),
  reset: () => set({ tasks: {} }),
}))
