import { useState, useMemo } from 'react';
import { Plus, Trash2, CheckCircle, Circle, Loader2 } from 'lucide-react';
import { Task, Subtask } from '../../../../api/client';
import { useExecutionStore } from '../../../../stores/executionStore';

interface SubtasksTabProps {
  task: Task;
}

// Parse subtasks from agent output using markdown checkbox patterns
function parseSubtasksFromOutput(output: string[]): Subtask[] {
  const parsed: Subtask[] = [];
  const checkboxPattern = /^[-*]\s*\[([ xX])\]\s*(.+)$/;

  for (const line of output) {
    const match = line.trim().match(checkboxPattern);
    if (match) {
      const isCompleted = match[1].toLowerCase() === 'x';
      const title = match[2].trim();

      // Avoid duplicates based on title
      if (!parsed.some((s) => s.title === title)) {
        parsed.push({
          id: `parsed-${parsed.length}-${Date.now()}`,
          title,
          status: isCompleted ? 'completed' : 'pending',
          createdAt: new Date().toISOString(),
          completedAt: isCompleted ? new Date().toISOString() : undefined,
          source: 'parsed',
        });
      }
    }
  }

  return parsed;
}

export default function SubtasksTab({ task }: SubtasksTabProps) {
  const { addSubtask, toggleSubtask, deleteSubtask, activeSessions, sessionOutputs } = useExecutionStore();
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [loadingSubtask, setLoadingSubtask] = useState<string | null>(null);

  // Manual subtasks from metadata
  const manualSubtasks = task.metadata?.subtasks || [];

  // Parse subtasks from agent output
  const taskSessions = activeSessions.filter((s) => s.task_id === task.id);
  const allOutput = taskSessions.flatMap((s) => sessionOutputs[s.session_id] || []);
  const parsedSubtasks = useMemo(() => parseSubtasksFromOutput(allOutput), [allOutput]);

  // Merge manual and parsed, avoiding duplicates by title
  const allSubtasks = useMemo(() => {
    const combined = [...manualSubtasks];
    for (const parsed of parsedSubtasks) {
      if (!combined.some((s) => s.title.toLowerCase() === parsed.title.toLowerCase())) {
        combined.push(parsed);
      }
    }
    return combined;
  }, [manualSubtasks, parsedSubtasks]);

  const completedCount = allSubtasks.filter((s) => s.status === 'completed').length;
  const progress = allSubtasks.length > 0 ? Math.round((completedCount / allSubtasks.length) * 100) : 0;

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    setIsAdding(true);
    await addSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
    setIsAdding(false);
  };

  const handleToggle = async (subtask: Subtask) => {
    // Only allow toggling manual subtasks
    if (subtask.source === 'parsed') return;

    setLoadingSubtask(subtask.id);
    await toggleSubtask(task.id, subtask.id);
    setLoadingSubtask(null);
  };

  const handleDelete = async (subtask: Subtask) => {
    // Only allow deleting manual subtasks
    if (subtask.source === 'parsed') return;

    setLoadingSubtask(subtask.id);
    await deleteSubtask(task.id, subtask.id);
    setLoadingSubtask(null);
  };

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      {allSubtasks.length > 0 && (
        <div className="bg-cc-bg rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Progress</span>
            <span className="text-sm text-white">{completedCount}/{allSubtasks.length} completed</span>
          </div>
          <div className="w-full h-2 bg-cc-border rounded-full overflow-hidden">
            <div
              className="h-full bg-cc-accent transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Add subtask form */}
      <form onSubmit={handleAddSubtask} className="flex gap-2">
        <input
          type="text"
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          placeholder="Add a subtask..."
          className="flex-1 px-3 py-2 bg-cc-bg border border-cc-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cc-accent"
        />
        <button
          type="submit"
          disabled={!newSubtaskTitle.trim() || isAdding}
          className="flex items-center gap-2 px-4 py-2 bg-cc-accent text-white rounded-lg hover:bg-cc-accent/80 transition-colors disabled:opacity-50"
        >
          {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add
        </button>
      </form>

      {/* Subtask list */}
      {allSubtasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No subtasks yet</p>
          <p className="text-xs mt-1">Add subtasks manually or they'll be parsed from agent output</p>
        </div>
      ) : (
        <div className="space-y-2">
          {allSubtasks.map((subtask) => (
            <div
              key={subtask.id}
              className={`flex items-center gap-3 p-3 bg-cc-bg rounded-lg group transition-colors ${
                subtask.source === 'parsed' ? 'opacity-80' : ''
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={() => handleToggle(subtask)}
                disabled={subtask.source === 'parsed' || loadingSubtask === subtask.id}
                className={`flex-shrink-0 ${subtask.source === 'parsed' ? 'cursor-default' : 'cursor-pointer'}`}
              >
                {loadingSubtask === subtask.id ? (
                  <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
                ) : subtask.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-500 hover:text-cc-accent" />
                )}
              </button>

              {/* Title */}
              <span className={`flex-1 ${subtask.status === 'completed' ? 'line-through text-gray-500' : 'text-white'}`}>
                {subtask.title}
              </span>

              {/* Source badge */}
              {subtask.source === 'parsed' && (
                <span className="px-1.5 py-0.5 text-[10px] bg-purple-500/20 text-purple-400 rounded">
                  parsed
                </span>
              )}

              {/* Delete button (manual only) */}
              {subtask.source === 'manual' && (
                <button
                  onClick={() => handleDelete(subtask)}
                  disabled={loadingSubtask === subtask.id}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Parsed subtasks info */}
      {parsedSubtasks.length > 0 && (
        <p className="text-xs text-gray-500 text-center">
          {parsedSubtasks.length} subtask{parsedSubtasks.length !== 1 ? 's' : ''} detected from agent output
        </p>
      )}
    </div>
  );
}
