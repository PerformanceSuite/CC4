import { useState, useEffect } from 'react';
import { Loader2, Sparkles, Play, Edit2, Check, Bot, ListTodo, Save, RotateCcw } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import type { TaskCategory } from '../../../constants/task';

type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface AITaskAnalysis {
  title: string;
  description: string;
  persona: string;
  personaReason: string;
  category: TaskCategory;
  suggestedPriority: Priority;
  complexity: 'trivial' | 'small' | 'medium' | 'large' | 'complex';
  estimatedSubtasks?: string[];
}

interface AITaskReviewModalProps {
  open: boolean;
  onClose: () => void;
  originalInput: string;
  analysis: AITaskAnalysis | null;
  isAnalyzing: boolean;
  /** Mode: 'create' for new tasks, 'edit' for existing tasks */
  mode?: 'create' | 'edit';
  /** Task ID when in edit mode */
  taskId?: string;
  onApprove: (data: {
    title: string;
    description: string;
    persona: string;
    category: TaskCategory;
    priority: Priority;
    executeNow: boolean;
    taskId?: string;
  }) => Promise<void>;
  /** Handler for refreshing/re-analyzing the task (edit mode only) */
  onRefresh?: () => Promise<void>;
}

export function AITaskReviewModal({
  open,
  onClose,
  originalInput,
  analysis,
  isAnalyzing,
  mode = 'create',
  taskId,
  onApprove,
  onRefresh,
}: AITaskReviewModalProps) {
  const isEditMode = mode === 'edit';
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state with analysis when it arrives
  useEffect(() => {
    if (analysis) {
      setEditedTitle(analysis.title);
      setEditedDescription(analysis.description);
    }
  }, [analysis]);

  const handleApprove = async (executeNow: boolean) => {
    if (!analysis) return;
    setIsSubmitting(true);
    try {
      await onApprove({
        title: editedTitle,
        description: editedDescription,
        persona: analysis.persona,
        category: analysis.category,
        priority: analysis.suggestedPriority,
        executeNow,
        taskId: isEditMode ? taskId : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEditMode ? "Task Details" : "AI Task Analysis"} maxWidth="lg">
      <div className="space-y-4">
        {/* Original Input - only show for new task creation */}
        {!isEditMode && originalInput && (
          <div className="bg-cc-bg/50 border border-cc-border rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Your input:</p>
            <p className="text-sm text-gray-300">{originalInput}</p>
          </div>
        )}

        {/* Loading State */}
        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="relative">
              <Loader2 className="w-8 h-8 animate-spin text-cc-accent" />
              <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <p className="text-sm text-gray-400 mt-3">Analyzing your task...</p>
            <p className="text-xs text-gray-500 mt-1">
              AI is determining the best approach, agent, and structure
            </p>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && !isAnalyzing && (
          <>
            {/* Refined Task */}
            <div className="bg-cc-surface border border-cc-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-white">Refined Task</span>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                >
                  {isEditing ? (
                    <>
                      <Check className="w-3 h-3" />
                      Done
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </>
                  )}
                </button>
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-cc-bg border border-cc-border rounded-lg focus:border-cc-accent focus:outline-none text-white"
                    placeholder="Task title"
                  />
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-cc-bg border border-cc-border rounded-lg focus:border-cc-accent focus:outline-none resize-none text-white"
                    placeholder="Task description"
                  />
                </div>
              ) : (
                <div>
                  <h3 className="text-white font-medium mb-1">{editedTitle}</h3>
                  <p className="text-sm text-gray-400">{editedDescription}</p>
                </div>
              )}
            </div>

            {/* Selected Agent (display only, not editable) */}
            <div className="bg-cc-surface border border-cc-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-4 h-4 text-cc-accent" />
                <span className="text-sm font-medium text-white">Selected Agent</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cc-accent/20 border border-cc-accent/30 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-cc-accent" />
                </div>
                <div>
                  <p className="text-sm text-white font-medium">{analysis.persona}</p>
                  <p className="text-xs text-gray-500">{analysis.personaReason}</p>
                </div>
              </div>
            </div>

            {/* Subtasks Preview */}
            {analysis.estimatedSubtasks && analysis.estimatedSubtasks.length > 0 && (
              <div className="bg-cc-surface border border-cc-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ListTodo className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-white">
                    Subtasks ({analysis.estimatedSubtasks.length})
                  </span>
                </div>
                <ul className="space-y-2">
                  {analysis.estimatedSubtasks.map((subtask, idx) => (
                    <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                      <span className="w-5 h-5 rounded border border-gray-600 flex-shrink-0 flex items-center justify-center text-xs text-gray-500 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{subtask}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              {isEditMode && onRefresh && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onRefresh}
                  disabled={isSubmitting || isAnalyzing}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Refresh
                </Button>
              )}
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleApprove(false)}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2"
              >
                {isEditMode ? (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <ListTodo className="w-4 h-4" />
                    Create Task
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={() => handleApprove(true)}
                isLoading={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                {isEditMode ? 'Run Agent' : 'Execute Now'}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
