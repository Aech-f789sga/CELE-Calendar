import React from 'react';
import { BarChart3, TrendingUp, Clock, Zap, Flame, Calendar, Award } from 'lucide-react';
import type { StreakData, Task } from '../types.ts';
import { calculateCategoryDistribution, calculateFocusStats, calculateProductivityScore, generateTrendSeries } from '../utils/analytics.ts';

interface AnalyticsScreenProps {
  streakData: StreakData;
  tasks: Task[];
  onTriggerAlarmSound: () => void;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({
  streakData,
  tasks,
  onTriggerAlarmSound,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const trends = generateTrendSeries(streakData.history, 14, todayStr);
  const currentStats = calculateFocusStats(tasks);
  const categoryDistribution = calculateCategoryDistribution(tasks);
  const flowScore = calculateProductivityScore(tasks);

  const totalFocusHours = Math.round((currentStats.focusMinutes / 60) * 10) / 10;
  const totalMeetingHours = Math.round((currentStats.meetingMinutes / 60) * 10) / 10;

  // SVG Chart bounds
  const chartWidth = 360;
  const chartHeight = 130;
  const padding = 15;

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
    <div className="relative min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-start px-4 sm:px-6 pt-6 pb-28 select-none">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">Analytics</h1>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold">
            Score: {flowScore}/100
          </span>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-3xl bg-zinc-900/80 border border-zinc-800/80">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="text-[11px] font-semibold uppercase">Focus Time</span>
              <Clock className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-bold text-white">{totalFocusHours}h</div>
            <p className="text-[10px] text-zinc-500 mt-0.5">Deep focus today</p>
          </div>

          <div className="p-4 rounded-3xl bg-zinc-900/80 border border-zinc-800/80">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="text-[11px] font-semibold uppercase">Meetings</span>
              <Calendar className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white">{totalMeetingHours}h</div>
            <p className="text-[10px] text-zinc-500 mt-0.5">Schedule load</p>
          </div>

          <div className="p-4 rounded-3xl bg-zinc-900/80 border border-zinc-800/80">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="text-[11px] font-semibold uppercase">Streak</span>
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400/30" />
            </div>
            <div className="text-2xl font-bold text-white">{streakData.currentStreak}d</div>
            <p className="text-[10px] text-zinc-500 mt-0.5">Best: {streakData.longestStreak} days</p>
          </div>

          <div className="p-4 rounded-3xl bg-zinc-900/80 border border-zinc-800/80">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="text-[11px] font-semibold uppercase">Success Rate</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white">88%</div>
            <p className="text-[10px] text-zinc-500 mt-0.5">Last 14 days</p>
          </div>
        </div>

        {/* 14-Day Consistency Curve */}
        <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">14-Day Completion Trend</h3>
            <span className="text-[11px] text-emerald-400 font-medium">Goal: 70%+</span>
          </div>

          <div className="w-full overflow-hidden">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-32 overflow-visible">
              <defs>
                <linearGradient id="anGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Guide line */}
              <line
                x1={padding}
                y1={chartHeight - padding - 0.7 * (chartHeight - padding * 2)}
                x2={chartWidth - padding}
                y2={chartHeight - padding - 0.7 * (chartHeight - padding * 2)}
                stroke="#38bdf8"
                strokeDasharray="3 3"
                strokeOpacity="0.3"
                strokeWidth="1"
              />

              {areaD && <path d={areaD} fill="url(#anGrad)" />}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {points.map((p) => (
                <circle
                  key={p.date}
                  cx={p.x}
                  cy={p.y}
                  r="3"
                  className="fill-zinc-950 stroke-sky-400"
                  strokeWidth="2"
                />
              ))}
            </svg>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 space-y-3">
          <h3 className="text-sm font-bold text-white">Schedule Allocation</h3>
          <div className="space-y-2.5">
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
      </div>
    </div>
  );
};
