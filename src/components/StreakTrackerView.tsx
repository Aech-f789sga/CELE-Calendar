import React, { useState } from 'react';
import { Flame, Award, Shield, CheckCircle2, Trophy, Sparkles, Calendar } from 'lucide-react';
import type { StreakData } from '../types.ts';
import { getStreakBadge } from '../utils/streak.ts';
import confetti from 'canvas-confetti';
import { soundPlayer } from '../utils/alarm.ts';

interface StreakTrackerViewProps {
  streakData: StreakData;
  todayCompletedCount: number;
  todayTotalCount: number;
}

export const StreakTrackerView: React.FC<StreakTrackerViewProps> = ({
  streakData,
  todayCompletedCount,
  todayTotalCount,
}) => {
  const [selectedDay, setSelectedDay] = useState<{
    date: string;
    total: number;
    completed: number;
    percentage: number;
  } | null>(null);

  const badge = getStreakBadge(streakData.currentStreak);
  const todayPercentage =
    todayTotalCount > 0 ? Math.round((todayCompletedCount / todayTotalCount) * 100) : 0;
  const isGoalReached = todayPercentage >= 70;

  const handleCelebrate = () => {
    soundPlayer.playZenChime('complete');
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#34d399', '#6ee7b7', '#a78bfa', '#fbbf24'],
    });
  };

  // Convert history entries into sorted array of past 35 days
  const historyEntries = Object.entries(streakData.history)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .slice(-35);

  const getHeatmapColor = (percentage: number, total: number) => {
    if (total === 0) return 'bg-zinc-900/60 border-zinc-800/80 text-zinc-600';
    if (percentage >= 90) return 'bg-emerald-400 border-emerald-300 text-zinc-950 font-bold';
    if (percentage >= 70) return 'bg-emerald-500/60 border-emerald-400/80 text-zinc-100';
    if (percentage >= 40) return 'bg-emerald-600/30 border-emerald-600/50 text-emerald-200';
    return 'bg-amber-500/20 border-amber-500/40 text-amber-300';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Big Streak Hero */}
      <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-b from-amber-500/10 via-zinc-900/60 to-zinc-900 p-6 sm:p-8 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Flame className="w-10 h-10 text-amber-400 fill-amber-400/40 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-100">
                  {streakData.currentStreak}
                </span>
                <span className="text-lg sm:text-xl font-medium text-amber-400/90">
                  Day Streak
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {badge.emoji} {badge.title}
                </span>
                <span className="text-xs text-zinc-400">
                  Best: <strong className="text-zinc-200">{streakData.longestStreak} days</strong>
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-2 max-w-md">{badge.description}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={handleCelebrate}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Celebrate Streak</span>
            </button>
          </div>
        </div>

        {/* Today's Goal Progress Bar */}
        <div className="mt-6 pt-6 border-t border-zinc-800/80">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-2 text-zinc-300 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Today’s Target (70%+ for streak protection)</span>
            </div>
            <span
              className={`font-semibold ${
                isGoalReached ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {todayCompletedCount}/{todayTotalCount} tasks ({todayPercentage}%)
            </span>
          </div>
          <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isGoalReached
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-amber-500 to-amber-400'
              }`}
              style={{ width: `${Math.min(100, todayPercentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 35-Day Consistency Heatmap Grid */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>35-Day Consistency Matrix</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Visual log of daily task completion percentage over the past 5 weeks.
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
            <span>Less</span>
            <span className="w-3 h-3 rounded-sm bg-zinc-800 border border-zinc-700/50" />
            <span className="w-3 h-3 rounded-sm bg-emerald-500/30 border border-emerald-500/50" />
            <span className="w-3 h-3 rounded-sm bg-emerald-500/70 border border-emerald-500" />
            <span className="w-3 h-3 rounded-sm bg-emerald-400 border border-emerald-300" />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-7 sm:grid-cols-7 gap-2 pt-2">
          {historyEntries.map(([date, data]) => {
            const dateObj = new Date(date + 'T12:00:00Z');
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'narrow' });
            const dayNum = dateObj.getDate();
            const colorClass = getHeatmapColor(data.percentage, data.total);

            return (
              <button
                key={date}
                type="button"
                onClick={() => setSelectedDay({ date, ...data })}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-center cursor-pointer hover:scale-105 ${colorClass}`}
                title={`${date}: ${data.completed}/${data.total} tasks (${data.percentage}%)`}
              >
                <span className="text-[10px] uppercase font-bold opacity-75">{dayName}</span>
                <span className="text-xs font-semibold">{dayNum}</span>
                <span className="text-[9px] mt-0.5 opacity-90">{data.percentage}%</span>
              </button>
            );
          })}
        </div>

        {/* Day Detail inspector */}
        {selectedDay && (
          <div className="mt-4 p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between text-xs animate-in fade-in">
            <div>
              <span className="font-semibold text-zinc-200">{selectedDay.date}: </span>
              <span className="text-zinc-400">
                {selectedDay.completed} of {selectedDay.total} tasks completed (
                <strong className="text-emerald-400">{selectedDay.percentage}%</strong>)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedDay(null)}
              className="text-zinc-500 hover:text-zinc-300 text-xs px-2 py-0.5"
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* Streak Milestones Guide */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            days: '3 Days',
            title: 'Ignition',
            desc: 'Form the initial habit loop',
            achieved: streakData.currentStreak >= 3,
          },
          {
            days: '7 Days',
            title: 'Momentum Builder',
            desc: 'One full unbroken week',
            achieved: streakData.currentStreak >= 7,
          },
          {
            days: '14 Days',
            title: 'Flow State Master',
            desc: 'Sustained cognitive flow',
            achieved: streakData.currentStreak >= 14,
          },
          {
            days: '30 Days',
            title: 'Titan of Consistency',
            desc: 'Permanent productivity lifestyle',
            achieved: streakData.currentStreak >= 30,
          },
        ].map((milestone) => (
          <div
            key={milestone.title}
            className={`p-4 rounded-2xl border transition-all ${
              milestone.achieved
                ? 'bg-zinc-900/80 border-emerald-500/30 shadow-sm'
                : 'bg-zinc-950/30 border-zinc-800/50 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-emerald-400">{milestone.days}</span>
              {milestone.achieved && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
              )}
            </div>
            <h4 className="text-sm font-semibold text-zinc-200">{milestone.title}</h4>
            <p className="text-xs text-zinc-400 mt-1">{milestone.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
