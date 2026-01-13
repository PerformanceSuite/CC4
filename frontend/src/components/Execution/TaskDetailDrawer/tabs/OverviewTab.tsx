import { useState } from 'react';
import { CheckCircle, XCircle, MessageSquare, ExternalLink, FileCode, Bot, Clock } from 'lucide-react';
import { Task } from '../../../../api/client';
import { useExecutionStore } from '../../../../stores/executionStore';

interface OverviewTabProps {
  task: Task;
}

export default function OverviewTab({ task }: OverviewTabProps) {
  const { activeSessions, approveTask, rejectTask } = useExecutionStore();
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get sessions for this task
  const taskSessions = activeSessions.filter((s) => s.task_id === task.id);

  // Check if task is in a reviewable state
  const isReviewable = task.status === 'ai_review';

  const handleApprove = async () => {
    setIsSubmitting(true);
    await approveTask(task.id);
    setIsSubmitting(false);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setIsSubmitting(true);
    await rejectTask(task.id, rejectReason);
    setIsSubmitting(false);
    setShowRejectInput(false);
    setRejectReason('');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Task Description */}
      {task.description && (
        <div className="bg-cc-bg rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
          <p className="text-white whitespace-pre-wrap">{task.description}</p>
        </div>
      )}

      {/* Metadata */}
      <div className="bg-cc-bg rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {task.persona && (
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-gray-500" />
              <span className="text-gray-400">Persona:</span>
              <span className="text-cc-accent">{task.persona}</span>
            </div>
          )}
          {task.metadata?.category && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Category:</span>
              <span className="text-white capitalize">{task.metadata.category.replace('_', ' ')}</span>
            </div>
          )}
          {task.metadata?.priority && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Priority:</span>
              <span className={`capitalize ${
                task.metadata.priority === 'urgent' ? 'text-red-400' :
                task.metadata.priority === 'high' ? 'text-orange-400' :
                'text-white'
              }`}>
                {task.metadata.priority}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-gray-400">Created:</span>
            <span className="text-white">{formatDate(task.created_at)}</span>
          </div>
          {task.updated_at && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-400">Updated:</span>
              <span className="text-white">{formatDate(task.updated_at)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Previous Review Feedback */}
      {task.metadata?.reviewFeedback && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-medium text-orange-400">Previous Rejection Feedback</h3>
          </div>
          <p className="text-white text-sm">{task.metadata.reviewFeedback}</p>
          {task.metadata.reviewedAt && (
            <p className="text-xs text-orange-400/60 mt-2">
              Rejected on {formatDate(task.metadata.reviewedAt)}
            </p>
          )}
        </div>
      )}

      {/* Agent Sessions Summary */}
      {taskSessions.length > 0 && (
        <div className="bg-cc-bg rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">
            Agent Sessions ({taskSessions.length})
          </h3>
          <div className="space-y-3">
            {taskSessions.slice(-3).map((session) => (
              <div key={session.session_id} className="flex items-center justify-between p-3 bg-cc-surface rounded-lg">
                <div className="flex items-center gap-3">
                  <Bot className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-white">{session.persona}</p>
                    <p className="text-xs text-gray-500">
                      {session.status === 'completed' ? 'Completed' :
                       session.status === 'running' ? 'Running...' :
                       session.status === 'failed' ? 'Failed' : session.status}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {session.files_changed.length > 0 && (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <FileCode className="w-3 h-3" />
                      {session.files_changed.length} files
                    </span>
                  )}
                  {session.pr_url && (
                    <a
                      href={session.pr_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-cc-accent hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      PR
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Actions */}
      {isReviewable && (
        <div className="bg-cc-bg rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Review Actions</h3>

          {!showRejectInput ? (
            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-5 h-5" />
                {task.status === 'ai_review' ? 'Approve for Human Review' : 'Approve & Complete'}
              </button>
              <button
                onClick={() => setShowRejectInput(true)}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-5 h-5" />
                Reject
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain what needs to be changed..."
                className="w-full h-24 px-3 py-2 bg-cc-surface border border-cc-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cc-accent resize-none"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Confirm Rejection
                </button>
                <button
                  onClick={() => {
                    setShowRejectInput(false);
                    setRejectReason('');
                  }}
                  className="px-4 py-2 bg-cc-surface text-gray-400 rounded-lg hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
