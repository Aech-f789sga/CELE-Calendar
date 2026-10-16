import React, { useState } from 'react';
import {
  Bell,
  Volume2,
  Smartphone,
  CheckCircle2,
  Play,
  Clock,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import type { Task } from '../types.ts';
import { soundPlayer, triggerDeviceNotification } from '../utils/alarm.ts';

interface SmartAlarmsViewProps {
  tasks: Task[];
  notificationPermission: NotificationPermission;
  onRequestNotificationPermission: () => void;
  onTriggerAlarmModal: (task: Task) => void;
}

export const SmartAlarmsView: React.FC<SmartAlarmsViewProps> = ({
  tasks,
  notificationPermission,
  onRequestNotificationPermission,
  onTriggerAlarmModal,
}) => {
  const [selectedSound, setSelectedSound] = useState<'gentle' | 'alert' | 'complete'>('gentle');

  const handleTestSound = (type: 'gentle' | 'alert' | 'complete') => {
    setSelectedSound(type);
    soundPlayer.playZenChime(type);
  };

  const handleTestNotification = () => {
    soundPlayer.playZenChime('alert');
    triggerDeviceNotification(
      '⏰ Chronos Smart Reminder',
      'Upcoming: Engineering Deep Work starts in 10 minutes. Time to clear tabs and focus.'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`w-2 h-2 rounded-full ${
                notificationPermission === 'granted' ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Notification & Audio Alarm Engine
            </span>
          </div>
          <h2 className="text-xl font-semibold text-zinc-100">Smart Alarms & Reminders</h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Never miss scheduled calendar focus blocks or meeting start times. Get native browser
            and phone notifications paired with harmonic zen audio chimes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {notificationPermission !== 'granted' ? (
            <button
              type="button"
              onClick={onRequestNotificationPermission}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-xl text-xs shadow-sm transition-all cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>Enable Device Notifications</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Notifications Active</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleTestNotification}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4 text-emerald-400" />
            <span>Test Push & Alarm</span>
          </button>
        </div>
      </div>

      {/* Sound synthesizer tester */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>Soothing Alarm Chime Synthesizer</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Built with the native Web Audio API: harmonic sine wave synthesis designed to be gentle
              and non-jarring.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: 'gentle' as const,
              name: 'Mindful Zen Bell',
              desc: 'Subtle E5 to C5 harmonic decay. Ideal for deep work transitions.',
            },
            {
              id: 'alert' as const,
              name: 'Temple Tri-Tone',
              desc: 'Three resonant ascending bell chimes for urgent schedule starts.',
            },
            {
              id: 'complete' as const,
              name: 'Celebration Chord',
              desc: 'Uplifting C-major harmonic flourish on task completion.',
            },
          ].map((snd) => (
            <div
              key={snd.id}
              className={`p-4 rounded-xl border transition-all ${
                selectedSound === snd.id
                  ? 'bg-zinc-900 border-emerald-500/40'
                  : 'bg-zinc-950/40 border-zinc-800/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-zinc-200">{snd.name}</h4>
                <button
                  type="button"
                  onClick={() => handleTestSound(snd.id)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-colors cursor-pointer"
                  aria-label={`Play ${snd.name}`}
                >
                  <Play className="w-3 h-3 fill-emerald-400" />
                  <span>Listen</span>
                </button>
              </div>
              <p className="text-xs text-zinc-400">{snd.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scheduled Alarms for Today */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Today's Alarm Schedule Queue</span>
          </h3>
          <span className="text-xs text-zinc-500">
            {tasks.filter((t) => !t.completed).length} pending reminders
          </span>
        </div>

        <div className="space-y-2.5">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                task.completed
                  ? 'bg-zinc-950/20 border-zinc-900 opacity-60'
                  : 'bg-zinc-950/60 border-zinc-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${
                    task.completed
                      ? 'bg-zinc-800 text-zinc-500'
                      : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4
                    className={`text-xs sm:text-sm font-medium ${
                      task.completed ? 'line-through text-zinc-500' : 'text-zinc-200'
                    }`}
                  >
                    {task.title}
                  </h4>
                  <p className="text-[11px] text-zinc-500 flex items-center gap-2 mt-0.5">
                    <span>Starts at {task.startTime}</span>
                    <span>•</span>
                    <span className="text-zinc-400">
                      Alarm set {task.reminderMinutesBefore}m before
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onTriggerAlarmModal(task)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium border border-zinc-700/60 transition-colors cursor-pointer"
                  aria-label={`Simulate alarm trigger for "${task.title}"`}
                >
                  Trigger Alarm Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
