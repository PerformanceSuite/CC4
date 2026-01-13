import { TrendingUp, DollarSign, Target, AlertCircle } from 'lucide-react'
import RevenueView from './RevenueView'
import AttentionQueue from './AttentionQueue'

export default function Dashboard() {
  return (
    <div className="p-6 overflow-auto h-full">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Monthly Revenue"
          value="$0"
          change="+0%"
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Pipeline Value"
          value="$0"
          change="0 deals"
          icon={Target}
          color="blue"
        />
        <StatCard
          title="Active Tasks"
          value="4"
          change="2 in progress"
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="Attention Items"
          value="3"
          change="Action needed"
          icon={AlertCircle}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Revenue View */}
        <div className="bg-cc-surface rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Revenue Streams</h2>
          <RevenueView />
        </div>

        {/* Attention Queue */}
        <div className="bg-cc-surface rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Needs Attention</h2>
          <AttentionQueue />
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  change: string
  icon: React.ComponentType<{ className?: string }>
  color: 'green' | 'blue' | 'purple' | 'yellow'
}

function StatCard({ title, value, change, icon: Icon, color }: StatCardProps) {
  const colors = {
    green: 'bg-green-500/10 text-green-400',
    blue: 'bg-blue-500/10 text-blue-400',
    purple: 'bg-purple-500/10 text-purple-400',
    yellow: 'bg-yellow-500/10 text-yellow-400',
  }

  return (
    <div className="bg-cc-surface rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-400">{title}</span>
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{change}</p>
    </div>
  )
}
