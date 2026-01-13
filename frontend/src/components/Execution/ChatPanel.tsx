import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Settings, Loader2, ChevronDown, GripHorizontal, X } from 'lucide-react';
import { chatApi, ChatMessage, ModelInfo } from '../../api/client';
import { useExecutionStore } from '../../stores/executionStore';

interface ChatPanelProps {
  className?: string;
}

const MIN_HEIGHT = 48; // Just input bar
const DEFAULT_HEIGHT = 200;
const MAX_HEIGHT = 500;

export default function ChatPanel({ className = '' }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState('sonnet');
  const [selectedProvider] = useState('claude-max');
  const [panelHeight, setPanelHeight] = useState(MIN_HEIGHT);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  // Get tasks context for the AI
  const { tasks } = useExecutionStore();

  // Load available models
  useEffect(() => {
    chatApi.getModels().then(({ models }) => {
      setModels(models);
    }).catch(console.error);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Build context summary from current kanban state
  const buildContextSummary = useCallback(() => {
    const taskCounts = {
      backlog: tasks.backlog.length,
      in_progress: tasks.in_progress.length,
      review: tasks.ai_review.length,
      done: tasks.done.length,
    };

    const inProgressTasks = tasks.in_progress
      .map(t => `- ${t.title}`)
      .join('\n');

    return `Kanban State:
- Backlog: ${taskCounts.backlog} tasks
- In Progress: ${taskCounts.in_progress} tasks
- Review: ${taskCounts.review} tasks
- Done: ${taskCounts.done} tasks

${inProgressTasks ? `Currently in progress:\n${inProgressTasks}` : ''}`;
  }, [tasks]);

  // Handle resize drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startHeightRef.current = panelHeight;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      // Dragging up increases height (Y decreases)
      const delta = startYRef.current - e.clientY;
      const newHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startHeightRef.current + delta));
      setPanelHeight(newHeight);
      if (newHeight > MIN_HEIGHT) {
        setIsExpanded(true);
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [panelHeight]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setError(null);
    setIsStreaming(true);
    setStreamingContent('');

    // Expand panel if collapsed
    if (panelHeight < DEFAULT_HEIGHT) {
      setPanelHeight(DEFAULT_HEIGHT);
      setIsExpanded(true);
    }

    try {
      let fullResponse = '';
      const stream = chatApi.streamChatAsync(newMessages, {
        model: selectedModel,
        provider: selectedProvider,
        includeContext: true,
        contextSummary: buildContextSummary(),
      });

      for await (const chunk of stream) {
        if (chunk.error) {
          setError(chunk.error);
          break;
        }
        if (chunk.text) {
          fullResponse += chunk.text;
          setStreamingContent(fullResponse);
        }
        if (chunk.done) {
          break;
        }
      }

      if (fullResponse) {
        setMessages([...newMessages, { role: 'assistant', content: fullResponse }]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleExpand = () => {
    if (isExpanded) {
      setPanelHeight(MIN_HEIGHT);
      setIsExpanded(false);
    } else {
      setPanelHeight(DEFAULT_HEIGHT);
      setIsExpanded(true);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div
      ref={panelRef}
      className={`bg-cc-surface border-b border-cc-border flex flex-col ${className}`}
      style={{ height: panelHeight }}
    >
      {/* Drag Handle */}
      <div
        className="h-2 cursor-ns-resize flex items-center justify-center hover:bg-cc-border/50 transition-colors"
        onMouseDown={handleMouseDown}
      >
        <GripHorizontal className="w-4 h-4 text-gray-600" />
      </div>

      {/* Messages Area (only visible when expanded) */}
      {isExpanded && panelHeight > MIN_HEIGHT + 20 && (
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3" style={{ minHeight: 0 }}>
          {messages.length === 0 && !streamingContent && (
            <div className="text-gray-500 text-sm text-center py-4">
              Ask me anything about your tasks or codebase...
            </div>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`text-sm ${
                msg.role === 'user'
                  ? 'text-white bg-cc-bg/50 rounded px-3 py-2'
                  : 'text-gray-300 border-l-2 border-cc-accent pl-3'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          ))}
          {streamingContent && (
            <div className="text-sm text-gray-300 border-l-2 border-cc-accent pl-3">
              <div className="whitespace-pre-wrap">{streamingContent}</div>
              <Loader2 className="w-3 h-3 animate-spin inline ml-1" />
            </div>
          )}
          {error && (
            <div className="text-sm text-red-400 bg-red-900/20 rounded px-3 py-2">
              {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Bar */}
      <div className="flex items-end gap-2 px-4 py-2 border-t border-cc-border/50">
        {/* Expand/Collapse button */}
        <button
          onClick={toggleExpand}
          className="p-1.5 rounded hover:bg-cc-border text-gray-400 hover:text-white transition-colors"
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Clear button (only when there are messages) */}
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="p-1.5 rounded hover:bg-cc-border text-gray-400 hover:text-white transition-colors"
            title="Clear chat"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Input */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Claude..."
            disabled={isStreaming}
            rows={1}
            className="w-full bg-cc-bg border border-cc-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cc-accent resize-none"
            style={{ minHeight: '36px', maxHeight: '120px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 120) + 'px';
            }}
          />
        </div>

        {/* Settings dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 rounded hover:bg-cc-border text-gray-400 hover:text-white transition-colors"
            title="Model settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {showSettings && (
            <div className="absolute bottom-full right-0 mb-2 w-64 bg-cc-surface border border-cc-border rounded-lg shadow-xl z-50">
              <div className="p-3 space-y-3">
                <div className="text-xs text-green-400 font-medium">
                  Using Claude Max (FREE)
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Model</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full bg-cc-bg border border-cc-border rounded px-2 py-1 text-sm text-white"
                  >
                    {models.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-xs text-gray-500">
                  {models.find(m => m.id === selectedModel)?.description}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!input.trim() || isStreaming}
          className="p-1.5 rounded bg-cc-accent hover:bg-cc-accent/80 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Send (Enter)"
        >
          {isStreaming ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
