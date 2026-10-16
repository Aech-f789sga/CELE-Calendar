import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  AlertCircle,
  Bell,
  Trash2,
  Search,
  Filter,
  Plus,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import type { Task, TaskCategory, TaskPriority } from '../types.ts';
import { getCategoryBadgeColor } from '../utils/calendar.ts';

interface DailyTasksViewProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenAddTask: () => void;
  onOpenCalendarSync: () => void;
  onTriggerAlarmForTask: (task: Task) => void;
  onUpdateReminderMinutes: (taskId: string, minutes: number) => void;
}

export const DailyTasksView: React.FC<DailyTasksViewProps> = ({
  tasks,
  onToggleTask,
  onDeleteTask,
  onOpenAddTask,
  onOpenCalendarSync,
  onTriggerAlarmForTask,
  onUpdateReminderMinutes,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'calendar' | 'deep-work'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('list');

  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      const matchNotes = task.notes?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchNotes) return false;
    }

    // Filter tab
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    if (filter === 'calendar') return !!task.isCalendarEvent;
    if (filter === 'deep-work') return task.category === 'deep-work';
    return true;
  });

  // Sort by start time
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    return a.startTime.localeCompare(b.startTime);
  });

  return (
    <div className="space-y-6">
      {/* Progress & Focus Banner */}
      <div className="rounded-2xl border border-zinc-800/80 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Daily Completion
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-xs text-zinc-400">Target: 70%+ for streak</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-zinc-100">
              {completionPercentage >= 70
                ? 'Streak Goal Achieved! 🌟'
                : completionPercentage > 0
                ? 'Great progress, keep flowing.'
                : 'Plan your day & begin focused work.'}
            </h2>
            <p className="text-xs text-zinc-400">
              {completedCount} of {totalCount} scheduled tasks finished ({completionPercentage}%)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenCalendarSync}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-200 text-xs font-medium transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Import Calendar</span>
            </button>
            <button
              type="button"
              onClick={onOpenAddTask}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-2 w-full bg-zinc-800/80 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 ease-out"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, meetings, deep work..."
            className="w-full bg-zinc-900/90 border border-zinc-800 text-zinc-200 pl-9 pr-4 py-2 rounded-xl text-xs placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'pending', label: 'Pending' },
              { id: 'completed', label: 'Completed' },
              { id: 'deep-work', label: 'Deep Work' },
              { id: 'calendar', label: 'Calendar' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === item.id
                  ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task List / Timeline */}
      {sortedTasks.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800/60 flex items-center justify-center mx-auto mb-3 text-zinc-500">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-medium text-zinc-300">No tasks found</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'Try modifying your search query or clear the filter.'
              : 'You have no scheduled tasks for this filter. Import your Google Calendar schedule or create a new task.'}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              type="button"
              onClick={onOpenAddTask}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium text-xs rounded-xl transition-colors cursor-pointer"
            >
              Create Task
            </button>
            <button
              type="button"
              onClick={onOpenCalendarSync}
              className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs rounded-xl transition-colors"
            >
              Import from Calendar
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedTasks.map((task) => {
            const badgeStyle = getCategoryBadgeColor(task.category);

            return (
              <div
                key={task.id}
                className={`group rounded-xl border transition-all duration-200 ${
                  task.completed
                    ? 'bg-zinc-950/40 border-zinc-800/50 opacity-65'
                    : 'bg-zinc-900/70 border-zinc-800/80 hover:border-zinc-700 shadow-sm'
                }`}
              >
                <div className="p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                  {/* Left: Checkbox + Content */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => onToggleTask(task.id)}
                      className="mt-0.5 text-zinc-500 hover:text-emerald-400 transition-colors focus:outline-none cursor-pointer shrink-0"
                      aria-label={task.completed ? `Mark "${task.title}" as incomplete` : `Complete "${task.title}"`}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                      ) : (
                        <Circle className="w-5 h-5 text-zinc-500 hover:text-emerald-400" />
                      )}
                    </button>

                    {/* Task Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5">
                        {/* Time badge */}
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-300 px-2 py-0.5 rounded-md bg-zinc-800/80 border border-zinc-700/40">
                          <Clock className="w-3 h-3 text-zinc-500" />
                          {task.startTime} - {task.endTime}
                          <span className="text-zinc-500">({task.durationMinutes}m)</span>
                        </span>

                        {/* Category Badge */}
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-md border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badgeStyle.dot}`} />
                          {task.category.replace('-', ' ')}
                        </span>

                        {/* Priority pill */}
                        {task.priority === 'high' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md">
                            High Priority
                          </span>
                        )}

                        {/* Calendar event flag */}
                        {task.isCalendarEvent && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded-md">
                            <Calendar className="w-3 h-3" />
                            <span>Google Cal</span>
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h4
                        className={`text-sm sm:text-base font-medium text-zinc-100 ${
                          task.completed ? 'line-through text-zinc-500' : ''
                        }`}
                      >
                        {task.title}
                      </h4>

                      {/* Description */}
                      {task.description && (
                        <p className="text-xs text-zinc-400 mt-1">
                          {task.description}
                        </p>
                      )}

                      {/* Notes / Links */}
                      {task.notes && (
                        <div className="mt-2 text-[11px] text-zinc-500 flex items-center gap-1.5 bg-zinc-950/40 px-2.5 py-1 rounded-md border border-zinc-800/60 max-w-fit">
                          <span>{task.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right (or bottom on mobile): Alarm & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60 shrink-0">
                    <div className="flex items-center gap-1.5">
                      {/* Alarm test button */}
                      <button
                        type="button"
                        onClick={() => onTriggerAlarmForTask(task)}
                        className={`p-1.5 sm:p-2 rounded-lg border transition-colors ${
                          task.reminderTriggered
                            ? 'bg-zinc-900 border-zinc-800 text-zinc-600'
                            : 'bg-zinc-900/80 hover:bg-zinc-800 border-zinc-800 text-zinc-400 hover:text-emerald-400'
                        }`}
                        title={`Alarm: ${task.reminderMinutesBefore}m before. Click to test alarm chime.`}
                        aria-label={`Test alarm for "${task.title}"`}
                      >
                        <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>

                      {/* Reminder minutes dropdown */}
                      <select
                        value={task.reminderMinutesBefore}
                        onChange={(e) => onUpdateReminderMinutes(task.id, Number(e.target.value))}
                        className="bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-emerald-500/40"
                        aria-label="Alarm reminder lead time"
                      >
                        <option value={0}>At start</option>
                        <option value={5}>5m before</option>
                        <option value={10}>10m before</option>
                        <option value={15}>15m before</option>
                        <option value={30}>30m before</option>
                      </select>
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1.5 sm:p-2 text-zinc-500 hover:text-rose-400 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
                      title="Delete task"
                      aria-label={`Delete "${task.title}"`}
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
