/**
 * ProjectRevenueModal Component
 *
 * Modal showing detailed revenue breakdown for a specific project.
 * Includes monthly revenue chart using recharts.
 */

import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ProjectRevenueDetails } from '../../hooks/useRevenue';

interface ProjectRevenueModalProps {
  project: ProjectRevenueDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectRevenueModal({ project, isOpen, onClose }: ProjectRevenueModalProps) {
  if (!isOpen || !project) return null;

  const statusConfig = {
    active: { label: 'Active', color: 'text-green-400', bg: 'bg-green-400/10' },
    pipeline: { label: 'Pipeline', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    'at-risk': { label: 'At Risk', color: 'text-red-400', bg: 'bg-red-400/10' },
    churned: { label: 'Churned', color: 'text-gray-400', bg: 'bg-gray-400/10' },
  };

  const config = statusConfig[project.status];

  // Prepare chart data
  const chartData = project.history.map((h) => ({
    month: h.period,
    revenue: h.revenue,
  }));

  // Calculate trend
  const latestRevenue = project.history[project.history.length - 1]?.revenue || 0;
  const previousRevenue = project.history[project.history.length - 2]?.revenue || latestRevenue;
  const trend = latestRevenue - previousRevenue;
  const trendPercent = previousRevenue > 0 ? ((trend / previousRevenue) * 100).toFixed(1) : '0';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-cc-surface rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-700">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white mb-2">{project.project_name}</h2>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 rounded text-xs ${config.bg} ${config.color}`}>
                {config.label}
              </span>
              <span className="text-sm text-gray-400">
                Started {new Date(project.start_date).toLocaleDateString()}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4 p-6 border-b border-gray-700">
          <div>
            <p className="text-sm text-gray-400 mb-1">Monthly Recurring Revenue</p>
            <p className="text-2xl font-bold text-white">${project.mrr.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Annual Recurring Revenue</p>
            <p className="text-2xl font-bold text-white">${project.arr.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Monthly Trend</p>
            <div className="flex items-center gap-2">
              <p className={`text-2xl font-bold ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {trend >= 0 ? '+' : ''}{trendPercent}%
              </p>
              {trend >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
            </div>
          </div>
        </div>

        {/* Monthly Revenue Chart */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Monthly Revenue History</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="month"
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF' }}
                  tickLine={{ stroke: '#9CA3AF' }}
                />
                <YAxis
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF' }}
                  tickLine={{ stroke: '#9CA3AF' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value: number | undefined) => value ? [`$${value.toLocaleString()}`, 'Revenue'] : ['N/A', 'Revenue']}
                  labelStyle={{ color: '#9CA3AF' }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: '#10B981', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Breakdown Table */}
        {project.history.length > 0 && (
          <div className="p-6 border-t border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Monthly Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-700">
                    <th className="pb-2">Period</th>
                    <th className="pb-2 text-right">Revenue</th>
                    <th className="pb-2 text-right">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {project.history.slice().reverse().map((month, idx, arr) => {
                    const prevMonth = arr[idx + 1];
                    const change = prevMonth ? month.revenue - prevMonth.revenue : 0;
                    const changePercent = prevMonth && prevMonth.revenue > 0
                      ? ((change / prevMonth.revenue) * 100).toFixed(1)
                      : '0';

                    return (
                      <tr key={month.period} className="border-b border-gray-800">
                        <td className="py-3 text-white">{month.period}</td>
                        <td className="py-3 text-right text-white font-medium">
                          ${month.revenue.toLocaleString()}
                        </td>
                        <td className="py-3 text-right">
                          {prevMonth && (
                            <span className={change >= 0 ? 'text-green-400' : 'text-red-400'}>
                              {change >= 0 ? '+' : ''}{changePercent}%
                            </span>
                          )}
                          {!prevMonth && <span className="text-gray-500">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
