import React, { useEffect } from 'react';
import { Bell, Clock, CheckCircle2, X, Volume2 } from 'lucide-react';
import type { Task } from '../types.ts';
import { soundPlayer } from '../utils/alarm.ts';
import { getCategoryBadgeColor } from '../utils/calendar.ts';

interface AlarmModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onCompleteTask: (taskId: string) => void;
  onSnoozeTask: (taskId: string, minutes: number) => void;
}

export const AlarmModal: React.FC<AlarmModalProps> = ({
  task,
  isOpen,
  onClose,
  onCompleteTask,
  onSnoozeTask,
}) => {
  useEffect(() => {
    if (isOpen && task) {
      soundPlayer.playZenChime('alert');
    }
  }, [isOpen, task]);

  if (!isOpen || !task) return null;

  const badgeStyle = getCategoryBadgeColor(task.category);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="alarm-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
    >
      <div className="w-full max-w-md rounded-2xl border border-emerald-500/30 bg-zinc-900 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-bounce">
              <Bell className="w-5 h-5 fill-emerald-400/30" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                Smart Reminder Alarm
              </span>
              <h3 id="alarm-modal-title" className="text-lg font-semibold text-zinc-100">
                Time for Scheduled Task
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Dismiss alarm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Task Details Card */}
        <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-2">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
            >
              {task.category.replace('-', ' ')}
            </span>
            <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-zinc-500" />
              {task.startTime} - {task.endTime}
            </span>
          </div>
          <h4 className="text-base font-medium text-zinc-100">{task.title}</h4>
          {task.description && (
            <p className="text-xs text-zinc-400">{task.description}</p>
          )}
          {task.notes && (
            <p className="text-[11px] text-zinc-500 italic mt-1">{task.notes}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <button
            type="button"
            onClick={() => {
              onCompleteTask(task.id);
              onClose();
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Mark Done</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSnoozeTask(task.id, 5);
              onClose();
            }}
            className="px-3 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs border border-zinc-700/60 transition-colors cursor-pointer"
          >
            Snooze 5m
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 font-medium text-xs border border-zinc-800 transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
