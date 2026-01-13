/**
 * GoalProgressBar Component
 *
 * Displays progress toward the 100M ARR goal with visual progress bar.
 */

import { Target, TrendingUp } from 'lucide-react';
import type { GoalProgress } from '../../hooks/useRevenue';

interface GoalProgressBarProps {
  goalProgress: GoalProgress | null;
  isLoading?: boolean;
}

export default function GoalProgressBar({ goalProgress, isLoading }: GoalProgressBarProps) {
  if (isLoading) {
    return (
      <div className="bg-cc-surface rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-2/3"></div>
      </div>
    );
  }

  if (!goalProgress) {
    return (
      <div className="bg-cc-surface rounded-lg p-6">
        <div className="flex items-center gap-3 text-gray-400">
          <Target className="w-5 h-5" />
          <p className="text-sm">Goal progress unavailable</p>
        </div>
      </div>
    );
  }

  const progressPercent = Math.min(goalProgress.progress_percent, 100);
  const currentARR = goalProgress.current_arr;
  const targetARR = goalProgress.target_arr;
  const gap = goalProgress.gap;

  return (
    <div className="bg-cc-surface rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cc-accent/20 rounded-lg">
            <Target className="w-5 h-5 text-cc-accent" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">ARR Goal Progress</h3>
            <p className="text-sm text-gray-400">Target: ${(targetARR / 1000000).toFixed(0)}M ARR</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-cc-accent">{progressPercent.toFixed(1)}%</p>
          <p className="text-xs text-gray-400">Complete</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cc-accent to-green-400 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-gray-400 mb-1">Current ARR</p>
          <p className="text-lg font-semibold text-white">
            ${(currentARR / 1000000).toFixed(2)}M
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Remaining</p>
          <p className="text-lg font-semibold text-yellow-400">
            ${(gap / 1000000).toFixed(2)}M
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Monthly Growth Needed</p>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <p className="text-lg font-semibold text-green-400">
              ${(goalProgress.monthly_growth_needed / 1000).toFixed(0)}k
            </p>
          </div>
        </div>
      </div>

      {/* Projection */}
      {goalProgress.projected_months_to_goal > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-sm text-gray-400">
            At current growth rate, projected to reach goal in{' '}
            <span className="text-white font-medium">
              {goalProgress.projected_months_to_goal} months
            </span>
            {' '}({Math.floor(goalProgress.projected_months_to_goal / 12)} years,{' '}
            {goalProgress.projected_months_to_goal % 12} months)
          </p>
        </div>
      )}
    </div>
  );
}
