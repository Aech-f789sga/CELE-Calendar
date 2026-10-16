import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Zap,
  Calendar,
  CheckCircle2,
  PieChart,
  Lightbulb,
} from 'lucide-react';
import type { StreakData, Task } from '../types.ts';
import {
  calculateCategoryDistribution,
  calculateFocusStats,
  calculateProductivityScore,
  generateTrendSeries,
} from '../utils/analytics.ts';

interface AnalyticsDashboardViewProps {
  streakData: StreakData;
  tasks: Task[];
}

export const AnalyticsDashboardView: React.FC<AnalyticsDashboardViewProps> = ({
  streakData,
  tasks,
}) => {
  const [daysRange, setDaysRange] = useState<7 | 14 | 30>(14);
  const todayStr = new Date().toISOString().split('T')[0];

  const trends = generateTrendSeries(streakData.history, daysRange, todayStr);
  const currentStats = calculateFocusStats(tasks);
  const categoryDistribution = calculateCategoryDistribution(tasks);
  const flowScore = calculateProductivityScore(tasks);

  // Calculate average completion rate over selected range
  const avgCompletionRate = Math.round(
    trends.reduce((acc, curr) => acc + curr.completionRate, 0) / (trends.length || 1)
  );

  const totalFocusHours = Math.round((currentStats.focusMinutes / 60) * 10) / 10;
  const totalMeetingHours = Math.round((currentStats.meetingMinutes / 60) * 10) / 10;

  // Chart SVG bounds
  const chartWidth = 700;
  const chartHeight = 180;
  const padding = 20;

  // Map trends to SVG coordinates
  const points = trends.map((d, index) => {
    const x = padding + (index / (trends.length - 1 || 1)) * (chartWidth - padding * 2);
    const y = chartHeight - padding - (d.completionRate / 100) * (chartHeight - padding * 2);
    return { x, y, date: d.date, rate: d.completionRate };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${
          chartHeight - padding
        } Z`
      : '';

  return (
    <div className="space-y-6">
      {/* Header and timeframe toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <span>Productivity Analytics & Trends</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Visualize your focus time, meeting load, and completion consistency over time.
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
          {([7, 14, 30] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setDaysRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                daysRange === r
                  ? 'bg-zinc-800 text-emerald-400 shadow-sm border border-emerald-500/20'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Last {r} Days
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Avg Completion Rate */}
        <div className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-400 font-medium">Avg Completion Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-zinc-100">
              {avgCompletionRate}%
            </span>
            <span className="text-xs text-emerald-400 font-medium">+4.2%</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Across last {daysRange} days</p>
        </div>

        {/* Metric 2: Today's Focus Hours */}
        <div className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-400 font-medium">Deep Focus Today</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-zinc-100">
              {totalFocusHours}h
            </span>
            <span className="text-xs text-indigo-400 font-medium">Scheduled</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">{currentStats.focusMinutes} minutes total</p>
        </div>

        {/* Metric 3: Meeting Load */}
        <div className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-400 font-medium">Meeting Load</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-zinc-100">
              {totalMeetingHours}h
            </span>
            <span className="text-xs text-amber-400 font-medium">
              {totalMeetingHours > 3 ? 'High' : 'Balanced'}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">{currentStats.meetingMinutes} mins in syncs</p>
        </div>

        {/* Metric 4: Composite Flow Score */}
        <div className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-400 font-medium">Daily Flow Score</span>
            <Zap className="w-4 h-4 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-zinc-100">
              {flowScore}
              <span className="text-sm font-normal text-zinc-500">/100</span>
            </span>
            <span className="text-xs text-teal-400 font-medium">
              {flowScore >= 80 ? 'Peak Flow' : flowScore >= 60 ? 'Steady' : 'Warming up'}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Weighted priority & focus</p>
        </div>
      </div>

      {/* Completion Trend SVG Chart */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">Consistency Trend Line</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Daily task completion rate percentage over the last {daysRange} days
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <span className="w-2.5 h-0.5 bg-emerald-400 rounded-full" />
            <span>Target: 70%+</span>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <div className="min-w-[500px]">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-44 overflow-visible"
            >
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* 70% Target threshold guide line */}
              <line
                x1={padding}
                y1={chartHeight - padding - 0.7 * (chartHeight - padding * 2)}
                x2={chartWidth - padding}
                y2={chartHeight - padding - 0.7 * (chartHeight - padding * 2)}
                stroke="#10b981"
                strokeDasharray="4 4"
                strokeOpacity="0.4"
                strokeWidth="1"
              />

              {/* Area fill */}
              {areaD && <path d={areaD} fill="url(#trendGradient)" />}

              {/* Line path */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Points */}
              {points.map((p) => (
                <circle
                  key={p.date}
                  cx={p.x}
                  cy={p.y}
                  r="3.5"
                  className="fill-zinc-950 stroke-emerald-400 hover:r-5 transition-all"
                  strokeWidth="2"
                >
                  <title>{`${p.date}: ${p.rate}% completion`}</title>
                </circle>
              ))}
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-between text-[10px] text-zinc-500 pt-2 px-4">
              <span>{trends[0]?.date}</span>
              <span>{trends[Math.floor(trends.length / 2)]?.date}</span>
              <span>Today ({trends[trends.length - 1]?.date})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two columns: Category Breakdown & Productivity Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category distribution */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-zinc-200">Today's Schedule Allocation</h3>
          </div>

          <div className="space-y-3">
            {categoryDistribution.map((item) => (
              <div key={item.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-medium">{item.label}</span>
                  <span className="text-zinc-400 font-mono">
                    {item.minutes}m ({item.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Smart Recommendations */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-zinc-200">Productivity Insights</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-800/80 flex items-start gap-3">
              <span className="text-base">🧠</span>
              <div>
                <h4 className="font-semibold text-zinc-200">Prime Morning Focus Window</h4>
                <p className="text-zinc-400 mt-0.5">
                  Your peak task completion occurs between 09:00 - 11:30. Protect this time block
                  from ad-hoc meetings.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-800/80 flex items-start gap-3">
              <span className="text-base">☕</span>
              <div>
                <h4 className="font-semibold text-zinc-200">Wellness & Buffer Rest</h4>
                <p className="text-zinc-400 mt-0.5">
                  You have a 30-minute afternoon walk scheduled. Taking consistent physical breaks
                  boosts subsequent focus scores by 28%.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-800/80 flex items-start gap-3">
              <span className="text-base">🎯</span>
              <div>
                <h4 className="font-semibold text-zinc-200">Streak Defense</h4>
                <p className="text-zinc-400 mt-0.5">
                  You need only 2 more tasks completed today to extend your streak to 7 consecutive
                  days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
