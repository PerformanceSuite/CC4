/**
 * Zustand store for Execution UI state.
 */

import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { tasksApi, agentsApi, Task, TaskMetadata, AgentSession, Persona, Subtask } from '../api/client';
import type { TaskStatus } from '../constants/task';

// Helper to generate UUID
const generateId = () => crypto.randomUUID();

interface ExecutionState {
  // Tasks - organized by Kanban columns
  tasks: {
    backlog: Task[];
    in_progress: Task[];
    ai_review: Task[];
    done: Task[];
    blocked: Task[];
  };
  isLoading: boolean;
  error: string | null;

  // Personas
  personas: Persona[];
  personasLoading: boolean;

  // Active agent sessions (supports multiple per task)
  activeSession: AgentSession | null;  // Primary session for backwards compat
  activeSessions: AgentSession[];  // All sessions for current task
  sessionOutputs: Record<string, string[]>;  // Output per session
  isAgentRunning: boolean;

  // Task detail drawer
  selectedTaskId: string | null;
  taskDetailOpen: boolean;

  // Actions
  fetchTasks: () => Promise<void>;
  fetchPersonas: () => Promise<void>;
  createTask: (title: string, description?: string, persona?: string, metadata?: TaskMetadata) => Promise<Task>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  updateTaskStatus: (id: string, newStatus: TaskStatus) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  runAgent: (taskId: string, task: string, persona?: string) => Promise<void>;
  stopAgent: (sessionId?: string) => Promise<void>;
  stopAllAgents: () => Promise<void>;
  clearSession: () => void;
  // Stuck detection
  checkTaskRunning: (taskId: string) => Promise<boolean>;
  recoverStuckTask: (taskId: string, autoRestart?: boolean) => Promise<{ success: boolean }>;

  // Task detail drawer actions
  openTaskDetail: (taskId: string) => void;
  closeTaskDetail: () => void;
  getSelectedTask: () => Task | null;

  // Subtask actions
  addSubtask: (taskId: string, title: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;

  // Review actions
  approveTask: (taskId: string, targetStatus?: TaskStatus) => Promise<void>;
  rejectTask: (taskId: string, reason?: string) => Promise<void>;

  // Archive actions
  archiveDoneTasks: () => Promise<{ archived_count: number }>;
}

export const useExecutionStore = create<ExecutionState>((set, get) => ({
  tasks: {
    backlog: [],
    in_progress: [],
    ai_review: [],
    done: [],
    blocked: [],
  },
  isLoading: false,
  error: null,
  personas: [],
  personasLoading: false,
  activeSession: null,
  activeSessions: [],
  sessionOutputs: {},
  isAgentRunning: false,
  selectedTaskId: null,
  taskDetailOpen: false,

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await tasksApi.list();
      // Normalize response - merge any human_review tasks into ai_review
      const normalized = {
        backlog: data.backlog || [],
        in_progress: data.in_progress || [],
        ai_review: [...(data.ai_review || []), ...(data.human_review || []), ...(data.review || [])],
        done: data.done || [],
        blocked: data.blocked || [],
      };
      set({ tasks: normalized, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  fetchPersonas: async () => {
    set({ personasLoading: true });
    try {
      const data = await agentsApi.listPersonas();
      set({ personas: data.personas, personasLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, personasLoading: false });
    }
  },

  createTask: async (title: string, description?: string, persona?: string, metadata?: TaskMetadata) => {
    try {
      const task = await tasksApi.create({ title, description, persona, metadata });
      // Refresh tasks
      await get().fetchTasks();
      return task;
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  updateTask: async (id: string, data: Partial<Task>) => {
    try {
      await tasksApi.update(id, data);
      // Refresh tasks
      await get().fetchTasks();
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  updateTaskStatus: async (id: string, newStatus: TaskStatus) => {
    // Optimistic update - move task locally first
    set((state) => {
      const allTasks = [
        ...state.tasks.backlog,
        ...state.tasks.in_progress,
        ...state.tasks.ai_review,
        ...state.tasks.done,
        ...state.tasks.blocked,
      ];
      const task = allTasks.find((t) => t.id === id);
      if (!task) return state;

      const oldStatus = task.status;
      const updatedTask = { ...task, status: newStatus };

      // Remove from old column, add to new column
      const newTasks = { ...state.tasks };
      newTasks[oldStatus] = newTasks[oldStatus].filter((t) => t.id !== id);
      newTasks[newStatus] = [...newTasks[newStatus], updatedTask];

      return { tasks: newTasks };
    });

    // Persist to backend
    try {
      await tasksApi.update(id, { status: newStatus });
    } catch (err) {
      // Revert on error
      set({ error: (err as Error).message });
      await get().fetchTasks();
    }
  },

  deleteTask: async (id: string) => {
    try {
      await tasksApi.delete(id);
      // Refresh tasks
      await get().fetchTasks();
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  runAgent: async (taskId: string, task: string, persona = 'backend-coder') => {
    set({ isAgentRunning: true, error: null });

    try {
      // Update task status to in_progress
      await tasksApi.update(taskId, { status: 'in_progress' });

      // Refresh tasks to reflect the status change
      await get().fetchTasks();

      // Start agent
      const result = await agentsApi.run({
        task,
        persona,
        task_id: taskId,
      });

      const newSession: AgentSession = {
        session_id: result.session_id,
        task_id: taskId,
        persona: result.persona,
        model: result.model,
        status: result.status,
        files_changed: [],
      };

      set((state) => ({
        activeSession: newSession,
        activeSessions: [...state.activeSessions, newSession],
        sessionOutputs: { ...state.sessionOutputs, [result.session_id]: [] },
      }));

      // Connect to SSE stream
      const eventSource = agentsApi.streamSession(result.session_id);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.line) {
            set((state) => ({
              sessionOutputs: {
                ...state.sessionOutputs,
                [result.session_id]: [
                  ...(state.sessionOutputs[result.session_id] || []),
                  data.line,
                ],
              },
            }));
          }

          if (data.done) {
            set((state) => ({
              activeSessions: state.activeSessions.map((s) =>
                s.session_id === result.session_id
                  ? {
                      ...s,
                      status: data.status,
                      files_changed: data.files_changed || [],
                      pr_url: data.pr_url,
                      error: data.error,
                    }
                  : s
              ),
              activeSession:
                state.activeSession?.session_id === result.session_id
                  ? {
                      ...state.activeSession,
                      status: data.status,
                      files_changed: data.files_changed || [],
                      pr_url: data.pr_url,
                      error: data.error,
                    }
                  : state.activeSession,
              isAgentRunning: state.activeSessions.some(
                (s) => s.session_id !== result.session_id && s.status === 'running'
              ),
            }));
            eventSource.close();

            // Update task status based on completion
            const newStatus: TaskStatus = data.status === 'completed' ? 'ai_review' : 'backlog';
            tasksApi.update(taskId, { status: newStatus }).then(() => {
              get().fetchTasks();
            });
          }
        } catch {
          // Ignore parse errors
        }
      };

      eventSource.onerror = () => {
        set((state) => ({
          isAgentRunning: state.activeSessions.some(
            (s) => s.session_id !== result.session_id && s.status === 'running'
          ),
        }));
        eventSource.close();
      };
    } catch (err) {
      set({ error: (err as Error).message, isAgentRunning: false });
    }
  },

  stopAgent: async (sessionId?: string) => {
    const session = sessionId
      ? get().activeSessions.find((s) => s.session_id === sessionId)
      : get().activeSession;
    if (!session) return;

    try {
      await agentsApi.stopSession(session.session_id);
      set((state) => ({
        activeSessions: state.activeSessions.map((s) =>
          s.session_id === session.session_id
            ? { ...s, status: 'failed', error: 'Stopped by user' }
            : s
        ),
        activeSession:
          state.activeSession?.session_id === session.session_id
            ? { ...state.activeSession, status: 'failed', error: 'Stopped by user' }
            : state.activeSession,
        isAgentRunning: state.activeSessions.some(
          (s) => s.session_id !== session.session_id && s.status === 'running'
        ),
      }));

      // Move task back to backlog when stopped
      if (session.task_id) {
        await tasksApi.update(session.task_id, { status: 'backlog' });
        get().fetchTasks();
      }
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  stopAllAgents: async () => {
    const sessions = get().activeSessions.filter((s) => s.status === 'running');
    await Promise.all(sessions.map((s) => get().stopAgent(s.session_id)));
  },

  clearSession: () => {
    set({ activeSession: null, activeSessions: [], sessionOutputs: {}, isAgentRunning: false });
  },

  checkTaskRunning: async (taskId: string) => {
    // Find any running session for this task
    const sessions = get().activeSessions.filter(
      (s) => s.task_id === taskId && s.status === 'running'
    );

    if (sessions.length === 0) {
      return false;
    }

    // Check if any session is actually running
    for (const session of sessions) {
      try {
        const result = await agentsApi.checkSessionRunning(session.session_id);
        if (result.is_running) {
          return true;
        }
      } catch {
        // Session might not exist anymore
      }
    }

    return false;
  },

  recoverStuckTask: async (taskId: string, autoRestart = false) => {
    // Find running sessions for this task
    const sessions = get().activeSessions.filter(
      (s) => s.task_id === taskId && s.status === 'running'
    );

    let success = false;

    for (const session of sessions) {
      try {
        const result = await agentsApi.recoverSession(session.session_id, autoRestart);
        if (result.success) {
          success = true;
          // Update local session state
          set((state) => ({
            activeSessions: state.activeSessions.map((s) =>
              s.session_id === session.session_id
                ? { ...s, status: 'failed', error: 'Recovered from stuck state' }
                : s
            ),
            isAgentRunning: state.activeSessions.some(
              (s) => s.session_id !== session.session_id && s.status === 'running'
            ),
          }));
        }
      } catch {
        // Continue trying other sessions
      }
    }

    // Move task back to backlog
    if (success) {
      await tasksApi.update(taskId, { status: 'backlog' });
      get().fetchTasks();
    }

    return { success };
  },

  // Task detail drawer actions
  openTaskDetail: (taskId: string) => {
    set({ selectedTaskId: taskId, taskDetailOpen: true });
  },

  closeTaskDetail: () => {
    set({ selectedTaskId: null, taskDetailOpen: false });
  },

  getSelectedTask: () => {
    const state = get();
    if (!state.selectedTaskId) return null;

    const allTasks = [
      ...state.tasks.backlog,
      ...state.tasks.in_progress,
      ...state.tasks.ai_review,
      ...state.tasks.done,
      ...state.tasks.blocked,
    ];
    return allTasks.find((t) => t.id === state.selectedTaskId) || null;
  },

  // Subtask actions
  addSubtask: async (taskId: string, title: string) => {
    const task = get().getSelectedTask();
    if (!task || task.id !== taskId) return;

    const newSubtask: Subtask = {
      id: generateId(),
      title,
      status: 'pending',
      createdAt: new Date().toISOString(),
      source: 'manual',
    };

    const currentSubtasks = task.metadata?.subtasks || [];
    const updatedMetadata: TaskMetadata = {
      ...task.metadata,
      subtasks: [...currentSubtasks, newSubtask],
    };

    await tasksApi.update(taskId, { metadata: updatedMetadata });
    await get().fetchTasks();
  },

  toggleSubtask: async (taskId: string, subtaskId: string) => {
    const task = get().getSelectedTask();
    if (!task || task.id !== taskId) return;

    const currentSubtasks = task.metadata?.subtasks || [];
    const updatedSubtasks = currentSubtasks.map((s) => {
      if (s.id !== subtaskId) return s;
      const newStatus = s.status === 'completed' ? 'pending' : 'completed';
      return {
        ...s,
        status: newStatus as Subtask['status'],
        completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
      };
    });

    const updatedMetadata: TaskMetadata = {
      ...task.metadata,
      subtasks: updatedSubtasks,
    };

    await tasksApi.update(taskId, { metadata: updatedMetadata });
    await get().fetchTasks();
  },

  deleteSubtask: async (taskId: string, subtaskId: string) => {
    const task = get().getSelectedTask();
    if (!task || task.id !== taskId) return;

    const currentSubtasks = task.metadata?.subtasks || [];
    const updatedSubtasks = currentSubtasks.filter((s) => s.id !== subtaskId);

    const updatedMetadata: TaskMetadata = {
      ...task.metadata,
      subtasks: updatedSubtasks,
    };

    await tasksApi.update(taskId, { metadata: updatedMetadata });
    await get().fetchTasks();
  },

  // Review actions
  approveTask: async (taskId: string, targetStatus?: TaskStatus) => {
    const task = get().getSelectedTask();
    if (!task || task.id !== taskId) return;

    // Determine target status based on current status
    let newStatus: TaskStatus;
    if (targetStatus) {
      newStatus = targetStatus;
    } else {
      // All reviews now go directly to done
      newStatus = 'done';
    }

    const updatedMetadata: TaskMetadata = {
      ...task.metadata,
      reviewedAt: new Date().toISOString(),
      reviewFeedback: undefined, // Clear any previous rejection feedback
    };

    await tasksApi.update(taskId, { status: newStatus, metadata: updatedMetadata });
    await get().fetchTasks();
  },

  rejectTask: async (taskId: string, reason?: string) => {
    const task = get().getSelectedTask();
    if (!task || task.id !== taskId) return;

    const updatedMetadata: TaskMetadata = {
      ...task.metadata,
      reviewedAt: new Date().toISOString(),
      reviewFeedback: reason,
    };

    await tasksApi.update(taskId, { status: 'backlog', metadata: updatedMetadata });
    await get().fetchTasks();
  },

  // Archive actions
  archiveDoneTasks: async () => {
    const state = get();
    const doneTasks = state.tasks.done.filter((t) => !t.metadata?.archivedAt);

    if (doneTasks.length === 0) {
      return { archived_count: 0 };
    }

    const taskIds = doneTasks.map((t) => t.id);
    const result = await tasksApi.archive(taskIds);

    // Refresh tasks to reflect changes
    await get().fetchTasks();

    return result;
  },
}));

// ============================================================================
// Memoized Selectors - Use these for better performance
// ============================================================================

/**
 * Selector for tasks only - prevents re-renders when unrelated state changes
 */
export const useTasksOnly = () =>
  useExecutionStore(useShallow((state) => state.tasks));

/**
 * Selector for a specific column's tasks
 */
export const useColumnTasks = (status: TaskStatus) =>
  useExecutionStore((state) => state.tasks[status]);

/**
 * Selector for active sessions only
 */
export const useActiveSessions = () =>
  useExecutionStore(useShallow((state) => state.activeSessions));

/**
 * Selector for checking if any agent is running
 */
export const useIsAgentRunning = () =>
  useExecutionStore((state) => state.isAgentRunning);

/**
 * Selector for task detail drawer state
 */
export const useTaskDetailState = () =>
  useExecutionStore(
    useShallow((state) => ({
      selectedTaskId: state.selectedTaskId,
      taskDetailOpen: state.taskDetailOpen,
    }))
  );

/**
 * Selector for loading state
 */
export const useTasksLoading = () =>
  useExecutionStore((state) => state.isLoading);

/**
 * Selector for error state
 */
export const useTasksError = () =>
  useExecutionStore((state) => state.error);

/**
 * Selector for personas
 */
export const usePersonas = () =>
  useExecutionStore(useShallow((state) => state.personas));

/**
 * Selector for task actions only
 */
export const useTaskActions = () =>
  useExecutionStore(
    useShallow((state) => ({
      fetchTasks: state.fetchTasks,
      createTask: state.createTask,
      updateTask: state.updateTask,
      updateTaskStatus: state.updateTaskStatus,
      deleteTask: state.deleteTask,
    }))
  );

/**
 * Selector for agent actions only
 */
export const useAgentActions = () =>
  useExecutionStore(
    useShallow((state) => ({
      runAgent: state.runAgent,
      stopAgent: state.stopAgent,
      stopAllAgents: state.stopAllAgents,
      clearSession: state.clearSession,
      checkTaskRunning: state.checkTaskRunning,
      recoverStuckTask: state.recoverStuckTask,
    }))
  );

/**
 * Selector for task detail actions
 */
export const useTaskDetailActions = () =>
  useExecutionStore(
    useShallow((state) => ({
      openTaskDetail: state.openTaskDetail,
      closeTaskDetail: state.closeTaskDetail,
      getSelectedTask: state.getSelectedTask,
      addSubtask: state.addSubtask,
      toggleSubtask: state.toggleSubtask,
      deleteSubtask: state.deleteSubtask,
      approveTask: state.approveTask,
      rejectTask: state.rejectTask,
    }))
  );
