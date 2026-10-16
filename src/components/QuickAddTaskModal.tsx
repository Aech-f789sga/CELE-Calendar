import React, { useState } from 'react';
import { X, Clock, Calendar, Sparkles } from 'lucide-react';
import type { Task, TaskCategory, TaskPriority } from '../types.ts';
import { calculateDurationMinutes } from '../utils/calendar.ts';

interface QuickAddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (
    taskData: Omit<Task, 'id' | 'completed' | 'reminderTriggered'> & {
      syncToGoogleCalendar?: boolean;
    }
  ) => void;
  isCalendarConnected: boolean;
}

export const QuickAddTaskModal: React.FC<QuickAddTaskModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  isCalendarConnected,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('deep-work');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState(10);
  const [syncToCalendar, setSyncToCalendar] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a task title.');
      return;
    }

    const durationMinutes = calculateDurationMinutes(startTime, endTime);

    onAddTask({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      priority,
      date: todayStr,
      startTime,
      endTime,
      durationMinutes,
      reminderMinutesBefore,
      syncToGoogleCalendar: syncToCalendar && isCalendarConnected,
    });

    setTitle('');
    setDescription('');
    setError(null);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-task-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
    >
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6 shadow-2xl space-y-4 scrollbar-none">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <h3 id="new-task-modal-title" className="text-base font-semibold text-zinc-100">
              Create New Daily Task
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-200 rounded-lg"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="task-title-input" className="block text-xs font-medium text-zinc-300 mb-1">
              Task Title <span className="text-rose-400">*</span>
            </label>
            <input
              id="task-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Deep Focus: Refactor Auth Service"
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 px-3 py-2 rounded-xl text-xs placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="task-desc-input" className="block text-xs font-medium text-zinc-300 mb-1">
              Description / Notes (Optional)
            </label>
            <textarea
              id="task-desc-input"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key objectives, agenda, links..."
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 px-3 py-2 rounded-xl text-xs placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 resize-none"
            />
          </div>

          {/* Times & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="start-time-input" className="block text-xs font-medium text-zinc-300 mb-1">
                Start Time
              </label>
              <input
                id="start-time-input"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label htmlFor="end-time-input" className="block text-xs font-medium text-zinc-300 mb-1">
                End Time
              </label>
              <input
                id="end-time-input"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="category-select" className="block text-xs font-medium text-zinc-300 mb-1">
                Category
              </label>
              <select
                id="category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500/50"
              >
                <option value="deep-work">Deep Focus</option>
                <option value="meeting">Meeting & Sync</option>
                <option value="admin">Admin & Ops</option>
                <option value="wellness">Wellness & Break</option>
                <option value="personal">Personal</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority-select" className="block text-xs font-medium text-zinc-300 mb-1">
                Priority
              </label>
              <select
                id="priority-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500/50"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          {/* Reminder offset */}
          <div>
            <label htmlFor="reminder-offset-select" className="block text-xs font-medium text-zinc-300 mb-1">
              Alarm Reminder
            </label>
            <select
              id="reminder-offset-select"
              value={reminderMinutesBefore}
              onChange={(e) => setReminderMinutesBefore(Number(e.target.value))}
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500/50"
            >
              <option value={0}>At Start Time</option>
              <option value={5}>5 Minutes Before</option>
              <option value={10}>10 Minutes Before</option>
              <option value={15}>15 Minutes Before</option>
              <option value={30}>30 Minutes Before</option>
            </select>
          </div>

          {/* Optional Calendar push checkbox */}
          {isCalendarConnected && (
            <label className="flex items-center gap-2 pt-1 text-xs text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={syncToCalendar}
                onChange={(e) => setSyncToCalendar(e.target.checked)}
                className="accent-emerald-500 rounded"
              />
              <span>Also add as an event to my connected Google Calendar</span>
            </label>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 rounded-xl hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-zinc-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
