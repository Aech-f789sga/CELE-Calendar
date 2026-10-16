import React from 'react';
import { Bell, Play, CheckCircle2, Circle, Flame, Sparkles, Plus, Calendar, Clock, RefreshCw, Smartphone } from 'lucide-react';
import type { Task, StreakData } from '../types.ts';
import type { User } from 'firebase/auth';

interface HomeScreenProps {
  tasks: Task[];
  streakData: StreakData;
  user: User | null;
  onOpenSession: (task: Task) => void;
  onToggleTask: (taskId: string) => void;
  onOpenQuickAdd: () => void;
  onOpenCalendar: () => void;
  onTriggerAlarmSound: () => void;
  onOpenFireStreakModal: () => void;
  onRefreshEvents: () => void;
  isLoadingEvents: boolean;
  syncSuccessNotice?: string | null;
  calendarSyncError?: string | null;
  lastSyncedTime?: string | null;
  onReconnectCalendar?: () => void;
  onOpenInstallModal?: () => void;
  isInstalled?: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  tasks,
  streakData,
  user,
  onOpenSession,
  onToggleTask,
  onOpenQuickAdd,
  onOpenCalendar,
  onTriggerAlarmSound,
  onOpenFireStreakModal,
  onRefreshEvents,
  isLoadingEvents,
  syncSuccessNotice,
  calendarSyncError,
  lastSyncedTime,
  onReconnectCalendar,
  onOpenInstallModal,
  isInstalled,
}) => {
  const userName = user?.displayName?.split(' ')[0] || (user?.email ? user.email.split('@')[0] : 'Mia');

  // Dynamic date header: "Fri, Oct 16"
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const pendingCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const meetingCount = tasks.filter((t) => t.category === 'meeting' && !t.completed).length;
  const isAllTasksCompleted = tasks.length > 0 && pendingCount === 0;

  // Format focus hours for today
  const totalFocusMinutes = tasks.reduce((acc, t) => acc + (t.durationMinutes || 30), 0);
  const hours = Math.floor(totalFocusMinutes / 60);
  const mins = totalFocusMinutes % 60;
  const todayDurationStr = `${hours}h ${mins}m`;

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#091122] via-[#0f2a52] to-[#0284c7] text-white flex flex-col justify-between select-none">
      {/* Top Half: Blue Atmospheric Header & Greeting */}
      <div className="px-6 pt-6 pb-6 space-y-5 max-w-md mx-auto w-full">
        {/* Top Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-white/95">{formattedDate}</span>
            {user ? (
              <button
                type="button"
                onClick={onRefreshEvents}
                disabled={isLoadingEvents}
                className="inline-flex items-center gap-1.5 text-[10px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full font-semibold transition-all cursor-pointer"
                title="Click to re-sync Google Calendar"
              >
                <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${isLoadingEvents ? 'animate-ping' : 'animate-pulse'}`} />
                <span>{isLoadingEvents ? 'Syncing...' : lastSyncedTime ? `Synced ${lastSyncedTime}` : 'Google Synced'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onReconnectCalendar || onRefreshEvents}
                className="inline-flex items-center gap-1 text-[10px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold cursor-pointer"
              >
                Connect Calendar
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onOpenInstallModal && (
              <button
                type="button"
                onClick={onOpenInstallModal}
                className="inline-flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 px-3 py-2 rounded-full font-semibold transition-all cursor-pointer shadow-sm text-white/95"
                title="Install Chronos Flow on Android / Vercel Guide"
                aria-label="Install app on phone"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-medium">{isInstalled ? 'App Guide' : 'Install App'}</span>
              </button>
            )}
            {user && (
              <button
                type="button"
                onClick={onRefreshEvents}
                disabled={isLoadingEvents}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/90 transition-all cursor-pointer shadow-sm"
                title="Refresh Google Calendar"
                aria-label="Refresh Google Calendar"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingEvents ? 'animate-spin text-sky-200' : ''}`} />
              </button>
            )}
            <button
              type="button"
              onClick={onTriggerAlarmSound}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/90 transition-all cursor-pointer shadow-sm"
              title="Notifications & Smart Alarms"
              aria-label="Alarm notifications"
            >
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Sync Error Alert with Reconnect Action */}
        {calendarSyncError && (
          <div className="px-4 py-2.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between gap-3 animate-in fade-in">
            <span className="truncate">⚠️ {calendarSyncError}</span>
            {onReconnectCalendar && (
              <button
                type="button"
                onClick={onReconnectCalendar}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-bold text-[11px] transition-colors cursor-pointer"
              >
                Reconnect
              </button>
            )}
          </div>
        )}

        {/* Sync Success banner if recently updated */}
        {syncSuccessNotice && (
          <div className="px-3.5 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between animate-in fade-in">
            <span>{syncSuccessNotice}</span>
          </div>
        )}

        {/* Hero Conversational Greeting Typography */}
        <div className="space-y-2.5 pt-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Good morning, {userName}!
            <br />
            {isAllTasksCompleted ? (
              <span className="text-amber-300">
                You completed all {completedCount} tasks for today! Ready to celebrate? 🔥
              </span>
            ) : (
              <>
                You have <span className="inline-flex items-center text-sky-200">📋 {pendingCount} tasks</span>{' '}
                planned for today, including{' '}
                <span className="inline-flex items-center text-sky-200">📹 {meetingCount} meeting</span>.
                Ready to begin? 🚀
              </>
            )}
          </h1>

          {/* Micro summary stats line & interactive Duolingo fire button */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3 text-xs font-medium text-white/80">
              <span>
                Today: <strong className="text-white font-bold">{todayDurationStr}</strong>
              </span>
              <span className="text-white/40">•</span>
              <button
                type="button"
                onClick={onOpenFireStreakModal}
                className="group flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/25 hover:bg-amber-500/40 border border-amber-400/50 text-amber-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
                title="View Duolingo-style fire streak"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 group-hover:scale-110 transition-transform animate-pulse" />
                <span>Streak: {streakData.currentStreak || 6} days</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Action Badges */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-semibold backdrop-blur-md transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
          <button
            type="button"
            onClick={onOpenCalendar}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white/90 text-xs font-medium backdrop-blur-md transition-all cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Calendar View</span>
          </button>
          <button
            type="button"
            onClick={onOpenFireStreakModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-500/30 to-amber-500/30 hover:from-orange-500/40 hover:to-amber-500/40 border border-amber-500/40 text-amber-200 text-xs font-bold backdrop-blur-md transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Streak Flame</span>
          </button>
        </div>
      </div>

      {/* Bottom Half: Dark Curved Card for Sessions */}
      <div className="flex-1 rounded-t-[36px] bg-zinc-950 px-6 pt-7 pb-28 border-t border-white/10 shadow-2xl">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">Sessions</h2>
            <span className="text-xs text-zinc-500">
              {completedCount}/{tasks.length} completed
            </span>
          </div>

          {/* Sessions List */}
          <div className="space-y-3">
            {tasks.map((task, index) => {
              // Format time display
              const durationDisplays = ['02:37:06', '02:23:42', '01:15:30', '00:45:00', '00:30:00'];
              const timerDisplay =
                task.durationMinutes
                  ? `${String(Math.floor(task.durationMinutes / 60)).padStart(2, '0')}:${String(
                      task.durationMinutes % 60
                    ).padStart(2, '0')}:00`
                  : durationDisplays[index % durationDisplays.length];

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-4 ${
                    task.completed
                      ? 'bg-zinc-900/40 border-zinc-900 opacity-60'
                      : 'bg-zinc-900/80 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => onToggleTask(task.id)}
                      className="text-zinc-500 hover:text-emerald-400 transition-colors focus:outline-none cursor-pointer shrink-0"
                      aria-label={`Complete ${task.title}`}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                      ) : (
                        <Circle className="w-5 h-5 text-zinc-500 hover:text-emerald-400" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {task.startTime} - {task.endTime}
                        </span>
                        {task.isCalendarEvent && (
                          <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                            Google Cal
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-sm font-medium truncate ${
                          task.completed ? 'text-zinc-500 line-through' : 'text-zinc-200'
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="text-base font-bold text-white font-mono tracking-tight mt-0.5">
                        {timerDisplay}
                      </p>
                    </div>
                  </div>

                  {/* Circular Play Button to Launch Session Screen */}
                  <button
                    type="button"
                    onClick={() => onOpenSession(task)}
                    className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-white hover:text-zinc-950 text-white flex items-center justify-center transition-all cursor-pointer shadow-md shrink-0 group"
                    title={`Start Focus Session on "${task.title}"`}
                    aria-label={`Start Focus Session on "${task.title}"`}
                  >
                    <Play className="w-4 h-4 fill-current stroke-none ml-0.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
