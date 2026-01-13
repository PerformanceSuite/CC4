import { AlertCircle, Lightbulb, CheckSquare, TrendingUp } from 'lucide-react'

interface AttentionItem {
  id: string
  type: 'insight' | 'task' | 'opportunity' | 'alert'
  title: string
  description: string
  urgency: 'high' | 'medium' | 'low'
}

const mockItems: AttentionItem[] = [
  {
    id: '1',
    type: 'insight',
    title: 'New pattern detected',
    description: 'AI agents are trending on HackerNews',
    urgency: 'medium',
  },
  {
    id: '2',
    type: 'task',
    title: 'Task blocked',
    description: 'Revenue dashboard needs API key',
    urgency: 'high',
  },
  {
    id: '3',
    type: 'opportunity',
    title: 'Market opportunity',
    description: 'Competitor launched similar product',
    urgency: 'high',
  },
]

const icons = {
  insight: Lightbulb,
  task: CheckSquare,
  opportunity: TrendingUp,
  alert: AlertCircle,
}

const colors = {
  high: 'border-red-500/50 bg-red-500/10',
  medium: 'border-yellow-500/50 bg-yellow-500/10',
  low: 'border-gray-500/50 bg-gray-500/10',
}

export default function AttentionQueue() {
  return (
    <div className="space-y-3">
      {mockItems.map((item) => {
        const Icon = icons[item.type]
        return (
          <div
            key={item.id}
            className={`flex items-start gap-3 p-3 rounded-lg border ${colors[item.urgency]} cursor-pointer hover:opacity-80 transition-opacity`}
          >
            <Icon className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium text-sm">{item.title}</p>
              <p className="text-xs text-gray-500">{item.description}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
