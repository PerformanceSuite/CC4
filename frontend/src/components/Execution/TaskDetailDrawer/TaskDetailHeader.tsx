import { GitBranch, Clock } from 'lucide-react';
import { Task } from '../../../api/client';
import {
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  TASK_CATEGORY_LABELS,
  TASK_CATEGORY_COLORS,
  EXECUTION_PHASE_LABELS,
  EXECUTION_PHASE_COLORS,
  TaskCategory,
} from '../../../constants/task';

interface TaskDetailHeaderProps {
  task: Task;
}

// Priority colors
const PRIORITY_COLORS = {
  low: 'bg-gray-500/20 text-gray-400',
  medium: 'bg-blue-500/20 text-blue-400',
  high: 'bg-orange-500/20 text-orange-400',
  urgent: 'bg-red-500/20 text-red-400',
};

const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High Priority',
  urgent: 'Urgent',
};

export default function TaskDetailHeader({ task }: TaskDetailHeaderProps) {
  const statusLabel = TASK_STATUS_LABELS[task.status];
  const statusColor = TASK_STATUS_COLORS[task.status];

  const category = task.metadata?.category as TaskCategory | undefined;
  const categoryLabel = category ? TASK_CATEGORY_LABELS[category] : null;
  const categoryColor = category ? TASK_CATEGORY_COLORS[category] : null;

  const priority = task.metadata?.priority;
  const priorityLabel = priority ? PRIORITY_LABELS[priority] : null;
  const priorityColor = priority ? PRIORITY_COLORS[priority] : null;

  const phase = task.executionProgress?.phase;
  const phaseLabel = phase ? EXECUTION_PHASE_LABELS[phase] : null;
  const phaseColor = phase ? EXECUTION_PHASE_COLORS[phase] : null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6 pr-14 border-b border-cc-border">
      {/* Status and category badges */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={`px-2 py-0.5 text-xs font-medium rounded bg-gray-700 ${statusColor.split(' ')[0]}`}>
          {statusLabel}
        </span>
        {phaseLabel && task.status === 'in_progress' && (
          <span className={`px-2 py-0.5 text-xs font-medium rounded ${phaseColor}`}>
            {phaseLabel}
          </span>
        )}
        {categoryLabel && (
          <span className={`px-2 py-0.5 text-xs font-medium rounded ${categoryColor}`}>
            {categoryLabel}
          </span>
        )}
        {priorityLabel && (priority === 'high' || priority === 'urgent') && (
          <span className={`px-2 py-0.5 text-xs font-medium rounded ${priorityColor}`}>
            {priorityLabel}
          </span>
        )}
      </div>

      {/* Title */}
      <h2 className="text-xl font-semibold text-white mb-2 pr-8">
        {task.title}
      </h2>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-400 mb-4">
          {task.description}
        </p>
      )}

      {/* Meta info */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        {task.branch && (
          <div className="flex items-center gap-1">
            <GitBranch className="w-3 h-3" />
            <span className="font-mono">{task.branch}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>Created {formatDate(task.created_at)}</span>
        </div>
        {task.persona && (
          <span className="text-cc-accent">
            {task.persona}
          </span>
        )}
      </div>
    </div>
  );
}
