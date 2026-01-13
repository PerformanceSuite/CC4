/**
 * InlineHint Component
 * 
 * Shows contextual hints on VISLZR/Canvas nodes.
 * Phase 26: Insight Surfaces in UI
 */

import { useState } from 'react';
import { Lightbulb, X, ChevronRight, AlertTriangle, TrendingUp } from 'lucide-react';
import { Insight } from '../../hooks/useInsights';

interface InlineHintProps {
  insight: Insight;
  position?: 'top' | 'bottom' | 'left' | 'right';
  onDismiss: (id: string) => void;
  onAction?: (id: string, action: string) => void;
}

const POSITION_CLASSES = {
  top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
  bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
  left: 'right-full mr-2 top-1/2 -translate-y-1/2',
  right: 'left-full ml-2 top-1/2 -translate-y-1/2',
};

const ARROW_CLASSES = {
  top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-cc-surface',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-cc-surface',
  left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-cc-surface',
  right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-cc-surface',
};

export function InlineHint({
  insight,
  position = 'top',
  onDismiss,
  onAction,
}: InlineHintProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getIcon = () => {
    switch (insight.type) {
      case 'concern':
        return <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />;
      case 'pattern':
        return <TrendingUp className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <Lightbulb className="w-3.5 h-3.5 text-cc-accent" />;
    }
  };

  if (!isExpanded) {
    // Compact badge that can be clicked to expand
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="absolute -top-1 -right-1 p-1 bg-cc-accent rounded-full shadow-lg hover:scale-110 transition-transform z-10"
        title={insight.title}
      >
        <Lightbulb className="w-3 h-3 text-white" />
      </button>
    );
  }

  return (
    <div className={`absolute ${POSITION_CLASSES[position]} z-20`}>
      {/* Card */}
      <div className="bg-cc-surface border border-cc-border rounded-lg shadow-xl min-w-[200px] max-w-[280px]">
        {/* Header */}
        <div className="flex items-start gap-2 p-3 border-b border-cc-border">
          <div className="p-1 bg-cc-bg rounded">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-white truncate">{insight.title}</h4>
          </div>
          <button
            onClick={() => {
              setIsExpanded(false);
              onDismiss(insight.id);
            }}
            className="p-0.5 hover:bg-cc-border rounded transition-colors"
          >
            <X className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3">
          <p className="text-xs text-gray-400 leading-relaxed">{insight.description}</p>

          {insight.action && (
            <button
              onClick={() => onAction?.(insight.id, insight.action!.type)}
              className="mt-2 w-full flex items-center justify-between px-2 py-1.5 bg-cc-bg rounded hover:bg-cc-border transition-colors group"
            >
              <span className="text-xs text-cc-accent">{insight.action.label}</span>
              <ChevronRight className="w-3.5 h-3.5 text-cc-accent group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>

        {/* Collapse button */}
        <button
          onClick={() => setIsExpanded(false)}
          className="w-full px-3 py-1.5 text-xs text-gray-500 hover:text-gray-400 border-t border-cc-border transition-colors"
        >
          Minimize
        </button>
      </div>

      {/* Arrow */}
      <div
        className={`absolute w-0 h-0 border-[6px] ${ARROW_CLASSES[position]}`}
      />
    </div>
  );
}

/**
 * NodeHintIndicator - Small indicator that shows a node has hints.
 */
interface NodeHintIndicatorProps {
  count: number;
  hasHighPriority?: boolean;
  onClick: () => void;
}

export function NodeHintIndicator({
  count,
  hasHighPriority = false,
  onClick,
}: NodeHintIndicatorProps) {
  if (count === 0) return null;

  return (
    <button
      onClick={onClick}
      className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold shadow-lg transition-transform hover:scale-110 ${
        hasHighPriority
          ? 'bg-yellow-500 text-yellow-900'
          : 'bg-cc-accent text-white'
      }`}
      title={`${count} insight${count > 1 ? 's' : ''}`}
    >
      {count > 9 ? '9+' : count}
    </button>
  );
}

export default InlineHint;
