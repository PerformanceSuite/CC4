import { useEffect, useState, useMemo, memo, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Loader2, Plus, Inbox, Eye, CheckCircle2, Archive, RefreshCw, LayoutGrid, LayoutList, ChevronLeft, ChevronRight, GripVertical, GitMerge, Trash2, ArrowRight, Check } from 'lucide-react';
import { useExecutionStore } from '../../stores/executionStore';
import { Task } from '../../api/client';
import { TaskCard } from './TaskCard';
import {
  TASK_STATUS_COLUMNS,
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  type TaskStatus,
} from '../../constants/task';
import {
  type ViewMode,
  type KanbanPreferences,
  loadPreferences,
  savePreferences,
  setViewMode,
  isColumnCollapsed,
  toggleColumnCollapsed,
  getColumnWidth,
  setColumnWidth,
  MIN_COLUMN_WIDTH,
  MAX_COLUMN_WIDTH,
} from '../../utils/kanbanPreferences';

interface KanbanProps {
  onSelectTask: (task: Task) => void;
  onRunAgent: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onViewDetails?: (task: Task) => void;
  onNewTask?: () => void;
  onTestTask?: (task: Task) => void;
  onReviewTask?: (task: Task) => void;
  onBatchMerge?: (tasks: Task[]) => void;
  onRefreshTask?: (task: Task) => void;
}

// Empty state content for each column
function getEmptyStateContent(status: TaskStatus) {
  switch (status) {
    case 'backlog':
      return { icon: Inbox, message: 'No tasks', hint: 'Click + to add a task' };
    case 'in_progress':
      return { icon: Loader2, message: 'No active tasks', hint: 'Start a task to begin' };
    case 'ai_review':
      return { icon: Eye, message: 'No tasks in review', hint: 'Approve or request changes' };
    case 'done':
      return { icon: CheckCircle2, message: 'No completed tasks', hint: 'Finished tasks appear here' };
    default:
      return { icon: Inbox, message: 'No tasks' };
  }
}

// Sortable task card wrapper
interface SortableTaskCardProps {
  task: Task;
  isRunning: boolean;
  viewMode: ViewMode;
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

const SortableTaskCard = memo(function SortableTaskCard({
  task,
  isRunning,
  viewMode,
  selectable,
  isSelected,
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
}: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = useMemo(() => ({
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }), [transform, transition, isDragging]);

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard
        task={task}
        isRunning={isRunning}
        compact={viewMode === 'vertical'}
        selectable={selectable}
        isSelected={isSelected}
        onSelect={onSelect}
        onRun={onRun}
        onEdit={onEdit}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onViewDetails={onViewDetails}
        onToggleSelect={onToggleSelect}
        onTest={onTest}
        onReview={onReview}
        onRefresh={onRefresh}
      />
    </div>
  );
});

// Droppable column component
interface DroppableColumnProps {
  status: TaskStatus;
  tasks: Task[];
  isTaskRunning: (taskId: string) => boolean;
  isOver: boolean;
  viewMode: ViewMode;
  isCollapsed: boolean;
  columnWidth: number;
  selectedTasks: Set<string>;
  onSelectTask: (task: Task) => void;
  onRunAgent: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onViewDetails?: (task: Task) => void;
  onDuplicateTask: (task: Task) => void;
  onToggleSelectTask: (task: Task) => void;
  onSelectAllInColumn: (tasks: Task[]) => void;
  onDeselectAllInColumn: (tasks: Task[]) => void;
  onBulkDelete: (tasks: Task[]) => void;
  onBulkMove: (tasks: Task[], targetStatus: TaskStatus) => void;
  onTestTask?: (task: Task) => void;
  onReviewTask?: (task: Task) => void;
  onRefreshTask?: (task: Task) => void;
  onAddClick?: () => void;
  onArchiveAll?: () => void;
  onBatchMerge?: () => void;
  onToggleCollapse: () => void;
  onResize: (width: number) => void;
}

const DroppableColumn = memo(function DroppableColumn({
  status,
  tasks,
  isTaskRunning,
  isOver,
  viewMode,
  isCollapsed,
  columnWidth,
  selectedTasks,
  onSelectTask,
  onRunAgent,
  onEditTask,
  onDeleteTask,
  onViewDetails,
  onDuplicateTask,
  onToggleSelectTask,
  onSelectAllInColumn,
  onDeselectAllInColumn,
  onBulkDelete,
  onBulkMove,
  onTestTask,
  onReviewTask,
  onRefreshTask,
  onAddClick,
  onArchiveAll,
  onBatchMerge,
  onToggleCollapse,
  onResize,
}: DroppableColumnProps) {
  const { setNodeRef } = useDroppable({ id: status });
  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);
  const emptyState = getEmptyStateContent(status);
  const EmptyIcon = emptyState.icon;
  const colorClass = TASK_STATUS_COLORS[status];
  const [isResizing, setIsResizing] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  // Count selected tasks in this column
  const selectedInColumn = useMemo(() =>
    tasks.filter(t => selectedTasks.has(t.id)),
    [tasks, selectedTasks]
  );
  const allSelectedInColumn = selectedInColumn.length === tasks.length && tasks.length > 0;
  const someSelectedInColumn = selectedInColumn.length > 0;

  // Get other columns for move menu
  const otherColumns = TASK_STATUS_COLUMNS.filter(s => s !== status);

  // Handle resize drag
  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startWidth = columnWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(MIN_COLUMN_WIDTH, Math.min(MAX_COLUMN_WIDTH, startWidth + deltaX));
      onResize(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [columnWidth, onResize]);

  // Collapsed column view (horizontal mode only)
  if (isCollapsed && viewMode === 'horizontal') {
    return (
      <div
        ref={setNodeRef}
        className={`flex-shrink-0 w-12 bg-cc-surface rounded-lg border border-cc-border transition-all cursor-pointer hover:bg-cc-border/50 ${
          isOver ? 'ring-2 ring-cc-accent/50 border-cc-accent' : ''
        }`}
        onClick={onToggleCollapse}
      >
        <div className={`border-t-2 ${colorClass} rounded-t-lg h-full flex flex-col items-center py-3`}>
          <ChevronRight className="w-4 h-4 text-gray-400 mb-2" />
          <span className="text-xs text-gray-500 bg-cc-border px-1.5 py-0.5 rounded mb-2">
            {tasks.length}
          </span>
          <span
            className={`font-medium text-xs ${colorClass.split(' ')[0]} writing-mode-vertical`}
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)' }}
          >
            {TASK_STATUS_LABELS[status]}
          </span>
        </div>
      </div>
    );
  }

  // Column styling based on view mode
  const columnStyle = viewMode === 'horizontal' ? { width: `${columnWidth}px`, flexShrink: 0 } : {};
  const columnClassName = viewMode === 'vertical'
    ? `w-full bg-cc-surface rounded-lg border border-cc-border transition-all ${
        isOver ? 'ring-2 ring-cc-accent/50 border-cc-accent' : ''
      }`
    : `bg-cc-surface rounded-lg border border-cc-border transition-all relative ${
        isOver ? 'ring-2 ring-cc-accent/50 border-cc-accent' : ''
      }`;

  return (
    <div ref={setNodeRef} className={columnClassName} style={columnStyle}>
      {/* Column header with colored top border */}
      <div className={`border-t-2 ${colorClass} rounded-t-lg`}>
        <div className="flex items-center justify-between p-3 gap-2 overflow-hidden">
          <div className="flex items-center gap-2 min-w-0 flex-shrink">
            {/* Select all checkbox */}
            {tasks.length > 0 && (
              <button
                onClick={() => allSelectedInColumn ? onDeselectAllInColumn(tasks) : onSelectAllInColumn(tasks)}
                className={`p-1 rounded transition-colors flex-shrink-0 ${
                  allSelectedInColumn
                    ? 'bg-cc-accent text-white'
                    : someSelectedInColumn
                    ? 'bg-cc-accent/50 text-white'
                    : 'hover:bg-cc-border text-gray-400 hover:text-white'
                }`}
                title={allSelectedInColumn ? 'Deselect all' : 'Select all'}
              >
                <Check className="w-4 h-4" />
              </button>
            )}
            <h3 className={`font-medium text-sm ${colorClass.split(' ')[0]} truncate`}>
              {TASK_STATUS_LABELS[status]}
            </h3>
            <span className="text-xs text-gray-500 bg-cc-border px-1.5 py-0.5 rounded flex-shrink-0">
              {tasks.length}
            </span>
            {someSelectedInColumn && (
              <span className="text-xs text-cc-accent flex-shrink-0 whitespace-nowrap">
                ({selectedInColumn.length})
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Bulk actions when tasks are selected */}
            {someSelectedInColumn && (
              <>
                {/* Move dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowMoveMenu(!showMoveMenu)}
                    className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                    title="Move selected tasks"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  {showMoveMenu && (
                    <div className="absolute top-full right-0 mt-1 bg-cc-surface border border-cc-border rounded-lg shadow-lg z-50 py-1 min-w-[140px]">
                      {otherColumns.map(targetStatus => (
                        <button
                          key={targetStatus}
                          onClick={() => {
                            onBulkMove(selectedInColumn, targetStatus);
                            setShowMoveMenu(false);
                          }}
                          className="w-full px-3 py-1.5 text-left text-sm text-gray-300 hover:bg-cc-border transition-colors"
                        >
                          {TASK_STATUS_LABELS[targetStatus]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Delete button */}
                <button
                  onClick={() => onBulkDelete(selectedInColumn)}
                  className="p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                  title="Delete selected tasks"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            {status === 'backlog' && onAddClick && (
              <button
                onClick={onAddClick}
                className="p-1 hover:bg-cc-border rounded text-gray-400 hover:text-white transition-colors"
                title="Add new task"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
            {status === 'done' && (
              <>
                {selectedInColumn.length > 0 && onBatchMerge && (
                  <button
                    onClick={onBatchMerge}
                    className="p-1.5 text-green-400 hover:bg-green-500/20 rounded transition-colors"
                    title={`Merge ${selectedInColumn.length} selected tasks`}
                  >
                    <GitMerge className="w-4 h-4" />
                  </button>
                )}
                {onArchiveAll && tasks.length > 0 && (
                  <button
                    onClick={onArchiveAll}
                    className="p-1 hover:bg-cc-border rounded text-gray-400 hover:text-white transition-colors"
                    title="Archive all done tasks"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
            {/* Collapse button - moved to right */}
            {viewMode === 'horizontal' && (
              <button
                onClick={onToggleCollapse}
                className="p-1 hover:bg-cc-border rounded text-gray-400 hover:text-white transition-colors"
                title="Collapse column"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Task list */}
      <div className="p-3 pt-0 min-h-[120px]">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div
                className={`flex flex-col items-center justify-center py-8 text-center ${
                  isOver ? 'bg-cc-accent/10 rounded-lg border-2 border-dashed border-cc-accent' : ''
                }`}
              >
                {isOver ? (
                  <>
                    <Plus className="w-6 h-6 text-cc-accent mb-2" />
                    <span className="text-sm text-cc-accent">Drop here</span>
                  </>
                ) : (
                  <>
                    <EmptyIcon className="w-6 h-6 text-gray-600 mb-2" />
                    <span className="text-sm text-gray-500">{emptyState.message}</span>
                    {emptyState.hint && (
                      <span className="text-xs text-gray-600 mt-1">{emptyState.hint}</span>
                    )}
                  </>
                )}
              </div>
            ) : (
              tasks.map((task) => (
                <SortableTaskCard
                  key={task.id}
                  task={task}
                  isRunning={isTaskRunning(task.id)}
                  viewMode={viewMode}
                  selectable={true}
                  isSelected={selectedTasks.has(task.id)}
                  onSelect={() => onSelectTask(task)}
                  onRun={() => onRunAgent(task)}
                  onEdit={() => onEditTask(task)}
                  onDelete={() => onDeleteTask(task)}
                  onDuplicate={() => onDuplicateTask(task)}
                  onViewDetails={onViewDetails ? () => onViewDetails(task) : undefined}
                  onToggleSelect={() => onToggleSelectTask(task)}
                  onTest={onTestTask ? () => onTestTask(task) : undefined}
                  onReview={onReviewTask ? () => onReviewTask(task) : undefined}
                  onRefresh={onRefreshTask ? () => onRefreshTask(task) : undefined}
                />
              ))
            )}
          </div>
        </SortableContext>
      </div>

      {/* Resize handle (horizontal mode only) */}
      {viewMode === 'horizontal' && (
        <div
          className={`absolute top-0 right-0 w-2 h-full cursor-col-resize hover:bg-cc-accent/30 transition-colors flex items-center justify-center group ${
            isResizing ? 'bg-cc-accent/50' : ''
          }`}
          onMouseDown={handleResizeMouseDown}
        >
          <GripVertical className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
    </div>
  );
});

export default function Kanban({
  onSelectTask,
  onRunAgent,
  onEditTask,
  onDeleteTask,
  onViewDetails,
  onNewTask,
  onTestTask,
  onReviewTask,
  onBatchMerge,
  onRefreshTask,
}: KanbanProps) {
  const { tasks, isLoading, error, fetchTasks, createTask, updateTaskStatus, deleteTask, activeSessions, archiveDoneTasks } =
    useExecutionStore();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [overColumnId, setOverColumnId] = useState<TaskStatus | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [preferences, setPreferences] = useState<KanbanPreferences>(() => loadPreferences());
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

  // Handle toggling task selection
  const handleToggleSelectTask = useCallback((task: Task) => {
    setSelectedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(task.id)) {
        next.delete(task.id);
      } else {
        next.add(task.id);
      }
      return next;
    });
  }, []);

  // Handle batch merge
  const handleBatchMerge = useCallback(() => {
    const selectedTasksList = tasks.done.filter((t) => selectedTasks.has(t.id));
    if (selectedTasksList.length > 0 && onBatchMerge) {
      onBatchMerge(selectedTasksList);
      setSelectedTasks(new Set());
    }
  }, [tasks.done, selectedTasks, onBatchMerge]);

  // Handle select all in column
  const handleSelectAllInColumn = useCallback((columnTasks: Task[]) => {
    setSelectedTasks((prev) => {
      const next = new Set(prev);
      columnTasks.forEach((t) => next.add(t.id));
      return next;
    });
  }, []);

  // Handle deselect all in column
  const handleDeselectAllInColumn = useCallback((columnTasks: Task[]) => {
    setSelectedTasks((prev) => {
      const next = new Set(prev);
      columnTasks.forEach((t) => next.delete(t.id));
      return next;
    });
  }, []);

  // Handle bulk delete - uses store directly to actually delete tasks
  const handleBulkDelete = useCallback(async (tasksToDelete: Task[]) => {
    if (tasksToDelete.length === 0) return;

    const confirmed = window.confirm(`Delete ${tasksToDelete.length} task${tasksToDelete.length > 1 ? 's' : ''}?`);
    if (!confirmed) return;

    for (const task of tasksToDelete) {
      await deleteTask(task.id);
    }
    setSelectedTasks(new Set());
  }, [deleteTask]);

  // Handle bulk move
  const handleBulkMove = useCallback(async (tasksToMove: Task[], targetStatus: TaskStatus) => {
    for (const task of tasksToMove) {
      await updateTaskStatus(task.id, targetStatus);
    }
    setSelectedTasks(new Set());
  }, [updateTaskStatus]);

  // Handle view mode toggle
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    const newPrefs = setViewMode(preferences, mode);
    setPreferences(newPrefs);
    savePreferences(newPrefs);
  }, [preferences]);

  // Handle column collapse toggle
  const handleToggleCollapse = useCallback((status: TaskStatus) => {
    const newPrefs = toggleColumnCollapsed(preferences, status);
    setPreferences(newPrefs);
    savePreferences(newPrefs);
  }, [preferences]);

  // Handle column resize
  const handleColumnResize = useCallback((status: TaskStatus, width: number) => {
    const newPrefs = setColumnWidth(preferences, status, width);
    setPreferences(newPrefs);
    savePreferences(newPrefs);
  }, [preferences]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Check if a task has a running agent - memoized
  const isTaskRunning = useCallback(
    (taskId: string) =>
      activeSessions.some(
        (s) => s.task_id === taskId && (s.status === 'running' || s.status === 'pending')
      ),
    [activeSessions]
  );

  // Get all tasks as a flat array for finding by ID
  const allTasks = useMemo(
    () => [
      ...tasks.backlog,
      ...tasks.in_progress,
      ...tasks.ai_review,
      ...tasks.done,
      ...tasks.blocked,
    ],
    [tasks]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = allTasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  }, [allTasks]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    if (!over) {
      setOverColumnId(null);
      return;
    }

    const overId = over.id as string;

    // Check if over a column
    if (TASK_STATUS_COLUMNS.includes(overId as TaskStatus)) {
      setOverColumnId(overId as TaskStatus);
      return;
    }

    // Check if over a task - get its column
    const overTask = allTasks.find((t) => t.id === overId);
    if (overTask) {
      setOverColumnId(overTask.status);
    }
  }, [allTasks]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    setOverColumnId(null);

    if (!over) return;

    const activeTaskId = active.id as string;
    const overId = over.id as string;
    const task = allTasks.find((t) => t.id === activeTaskId);
    if (!task) return;

    // Determine target status
    let newStatus: TaskStatus | null = null;

    if (TASK_STATUS_COLUMNS.includes(overId as TaskStatus)) {
      newStatus = overId as TaskStatus;
    } else {
      const overTask = allTasks.find((t) => t.id === overId);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    // Update if status changed
    if (newStatus && task.status !== newStatus) {
      updateTaskStatus(activeTaskId, newStatus);
    }
  }, [allTasks, updateTaskStatus]);

  const handleDuplicateTask = useCallback(async (task: Task) => {
    await createTask(`${task.title} (copy)`, task.description || undefined);
  }, [createTask]);

  const handleArchiveAll = useCallback(async () => {
    await archiveDoneTasks();
  }, [archiveDoneTasks]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchTasks();
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchTasks]);

  if (isLoading && allTasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-cc-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 text-red-400 p-4 rounded-lg">
        Error: {error}
        <button onClick={() => fetchTasks()} className="ml-4 underline hover:no-underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with view toggle and refresh */}
      <div className="flex items-center justify-between px-4 py-2">
        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-cc-surface border border-cc-border rounded-lg p-1">
          <button
            onClick={() => handleViewModeChange('horizontal')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-sm rounded transition-colors ${
              preferences.viewMode === 'horizontal'
                ? 'bg-cc-accent text-white'
                : 'text-gray-400 hover:text-white hover:bg-cc-border'
            }`}
            title="Horizontal view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleViewModeChange('vertical')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-sm rounded transition-colors ${
              preferences.viewMode === 'vertical'
                ? 'bg-cc-accent text-white'
                : 'text-gray-400 hover:text-white hover:bg-cc-border'
            }`}
            title="Vertical view"
          >
            <LayoutList className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-cc-border rounded transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className={
          preferences.viewMode === 'vertical'
            ? 'flex flex-col gap-4 overflow-y-auto pb-4 flex-1'
            : 'flex gap-4 overflow-x-auto pb-4 flex-1'
        }>
        {TASK_STATUS_COLUMNS.map((status) => (
          <DroppableColumn
            key={status}
            status={status}
            tasks={tasks[status] || []}
            isTaskRunning={isTaskRunning}
            isOver={overColumnId === status}
            viewMode={preferences.viewMode}
            isCollapsed={isColumnCollapsed(preferences, status)}
            columnWidth={getColumnWidth(preferences, status)}
            selectedTasks={selectedTasks}
            onSelectTask={onSelectTask}
            onRunAgent={onRunAgent}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onViewDetails={onViewDetails}
            onDuplicateTask={handleDuplicateTask}
            onToggleSelectTask={handleToggleSelectTask}
            onSelectAllInColumn={handleSelectAllInColumn}
            onDeselectAllInColumn={handleDeselectAllInColumn}
            onBulkDelete={handleBulkDelete}
            onBulkMove={handleBulkMove}
            onTestTask={onTestTask}
            onReviewTask={onReviewTask}
            onRefreshTask={onRefreshTask}
            onAddClick={status === 'backlog' ? onNewTask : undefined}
            onArchiveAll={status === 'done' ? handleArchiveAll : undefined}
            onBatchMerge={status === 'done' ? handleBatchMerge : undefined}
            onToggleCollapse={() => handleToggleCollapse(status)}
            onResize={(width) => handleColumnResize(status, width)}
          />
        ))}
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeTask ? (
          <div className="opacity-90 transform scale-105 shadow-xl">
            <TaskCard
              task={activeTask}
              isRunning={isTaskRunning(activeTask.id)}
              onSelect={() => {}}
              onRun={() => {}}
              onEdit={() => {}}
              onDelete={() => {}}
              onDuplicate={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
    </div>
  );
}
