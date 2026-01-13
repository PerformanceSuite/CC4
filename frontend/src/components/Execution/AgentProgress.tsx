import { useEffect, useRef, useState } from 'react';
import { Bot, Terminal, Clock, CheckCircle, XCircle, ExternalLink, FileCode, ChevronDown, ChevronRight, Plus, Square } from 'lucide-react';
import { useExecutionStore } from '../../stores/executionStore';
import { Task, AgentSession } from '../../api/client';

interface AgentProgressProps {
  task: Task | null;
  onAddAgent?: () => void;
}

export default function AgentProgress({ task, onAddAgent }: AgentProgressProps) {
  const { activeSessions, sessionOutputs, stopAgent, stopAllAgents, clearSession } = useExecutionStore();
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

  // Filter sessions for current task
  const taskSessions = task ? activeSessions.filter((s) => s.task_id === task.id) : [];
  const runningSessions = taskSessions.filter((s) => s.status === 'running' || s.status === 'pending');

  const toggleSession = (sessionId: string) => {
    setExpandedSessions((prev) => {
      const next = new Set(prev);
      if (next.has(sessionId)) {
        next.delete(sessionId);
      } else {
        next.add(sessionId);
      }
      return next;
    });
  };

  // Auto-expand new sessions
  useEffect(() => {
    if (taskSessions.length > 0) {
      const latest = taskSessions[taskSessions.length - 1];
      setExpandedSessions((prev) => new Set([...prev, latest.session_id]));
    }
  }, [taskSessions.length]);

  if (!task) {
    return (
      <div className="text-center text-gray-500 py-8">
        Select a task to see agent progress
      </div>
    );
  }

  // No active sessions
  if (taskSessions.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-cc-bg rounded-lg">
          <Bot className="w-8 h-8 text-gray-500" />
          <div>
            <p className="font-medium text-gray-400">No active agent</p>
            <p className="text-xs text-gray-500">Click play on a task to start</p>
          </div>
        </div>

        <div className="bg-cc-bg rounded-lg p-4">
          <h4 className="text-sm font-medium mb-2">Task Details</h4>
          <p className="text-sm text-white">{task.title}</p>
          {task.description && (
            <p className="text-xs text-gray-500 mt-2">{task.description}</p>
          )}
          {task.persona && (
            <p className="text-xs text-cc-accent mt-2">Persona: {task.persona}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with session count */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-400">
          Active Sessions ({taskSessions.length})
        </h3>
        {runningSessions.length > 1 && (
          <button
            onClick={stopAllAgents}
            className="flex items-center gap-1 px-2 py-1 text-xs text-red-400 hover:bg-red-500/20 rounded transition-colors"
          >
            <Square className="w-3 h-3" />
            Stop All
          </button>
        )}
      </div>

      {/* Session Cards */}
      <div className="space-y-3">
        {taskSessions.map((session) => (
          <SessionCard
            key={session.session_id}
            session={session}
            output={sessionOutputs[session.session_id] || []}
            isExpanded={expandedSessions.has(session.session_id)}
            onToggle={() => toggleSession(session.session_id)}
            onStop={() => stopAgent(session.session_id)}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {onAddAgent && (
          <button
            onClick={onAddAgent}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-cc-accent/20 text-cc-accent rounded-lg hover:bg-cc-accent/30 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Agent
          </button>
        )}
        <button
          onClick={clearSession}
          className="flex-1 px-3 py-2 bg-cc-surface text-gray-400 rounded-lg hover:bg-cc-border transition-colors text-sm"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}

interface SessionCardProps {
  session: AgentSession;
  output: string[];
  isExpanded: boolean;
  onToggle: () => void;
  onStop: () => void;
}

function SessionCard({ session, output, isExpanded, onToggle, onStop }: SessionCardProps) {
  const outputRef = useRef<HTMLDivElement>(null);
  const isRunning = session.status === 'running' || session.status === 'pending';
  const statusInfo = getStatusInfo(session.status, isRunning);

  // Auto-scroll when expanded and new output arrives
  useEffect(() => {
    if (isExpanded && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output.length, isExpanded]);

  return (
    <div className="bg-cc-bg border border-cc-border rounded-lg overflow-hidden">
      {/* Header */}
      <div
        onClick={onToggle}
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-cc-border/50 transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        )}
        <Bot className="w-5 h-5 text-cc-accent" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{session.persona}</p>
          <p className="text-xs text-gray-500">{session.model}</p>
        </div>
        <div className="flex items-center gap-2">
          {statusInfo.icon}
          <span className={`text-xs ${statusInfo.color}`}>{statusInfo.label}</span>
        </div>
        {isRunning && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStop();
            }}
            className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
            title="Stop this agent"
          >
            <Square className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-cc-border p-3 space-y-3">
          {/* Output */}
          <div className="font-mono text-xs">
            <div className="flex items-center gap-2 mb-2 text-gray-500">
              <Terminal className="w-3 h-3" />
              <span>Output</span>
            </div>
            <div
              ref={outputRef}
              className="space-y-1 text-gray-300 max-h-48 overflow-y-auto"
            >
              {output.length > 0 ? (
                output.map((line, i) => (
                  <p key={i} className={getLineColor(line)}>
                    {line}
                  </p>
                ))
              ) : (
                <p className="text-gray-500">Waiting for output...</p>
              )}
            </div>
          </div>

          {/* Files Changed */}
          {session.files_changed && session.files_changed.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-1 text-gray-500 text-xs">
                <FileCode className="w-3 h-3" />
                <span>Files Changed ({session.files_changed.length})</span>
              </div>
              <div className="space-y-0.5">
                {session.files_changed.map((file, i) => (
                  <p key={i} className="text-xs text-green-400 truncate">
                    {file}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* PR Link */}
          {session.pr_url && (
            <a
              href={session.pr_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-2 py-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors text-xs"
            >
              <ExternalLink className="w-3 h-3" />
              View Pull Request
            </a>
          )}

          {/* Error */}
          {session.error && (
            <div className="bg-red-500/20 text-red-400 p-2 rounded text-xs">
              Error: {session.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getStatusInfo(status: string, isRunning: boolean) {
  if (isRunning) {
    return {
      icon: <Clock className="w-4 h-4 text-yellow-500" />,
      label: 'Running',
      color: 'text-yellow-400',
    };
  }

  switch (status) {
    case 'completed':
      return {
        icon: <CheckCircle className="w-4 h-4 text-green-500" />,
        label: 'Completed',
        color: 'text-green-400',
      };
    case 'failed':
      return {
        icon: <XCircle className="w-4 h-4 text-red-500" />,
        label: 'Failed',
        color: 'text-red-400',
      };
    case 'pending':
      return {
        icon: <Clock className="w-4 h-4 text-gray-500" />,
        label: 'Pending',
        color: 'text-gray-400',
      };
    default:
      return {
        icon: <Clock className="w-4 h-4 text-gray-500" />,
        label: status,
        color: 'text-gray-400',
      };
  }
}

function getLineColor(line: string): string {
  if (line.includes('Error') || line.includes('error') || line.includes('failed')) {
    return 'text-red-400';
  }
  if (line.includes('Writing') || line.includes('Creating') || line.includes('PR created')) {
    return 'text-cc-accent';
  }
  if (line.includes('completed') || line.includes('success')) {
    return 'text-green-400';
  }
  return 'text-gray-300';
}
