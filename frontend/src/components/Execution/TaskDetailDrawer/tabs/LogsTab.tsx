import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, Terminal } from 'lucide-react';
import { Task } from '../../../../api/client';
import { useExecutionStore } from '../../../../stores/executionStore';
import { EXECUTION_PHASE_LABELS, EXECUTION_PHASE_COLORS, type ExecutionPhase } from '../../../../constants/task';

interface LogsTabProps {
  task: Task;
}

interface PhaseGroup {
  phase: ExecutionPhase | 'unknown';
  lines: string[];
  startIndex: number;
  endIndex: number;
}

// Parse phase markers from output
function groupLogsByPhase(lines: string[]): PhaseGroup[] {
  const groups: PhaseGroup[] = [];
  let currentPhase: ExecutionPhase | 'unknown' = 'unknown';
  let currentLines: string[] = [];
  let startIndex = 0;

  const phasePattern = /\[PHASE:(\w+)\]/i;
  const implicitPhasePatterns: [RegExp, ExecutionPhase][] = [
    [/Planning|analyzing|reading|understanding/i, 'planning'],
    [/Writing|implementing|creating|coding/i, 'coding'],
    [/Testing|running tests|QA|review/i, 'qa_review'],
    [/Fixing|correcting|updating/i, 'qa_fixing'],
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for explicit phase marker
    const explicitMatch = line.match(phasePattern);
    if (explicitMatch) {
      // Save current group if it has lines
      if (currentLines.length > 0) {
        groups.push({
          phase: currentPhase,
          lines: currentLines,
          startIndex,
          endIndex: i - 1,
        });
      }
      currentPhase = explicitMatch[1].toLowerCase() as ExecutionPhase;
      currentLines = [];
      startIndex = i;
      continue;
    }

    // Check for implicit phase indicators (if still in unknown)
    if (currentPhase === 'unknown') {
      for (const [pattern, phase] of implicitPhasePatterns) {
        if (pattern.test(line)) {
          if (currentLines.length > 0) {
            groups.push({
              phase: currentPhase,
              lines: currentLines,
              startIndex,
              endIndex: i - 1,
            });
          }
          currentPhase = phase;
          currentLines = [];
          startIndex = i;
          break;
        }
      }
    }

    currentLines.push(line);
  }

  // Add final group
  if (currentLines.length > 0) {
    groups.push({
      phase: currentPhase,
      lines: currentLines,
      startIndex,
      endIndex: lines.length - 1,
    });
  }

  return groups;
}

export default function LogsTab({ task }: LogsTabProps) {
  const { activeSessions, sessionOutputs } = useExecutionStore();
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(['all']));
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Get sessions for this task
  const taskSessions = activeSessions.filter((s) => s.task_id === task.id);

  // Auto-scroll to bottom when new logs come in
  const allOutput = taskSessions.flatMap((s) => sessionOutputs[s.session_id] || []);
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [allOutput.length]);

  const togglePhase = (phaseKey: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phaseKey)) {
        next.delete(phaseKey);
      } else {
        next.add(phaseKey);
      }
      return next;
    });
  };

  if (taskSessions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No execution logs</p>
        <p className="text-xs mt-1">Run an agent to see logs here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {taskSessions.map((session) => {
        const output = sessionOutputs[session.session_id] || [];
        const phaseGroups = groupLogsByPhase(output);
        const isRunning = session.status === 'running';

        return (
          <div key={session.session_id} className="bg-cc-bg rounded-lg overflow-hidden">
            {/* Session header */}
            <div className="px-4 py-3 border-b border-cc-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">{session.persona}</span>
                <span className={`px-2 py-0.5 text-xs rounded ${
                  session.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                  session.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                  session.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {session.status}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {output.length} lines
              </span>
            </div>

            {/* Logs content */}
            <div className="max-h-[500px] overflow-y-auto">
              {phaseGroups.length === 0 ? (
                <div className="p-4 text-gray-500 text-sm">
                  {isRunning ? 'Waiting for output...' : 'No output'}
                </div>
              ) : phaseGroups.length === 1 && phaseGroups[0].phase === 'unknown' ? (
                // Single unknown phase - show all logs without grouping
                <div className="p-4 font-mono text-xs space-y-1">
                  {phaseGroups[0].lines.map((line, i) => (
                    <LogLine key={i} line={line} />
                  ))}
                </div>
              ) : (
                // Multiple phases - show collapsible groups
                <div className="divide-y divide-cc-border">
                  {phaseGroups.map((group, groupIndex) => {
                    const phaseKey = `${session.session_id}-${groupIndex}`;
                    const isExpanded = expandedPhases.has(phaseKey) || expandedPhases.has('all');
                    const phaseLabel = group.phase === 'unknown'
                      ? 'Output'
                      : EXECUTION_PHASE_LABELS[group.phase] || group.phase;
                    const phaseColor = group.phase === 'unknown'
                      ? 'bg-gray-500/20 text-gray-400'
                      : EXECUTION_PHASE_COLORS[group.phase] || 'bg-gray-500/20 text-gray-400';

                    return (
                      <div key={phaseKey}>
                        <button
                          onClick={() => togglePhase(phaseKey)}
                          className="w-full px-4 py-2 flex items-center gap-2 hover:bg-cc-surface/50 transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          )}
                          <span className={`px-2 py-0.5 text-xs rounded ${phaseColor}`}>
                            {phaseLabel}
                          </span>
                          <span className="text-xs text-gray-500">
                            {group.lines.length} lines
                          </span>
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-4 font-mono text-xs space-y-1">
                            {group.lines.map((line, i) => (
                              <LogLine key={i} line={line} />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              <div ref={logsEndRef} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Individual log line with syntax highlighting
function LogLine({ line }: { line: string }) {
  // Detect line type for coloring
  const isError = /error|exception|failed|failure/i.test(line);
  const isWarning = /warn|warning/i.test(line);
  const isSuccess = /success|complete|done|passed/i.test(line);
  const isInfo = /info|→|▶|✓|✔/i.test(line);

  let className = 'text-gray-300 whitespace-pre-wrap break-all';
  if (isError) className = 'text-red-400 whitespace-pre-wrap break-all';
  else if (isWarning) className = 'text-yellow-400 whitespace-pre-wrap break-all';
  else if (isSuccess) className = 'text-green-400 whitespace-pre-wrap break-all';
  else if (isInfo) className = 'text-blue-400 whitespace-pre-wrap break-all';

  return <div className={className}>{line}</div>;
}
