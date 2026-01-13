import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, X, FileText, FileCode } from 'lucide-react';
import Kanban from './Kanban';
import AgentProgress from './AgentProgress';
import TaskDetailDrawer from './TaskDetailDrawer';
import ChatPanel from './ChatPanel';
import { IngestPanel } from '../Ingest';
import PipelineStatusPanel from '../Pipeline/PipelineStatusPanel';
import { useExecutionStore } from '../../stores/executionStore';
import { useProjectsStore } from '../../stores/projectsStore';
import { Task, TaskMetadata, tasksApi, pipelineApi } from '../../api/client';
import type { PipelineExecution, StartPipelineResponse } from '../../api/client';
import {
  CreateTaskModal,
  AITaskReviewModal,
  type AITaskAnalysis,
  EditTaskModal,
  DeleteConfirmModal,
  AddAgentModal,
} from './modals';
import { ProjectSelector } from '../ProjectSelector';
import { ActiveDocumentsPanel } from '../ActiveDocumentsPanel';
import type { TaskCategory } from '../../constants/task';

/**
 * Execution View Container
 *
 * This is a thin container component that:
 * - Fetches data (personas)
 * - Manages modal state
 * - Orchestrates child components
 * - Shows pipeline status when a pipeline is running
 *
 * All UI rendering is delegated to child components.
 */
export default function Execution() {
  const location = useLocation();

  // Selection state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAgentProgress, setShowAgentProgress] = useState(false);
  const [showDocsPanel, setShowDocsPanel] = useState(false);

  // Ingest panel state
  const [showIngestPanel, setShowIngestPanel] = useState(false);
  const [ingestPath, setIngestPath] = useState<string>();

  // Pipeline execution state
  const [activePipeline, setActivePipeline] = useState<PipelineExecution | null>(null);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddAgentModal, setShowAddAgentModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  // AI Review flow state
  const [showAIReviewModal, setShowAIReviewModal] = useState(false);
  const [originalTaskInput, setOriginalTaskInput] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<AITaskAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Task details mode (reuses AI review modal)
  const [detailsTask, setDetailsTask] = useState<Task | null>(null);

  // Store actions
  const { createTask, updateTask, deleteTask, runAgent, fetchPersonas, personas, openTaskDetail } =
    useExecutionStore();
  const { fetchActiveProject } = useProjectsStore();

  // Load personas and active project on mount
  useEffect(() => {
    fetchPersonas();
    fetchActiveProject();
  }, [fetchPersonas, fetchActiveProject]);

  // Check for navigation state (specPath for ingest, or executionId for pipeline)
  useEffect(() => {
    const state = location.state as { 
      specPath?: string;
      executionId?: string;
      execution?: StartPipelineResponse;
    } | null;
    
    if (state?.specPath) {
      // Open ingest panel with initial path
      setIngestPath(state.specPath);
      setShowIngestPanel(true);
      // Clear state to prevent re-triggering
      window.history.replaceState({}, document.title);
    }
    
    if (state?.executionId) {
      // Load pipeline execution state
      loadPipelineExecution(state.executionId);
      // Clear state to prevent re-triggering
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Load pipeline execution by ID
  const loadPipelineExecution = async (executionId: string) => {
    try {
      const execution = await pipelineApi.getDetail(executionId);
      setActivePipeline(execution);
    } catch (error) {
      console.error('Failed to load pipeline execution:', error);
    }
  };

  // Handle pipeline close
  const handlePipelineClose = () => {
    setActivePipeline(null);
  };

  // Handlers
  const handleSelectTask = (task: Task) => {
    // Open task detail drawer instead of just showing agent progress
    openTaskDetail(task.id);
    // Also keep track locally for modals that need the task
    setSelectedTask(task);
  };

  const handleRunAgent = async (task: Task) => {
    setSelectedTask(task);
    setShowAgentProgress(true);
    const taskPrompt = task.description
      ? `${task.title}\n\n${task.description}`
      : task.title;
    await runAgent(task.id, taskPrompt, task.persona);
  };

  // Open task details in the AI review modal (reusing the same component)
  const handleViewDetails = (task: Task) => {
    setDetailsTask(task);
    // Construct AITaskAnalysis from existing task data
    setAiAnalysis({
      title: task.title,
      description: task.description || '',
      persona: task.persona || 'coder',
      personaReason: 'Assigned agent for this task',
      category: (task.metadata?.category as AITaskAnalysis['category']) || 'feature',
      suggestedPriority: (task.metadata?.priority as AITaskAnalysis['suggestedPriority']) || 'medium',
      complexity: (task.metadata?.complexity as AITaskAnalysis['complexity']) || 'medium',
      estimatedSubtasks: task.metadata?.subtasks?.map((s: { title: string }) => s.title) || [],
    });
    setShowAIReviewModal(true);
    setIsAnalyzing(false);
  };

  // New simplified create flow - just captures the description
  const handleCreateTaskInput = async (taskDescription: string) => {
    setShowCreateModal(false);
    setOriginalTaskInput(taskDescription);
    setShowAIReviewModal(true);
    setIsAnalyzing(true);
    setAiAnalysis(null);

    try {
      // Call AI analysis endpoint
      const analysis = await tasksApi.analyze(taskDescription);
      setAiAnalysis({
        title: analysis.title,
        description: analysis.description,
        persona: analysis.persona,
        personaReason: analysis.persona_reason,
        category: analysis.category as TaskCategory,
        suggestedPriority: analysis.suggested_priority as 'low' | 'medium' | 'high' | 'urgent',
        complexity: analysis.complexity as 'trivial' | 'small' | 'medium' | 'large' | 'complex',
        estimatedSubtasks: analysis.estimated_subtasks,
      });
    } catch (error) {
      console.error('Failed to analyze task:', error);
      // Fallback to simple task creation
      setAiAnalysis({
        title: taskDescription.slice(0, 60),
        description: taskDescription,
        persona: 'backend-coder',
        personaReason: 'Default persona (analysis failed)',
        category: 'feature',
        suggestedPriority: 'medium',
        complexity: 'medium',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle AI review approval (create or edit mode)
  const handleAIApproval = async (data: {
    title: string;
    description: string;
    persona: string;
    category: TaskCategory;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    executeNow: boolean;
    taskId?: string;
  }) => {
    // Convert estimated subtasks to proper Subtask objects
    const subtasks = aiAnalysis?.estimatedSubtasks?.map((title, idx) => ({
      id: `subtask-${Date.now()}-${idx}`,
      title,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      source: 'parsed' as const,
    }));

    const metadata: TaskMetadata = {
      category: data.category,
      priority: data.priority,
      complexity: aiAnalysis?.complexity,
      subtasks: subtasks,
    };

    let task;
    if (data.taskId) {
      // Edit mode - update existing task
      await updateTask(data.taskId, {
        title: data.title,
        description: data.description || undefined,
        persona: data.persona,
        metadata,
      });
      task = { id: data.taskId, title: data.title, description: data.description };
    } else {
      // Create mode - create new task
      task = await createTask(data.title, data.description, data.persona, metadata);
    }

    setShowAIReviewModal(false);
    setAiAnalysis(null);
    setDetailsTask(null);

    // If execute now, run the agent
    if (data.executeNow && task) {
      setSelectedTask(task as Task);
      setShowAgentProgress(true);
      const taskPrompt = data.description
        ? `${data.title}\n\n${data.description}`
        : data.title;
      await runAgent(task.id, taskPrompt, data.persona);
    }
  };

  const handleEditTask = async (data: {
    title: string;
    description: string;
  }) => {
    if (!editingTask) return;
    await updateTask(editingTask.id, {
      title: data.title,
      description: data.description || undefined,
    });
    setEditingTask(null);
  };

  const handleDeleteTask = async () => {
    if (!deletingTask) return;
    await deleteTask(deletingTask.id);
    // Clear selection if we deleted the selected task
    if (selectedTask?.id === deletingTask.id) {
      setSelectedTask(null);
      setShowAgentProgress(false);
    }
    setDeletingTask(null);
  };

  const handleAddAgent = async (persona: string) => {
    if (!selectedTask) return;
    const taskPrompt = selectedTask.description
      ? `${selectedTask.title}\n\n${selectedTask.description}`
      : selectedTask.title;
    await runAgent(selectedTask.id, taskPrompt, persona);
    setShowAddAgentModal(false);
  };

  // Re-analyze a task and update it with fresh AI analysis, moving to backlog
  const handleRefreshTask = async (task: Task) => {
    const taskDescription = task.description
      ? `${task.title}\n\n${task.description}`
      : task.title;

    setIsAnalyzing(true);
    setAiAnalysis(null);

    try {
      const analysis = await tasksApi.analyze(taskDescription);
      const newAnalysis: AITaskAnalysis = {
        title: analysis.title,
        description: analysis.description,
        persona: analysis.persona,
        personaReason: analysis.persona_reason,
        category: analysis.category as TaskCategory,
        suggestedPriority: analysis.suggested_priority as 'low' | 'medium' | 'high' | 'urgent',
        complexity: analysis.complexity as 'trivial' | 'small' | 'medium' | 'large' | 'complex',
        estimatedSubtasks: analysis.estimated_subtasks,
      };

      // Convert subtasks
      const subtasks = newAnalysis.estimatedSubtasks?.map((title, idx) => ({
        id: `subtask-${Date.now()}-${idx}`,
        title,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        source: 'parsed' as const,
      }));

      // Update the task with new analysis and move to backlog
      await updateTask(task.id, {
        title: newAnalysis.title,
        description: newAnalysis.description || undefined,
        persona: newAnalysis.persona,
        status: 'backlog',
        metadata: {
          category: newAnalysis.category,
          priority: newAnalysis.suggestedPriority,
          complexity: newAnalysis.complexity,
          subtasks,
        },
      });

      setAiAnalysis(newAnalysis);
    } catch (error) {
      console.error('Failed to refresh task:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle refresh from the Details modal
  const handleRefreshFromModal = async () => {
    if (!detailsTask) return;
    await handleRefreshTask(detailsTask);
  };

  return (
    <div className="flex h-full">
      {/* Kanban Board */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Chat Panel - resizable from top */}
        <ChatPanel />

        {/* Pipeline Status Panel - shown when pipeline is active */}
        {activePipeline && (
          <div className="px-6 pt-4">
            <PipelineStatusPanel 
              execution={activePipeline} 
              onClose={handlePipelineClose}
            />
          </div>
        )}

        {/* Main content area */}
        <div className="flex-1 p-6 overflow-auto">
          <Header
            onCreateTask={() => setShowCreateModal(true)}
            onToggleDocs={() => setShowDocsPanel(!showDocsPanel)}
            onIngestSpec={() => {
              setIngestPath(undefined);
              setShowIngestPanel(true);
            }}
            showDocsPanel={showDocsPanel}
          />
          <Kanban
          onSelectTask={handleSelectTask}
          onRunAgent={handleRunAgent}
          onEditTask={setEditingTask}
          onDeleteTask={setDeletingTask}
          onViewDetails={handleViewDetails}
          onNewTask={() => setShowCreateModal(true)}
          onRefreshTask={handleRefreshTask}
        />
        </div>
      </div>

      {/* Active Documents Panel */}
      {showDocsPanel && (
        <ActiveDocumentsPanel onClose={() => setShowDocsPanel(false)} />
      )}

      {/* Agent Progress Panel */}
      {showAgentProgress && (
        <AgentProgressPanel
          task={selectedTask}
          onClose={() => setShowAgentProgress(false)}
          onAddAgent={() => setShowAddAgentModal(true)}
        />
      )}

      {/* Modals */}
      <CreateTaskModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateTaskInput}
      />

      <AITaskReviewModal
        open={showAIReviewModal}
        onClose={() => {
          setShowAIReviewModal(false);
          setAiAnalysis(null);
          setDetailsTask(null);
        }}
        originalInput={originalTaskInput}
        analysis={aiAnalysis}
        isAnalyzing={isAnalyzing}
        mode={detailsTask ? 'edit' : 'create'}
        taskId={detailsTask?.id}
        onApprove={handleAIApproval}
        onRefresh={handleRefreshFromModal}
      />

      <EditTaskModal
        open={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleEditTask}
        initialTitle={editingTask?.title || ''}
        initialDescription={editingTask?.description || ''}
      />

      <DeleteConfirmModal
        open={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        itemName={deletingTask?.title || ''}
      />

      {selectedTask && (
        <AddAgentModal
          open={showAddAgentModal}
          onClose={() => setShowAddAgentModal(false)}
          onAdd={handleAddAgent}
          taskTitle={selectedTask.title}
          personas={personas}
          defaultPersona={selectedTask.persona}
        />
      )}

      {/* Task Detail Drawer */}
      <TaskDetailDrawer />

      {/* Ingest Panel */}
      <IngestPanel
        isOpen={showIngestPanel}
        onClose={() => {
          setShowIngestPanel(false);
          setIngestPath(undefined);
        }}
        initialPath={ingestPath}
      />
    </div>
  );
}

// Sub-components

interface HeaderProps {
  onCreateTask: () => void;
  onToggleDocs: () => void;
  onIngestSpec: () => void;
  showDocsPanel: boolean;
}

function Header({ onCreateTask, onToggleDocs, onIngestSpec, showDocsPanel }: HeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">Execution</h1>
        <div className="w-64">
          <ProjectSelector />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleDocs}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            showDocsPanel
              ? 'bg-cc-accent text-white'
              : 'bg-cc-surface border border-cc-border text-gray-400 hover:text-white hover:border-gray-600'
          }`}
          title="Active Documents"
        >
          <FileText className="w-4 h-4" />
          Docs
        </button>
        <button
          onClick={onIngestSpec}
          className="flex items-center gap-2 px-3 py-2 bg-cc-surface border border-cc-border text-gray-400 hover:text-white hover:border-gray-600 rounded-lg transition-colors"
          title="Load spec document"
        >
          <FileCode className="w-4 h-4" />
          Load Spec
        </button>
        <button
          onClick={onCreateTask}
          className="flex items-center gap-2 px-4 py-2 bg-cc-accent rounded-lg hover:bg-cc-accent/80 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>
    </div>
  );
}

interface AgentProgressPanelProps {
  task: Task | null;
  onClose: () => void;
  onAddAgent: () => void;
}

function AgentProgressPanel({ task, onClose, onAddAgent }: AgentProgressPanelProps) {
  return (
    <div className="w-96 border-l border-cc-border bg-cc-surface p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Agent Progress</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>
      <AgentProgress task={task} onAddAgent={onAddAgent} />
    </div>
  );
}
