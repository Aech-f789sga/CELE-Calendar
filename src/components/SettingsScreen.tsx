import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Volume2,
  Calendar,
  Download,
  Flame,
  LogOut,
  Play,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  Info,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import type { StreakData } from '../types.ts';
import { soundPlayer } from '../utils/alarm.ts';

interface SettingsScreenProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  notificationPermission: NotificationPermission;
  onRequestNotificationPermission: () => void;
  onOpenInstallModal: () => void;
  isInstalled: boolean;
  streakData: StreakData;
  onTriggerAlarmSound: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  user,
  onLogin,
  onLogout,
  isLoggingIn,
  notificationPermission,
  onRequestNotificationPermission,
  onOpenInstallModal,
  isInstalled,
  streakData,
  onTriggerAlarmSound,
}) => {
  const [defaultReminderTime, setDefaultReminderTime] = useState<number>(10);

  return (
    <div className="relative min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-start px-4 sm:px-6 pt-6 pb-28 select-none">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">Settings</h1>
          <button
            type="button"
            onClick={onTriggerAlarmSound}
            className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white/90 hover:text-white transition-all cursor-pointer"
            aria-label="Test alarm sound"
          >
            <Bell className="w-5 h-5 text-emerald-400" />
          </button>
        </div>

        {/* Section 1: Google Calendar Account */}
        <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Google Calendar Sync</h3>
              <p className="text-xs text-zinc-400">
                {user ? `Connected: ${user.email}` : 'Sync your real schedule & meetings'}
              </p>
            </div>
          </div>

          {user ? (
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
              <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4" />
                Active OAuth Session
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-medium px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onLogin}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-60"
            >
              <span>{isLoggingIn ? 'Connecting to Google...' : 'Connect Google Calendar'}</span>
            </button>
          )}
        </div>

        {/* Section 2: Smart Alarms & Audio Chimes */}
        <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Smart Alarm Reminders</h3>
                <p className="text-xs text-zinc-400">Zen Web Audio & Phone Push</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onRequestNotificationPermission}
              className={`px-3 py-1 rounded-full text-xs font-medium border ${
                notificationPermission === 'granted'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300'
              }`}
            >
              {notificationPermission === 'granted' ? 'Enabled' : 'Enable'}
            </button>
          </div>

          {/* Test Chimes */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {[
              { id: 'gentle' as const, label: 'Zen Bell' },
              { id: 'alert' as const, label: 'Temple Tri-Tone' },
              { id: 'complete' as const, label: 'Celebration' },
            ].map((snd) => (
              <button
                key={snd.id}
                type="button"
                onClick={() => soundPlayer.playZenChime(snd.id)}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-zinc-800/70 hover:bg-zinc-800 border border-zinc-700/60 text-xs font-medium text-zinc-200 transition-colors cursor-pointer"
              >
                <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                <span>{snd.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section 3: Native App Installation & Continuous Updates */}
        <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Android App & Vercel Deploy</h3>
              <p className="text-xs text-zinc-400">
                {isInstalled ? 'Installed PWA • Auto-updates enabled' : 'Install on phone • Auto-updates enabled'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenInstallModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isInstalled ? 'Deploy & Setup' : 'Install & Guide'}</span>
          </button>
        </div>

        {/* Section 4: Streak & Habit Motivation */}
        <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Current Streak</h3>
              <p className="text-xs text-zinc-400">
                {streakData.currentStreak} consecutive days • Record: {streakData.longestStreak} days
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
