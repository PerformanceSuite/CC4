import { useState, useEffect, useRef, useCallback, memo } from 'react';
import {
  Play,
  Square,
  GitBranch,
  MoreVertical,
  Loader2,
  Pencil,
  Copy,
  Trash2,
  Clock,
  AlertTriangle,
  RotateCcw,
  ListChecks,
  CheckSquare,
  Square as SquareIcon,
  TestTube2,
  FileSearch,
  Info,
} from 'lucide-react';
import { Task } from '../../api/client';
import { useExecutionStore } from '../../stores/executionStore';
import {
  EXECUTION_PHASE_LABELS,
  EXECUTION_PHASE_COLORS,
  TASK_CATEGORY_LABELS,
  TASK_CATEGORY_COLORS,
  type TaskCategory,
} from '../../constants/task';

interface TaskCardProps {
  task: Task;
  isRunning: boolean;
  compact?: boolean;
  selectable?: boolean;
  isSelected?: boolean;
  onSelect: () => void;
  onRun: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onViewDetails?: () => void;
  onToggleSelect?: () => void;
  onTest?: () => void;
  onReview?: () => void;
  onRefresh?: () => void;
}

// Deep equality check for Task objects
function taskEqual(prevTask: Task, nextTask: Task): boolean {
  return (
    prevTask.id === nextTask.id &&
    prevTask.title === nextTask.title &&
    prevTask.description === nextTask.description &&
    prevTask.status === nextTask.status &&
    prevTask.branch === nextTask.branch &&
    prevTask.updated_at === nextTask.updated_at &&
    prevTask.persona === nextTask.persona &&
    prevTask.executionProgress?.phase === nextTask.executionProgress?.phase &&
    prevTask.executionProgress?.subtasksCompleted === nextTask.executionProgress?.subtasksCompleted &&
    prevTask.executionProgress?.subtasksTotal === nextTask.executionProgress?.subtasksTotal &&
    prevTask.metadata?.category === nextTask.metadata?.category &&
    prevTask.metadata?.priority === nextTask.metadata?.priority
  );
}

// Props equality check for TaskCard
function taskCardPropsEqual(
  prev: TaskCardProps,
  next: TaskCardProps
): boolean {
  return (
    taskEqual(prev.task, next.task) &&
    prev.isRunning === next.isRunning &&
    prev.compact === next.compact &&
    prev.selectable === next.selectable &&
    prev.isSelected === next.isSelected &&
    prev.onSelect === next.onSelect &&
    prev.onRun === next.onRun &&
    prev.onEdit === next.onEdit &&
    prev.onDelete === next.onDelete &&
    prev.onDuplicate === next.onDuplicate &&
    prev.onViewDetails === next.onViewDetails &&
    prev.onToggleSelect === next.onToggleSelect &&
    prev.onTest === next.onTest &&
    prev.onReview === next.onReview &&
    prev.onRefresh === next.onRefresh
  );
}

export const TaskCard = memo(function TaskCard({
  task,
  isRunning,
  compact = false,
  selectable = false,
  isSelected = false,
  onSelect,
  onRun,
  onEdit,
  onDelete,
  onDuplicate,
  onViewDetails,
  onToggleSelect,
  onTest,
  onReview,
  onRefresh,
}: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isStuck, setIsStuck] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const stuckCheckRef = useRef<{
    timeout: ReturnType<typeof setTimeout> | null;
    interval: ReturnType<typeof setInterval> | null;
  }>({ timeout: null, interval: null });

  const { checkTaskRunning, recoverStuckTask, runAgent } = useExecutionStore();

  const executionPhase = task.executionProgress?.phase;
  const hasActiveExecution =
    executionPhase &&
    executionPhase !== 'idle' &&
    executionPhase !== 'complete' &&
    executionPhase !== 'failed';

  // Subtask progress
  const subtasksCompleted = task.executionProgress?.subtasksCompleted ?? 0;
  const subtasksTotal = task.executionProgress?.subtasksTotal ?? 0;
  const hasSubtasks = subtasksTotal > 0;
  const subtaskProgress = hasSubtasks ? Math.round((subtasksCompleted / subtasksTotal) * 100) : 0;

  // Stuck check callback
  const performStuckCheck = useCallback(async () => {
    if (!isRunning) return;
    const actuallyRunning = await checkTaskRunning(task.id);
    setIsStuck(!actuallyRunning);
  }, [task.id, isRunning, checkTaskRunning]);

  // Stuck detection polling
  useEffect(() => {
    if (!isRunning) {
      setIsStuck(false);
      if (stuckCheckRef.current.timeout) {
        clearTimeout(stuckCheckRef.current.timeout);
        stuckCheckRef.current.timeout = null;
      }
      if (stuckCheckRef.current.interval) {
        clearInterval(stuckCheckRef.current.interval);
        stuckCheckRef.current.interval = null;
      }
      return;
    }

    // Initial check after 5s grace period
    stuckCheckRef.current.timeout = setTimeout(performStuckCheck, 5000);

    // Periodic re-check every 30 seconds
    stuckCheckRef.current.interval = setInterval(performStuckCheck, 30000);

    return () => {
      if (stuckCheckRef.current.timeout) {
        clearTimeout(stuckCheckRef.current.timeout);
      }
      if (stuckCheckRef.current.interval) {
        clearInterval(stuckCheckRef.current.interval);
      }
    };
  }, [isRunning, performStuckCheck]);

  // Re-check on visibility change
  useEffect(() => {
    let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isRunning) {
        if (debounceTimeout) clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(performStuckCheck, 500);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (debounceTimeout) clearTimeout(debounceTimeout);
    };
  }, [isRunning, performStuckCheck]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  const handleRunClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRun();
  };

  const handleStopClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement stop through store
  };

  const handleRefreshClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onRefresh || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRecoverClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRecovering(true);
    const result = await recoverStuckTask(task.id, true);
    if (result.success) {
      setIsStuck(false);
      // Auto-restart the task
      const taskPrompt = task.description
        ? `${task.title}\n\n${task.description}`
        : task.title;
      await runAgent(task.id, taskPrompt, task.persona);
    }
    setIsRecovering(false);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleMenuAction = (action: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    action();
  };

  // Format relative time
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Compact mode: title only with status icon
  if (compact) {
    return (
      <div
        onClick={onSelect}
        className={`bg-cc-bg border rounded-lg px-3 py-2 cursor-pointer transition-all ${
          isStuck
            ? 'border-orange-500 ring-1 ring-orange-500/30'
            : isRunning
              ? 'border-cc-accent ring-1 ring-cc-accent/30 animate-pulse'
              : 'border-cc-border hover:border-cc-accent'
        }`}
      >
        <div className="flex items-center gap-2">
          {isStuck ? (
            <AlertTriangle className="w-3 h-3 text-orange-500 flex-shrink-0" />
          ) : isRunning ? (
            <Loader2 className="w-3 h-3 text-cc-accent animate-spin flex-shrink-0" />
          ) : (
            <div className="w-3 h-3 flex-shrink-0" /> // Spacer for alignment
          )}
          <p className="text-sm text-white font-medium truncate flex-1">{task.title}</p>
          {/* Minimal actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {isStuck ? (
              <button
                onClick={handleRecoverClick}
                disabled={isRecovering}
                className="p-1 rounded text-orange-400 hover:bg-orange-500/20"
                title="Recover task"
              >
                {isRecovering ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RotateCcw className="w-3 h-3" />
                )}
              </button>
            ) : isRunning ? (
              <button
                onClick={handleStopClick}
                className="p-1 rounded hover:bg-red-500/20 text-red-400"
                title="Stop"
              >
                <Square className="w-3 h-3" />
              </button>
            ) : (
              <button
                onClick={handleRunClick}
                className="p-1 rounded hover:bg-cc-border text-cc-accent"
                title="Run"
              >
                <Play className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={`bg-cc-bg border rounded-lg p-3 cursor-pointer transition-all ${
        isStuck
          ? 'border-orange-500 ring-1 ring-orange-500/30'
          : isRunning
            ? 'border-cc-accent ring-1 ring-cc-accent/30 animate-pulse'
            : 'border-cc-border hover:border-cc-accent'
      }`}
    >
      {/* Title */}
      <div className="flex items-center gap-2 mb-2">
        {isStuck ? (
          <AlertTriangle className="w-3 h-3 text-orange-500 flex-shrink-0" />
        ) : isRunning ? (
          <Loader2 className="w-3 h-3 text-cc-accent animate-spin flex-shrink-0" />
        ) : null}
        <p className="text-sm text-white font-medium line-clamp-2">{task.title}</p>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Badges row */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {/* Stuck indicator - highest priority */}
        {isStuck && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border bg-orange-500/20 text-orange-400 border-orange-500/30">
            <AlertTriangle className="w-2.5 h-2.5" />
            Stuck
          </span>
        )}

        {/* Execution phase badge - shown when actively running and not stuck */}
        {!isStuck && hasActiveExecution && executionPhase && (
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${EXECUTION_PHASE_COLORS[executionPhase]}`}
          >
            <Loader2 className="w-2.5 h-2.5 animate-spin" />
            {EXECUTION_PHASE_LABELS[executionPhase]}
          </span>
        )}

        {/* Subtask progress indicator */}
        {hasSubtasks && (
          <span className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium border bg-cc-surface border-cc-border">
            <ListChecks className="w-2.5 h-2.5 text-cc-accent" />
            <span className="text-gray-300">
              {subtasksCompleted}/{subtasksTotal}
            </span>
            {/* Mini progress bar */}
            <div className="w-8 h-1 bg-cc-border rounded-full overflow-hidden">
              <div
                className="h-full bg-cc-accent transition-all duration-300"
                style={{ width: `${subtaskProgress}%` }}
              />
            </div>
          </span>
        )}

        {/* Category badge */}
        {task.metadata?.category && (
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${TASK_CATEGORY_COLORS[task.metadata.category as TaskCategory]}`}
          >
            {TASK_CATEGORY_LABELS[task.metadata.category as TaskCategory]}
          </span>
        )}

        {/* Priority badge - only show high/urgent */}
        {task.metadata?.priority &&
          (task.metadata.priority === 'high' || task.metadata.priority === 'urgent') && (
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                task.metadata.priority === 'urgent'
                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                  : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
              }`}
            >
              {task.metadata.priority === 'urgent' ? 'Urgent' : 'High Priority'}
            </span>
          )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Branch */}
          {task.branch && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <GitBranch className="w-3 h-3" />
              <span className="truncate max-w-[100px]">{task.branch}</span>
            </div>
          )}
          {/* Time */}
          {task.updated_at && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{formatRelativeTime(task.updated_at)}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 relative" ref={menuRef}>
          {/* Selection checkbox for done tasks */}
          {selectable && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect?.();
              }}
              className="p-1 rounded hover:bg-cc-border"
              title={isSelected ? 'Deselect' : 'Select for batch action'}
            >
              {isSelected ? (
                <CheckSquare className="w-4 h-4 text-cc-accent" />
              ) : (
                <SquareIcon className="w-4 h-4 text-gray-500" />
              )}
            </button>
          )}

          {/* Done tasks: show test/review buttons */}
          {task.status === 'done' ? (
            <>
              {onTest && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTest();
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                  title="Test feature"
                >
                  <TestTube2 className="w-3 h-3" />
                  Test
                </button>
              )}
              {onReview && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReview();
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                  title="Review & create PR"
                >
                  <FileSearch className="w-3 h-3" />
                  Review
                </button>
              )}
            </>
          ) : isStuck ? (
            <button
              onClick={handleRecoverClick}
              disabled={isRecovering}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors"
              title="Recover and restart task"
            >
              {isRecovering ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RotateCcw className="w-3 h-3" />
              )}
              {isRecovering ? 'Recovering...' : 'Recover'}
            </button>
          ) : isRunning ? (
            <button
              onClick={handleStopClick}
              className="p-1 rounded hover:bg-red-500/20 text-red-400"
              title="Stop agent"
            >
              <Square className="w-3 h-3" />
            </button>
          ) : (
            <>
              {onRefresh && (
                <button
                  onClick={handleRefreshClick}
                  disabled={isRefreshing}
                  className="p-1 rounded hover:bg-cc-border text-gray-400 hover:text-white"
                  title="Re-analyze task and reassign agent"
                >
                  {isRefreshing ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <RotateCcw className="w-3 h-3" />
                  )}
                </button>
              )}
              <button
                onClick={handleRunClick}
                className="p-1 rounded hover:bg-cc-border text-cc-accent"
                title="Run agent on this task"
              >
                <Play className="w-3 h-3" />
              </button>
            </>
          )}
          <button onClick={handleMenuClick} className="p-1 hover:bg-cc-border rounded">
            <MoreVertical className="w-3 h-3 text-gray-500" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <TaskCardMenu
              onDetails={onViewDetails ? handleMenuAction(onViewDetails) : undefined}
              onEdit={handleMenuAction(onEdit)}
              onDuplicate={handleMenuAction(onDuplicate)}
              onDelete={handleMenuAction(onDelete)}
            />
          )}
        </div>
      </div>
    </div>
  );
}, taskCardPropsEqual);

interface TaskCardMenuProps {
  onDetails?: (e: React.MouseEvent) => void;
  onEdit: (e: React.MouseEvent) => void;
  onDuplicate: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

const TaskCardMenu = memo(function TaskCardMenu({ onDetails, onEdit, onDuplicate, onDelete }: TaskCardMenuProps) {
  return (
    <div className="absolute right-0 top-full mt-1 w-40 bg-cc-surface border border-cc-border rounded-lg shadow-lg z-10">
      {onDetails && (
        <button
          onClick={onDetails}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-cc-border transition-colors rounded-t-lg"
        >
          <Info className="w-3 h-3" />
          Details
        </button>
      )}
      <button
        onClick={onEdit}
        className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-cc-border transition-colors ${!onDetails ? 'rounded-t-lg' : ''}`}
      >
        <Pencil className="w-3 h-3" />
        Edit Task
      </button>
      <button
        onClick={onDuplicate}
        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-cc-border transition-colors"
      >
        <Copy className="w-3 h-3" />
        Duplicate
      </button>
      <div className="border-t border-cc-border" />
      <button
        onClick={onDelete}
        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-cc-border transition-colors rounded-b-lg"
      >
        <Trash2 className="w-3 h-3" />
        Delete Task
      </button>
    </div>
  );
});
