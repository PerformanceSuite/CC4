import { useState } from 'react';
import { X } from 'lucide-react';
import { useExecutionStore } from '../../../stores/executionStore';
import TaskDetailHeader from './TaskDetailHeader';
import OverviewTab from './tabs/OverviewTab';
import SubtasksTab from './tabs/SubtasksTab';
import LogsTab from './tabs/LogsTab';

type TabId = 'overview' | 'subtasks' | 'logs';

interface Tab {
  id: TabId;
  label: string;
  badge?: number;
}

export default function TaskDetailDrawer() {
  const { taskDetailOpen, closeTaskDetail, getSelectedTask } = useExecutionStore();
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const task = getSelectedTask();

  // Calculate subtask counts for badge
  const subtasks = task?.metadata?.subtasks || [];
  const completedSubtasks = subtasks.filter((s) => s.status === 'completed').length;

  const tabs: Tab[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'subtasks', label: 'Subtasks', badge: subtasks.length > 0 ? completedSubtasks : undefined },
    { id: 'logs', label: 'Logs' },
  ];

  if (!taskDetailOpen || !task) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={closeTaskDetail}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-[600px] max-w-[90vw] bg-cc-surface border-l border-cc-border z-50 flex flex-col shadow-2xl animate-slide-in-right">
        {/* Close button */}
        <button
          onClick={closeTaskDetail}
          className="absolute top-4 right-4 p-2 hover:bg-cc-bg rounded-lg transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {/* Header */}
        <TaskDetailHeader task={task} />

        {/* Tabs */}
        <div className="flex border-b border-cc-border px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-cc-accent text-cc-accent'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
              {tab.badge !== undefined && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-cc-bg rounded">
                  {tab.badge}/{subtasks.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && <OverviewTab task={task} />}
          {activeTab === 'subtasks' && <SubtasksTab task={task} />}
          {activeTab === 'logs' && <LogsTab task={task} />}
        </div>
      </div>
    </>
  );
}
