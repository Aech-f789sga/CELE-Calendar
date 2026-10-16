import React from 'react';
import { Sparkles, Calendar, Bell, Flame, LogOut, CheckCircle2, Download } from 'lucide-react';
import type { User } from 'firebase/auth';

interface NavbarProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  currentStreak: number;
  notificationPermission: NotificationPermission;
  onRequestNotificationPermission: () => void;
  onOpenQuickAdd: () => void;
  onTriggerTestAlarm: () => void;
  todayCompletedCount: number;
  todayTotalCount: number;
  onOpenInstallModal: () => void;
  isInstalled: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogin,
  onLogout,
  isLoggingIn,
  currentStreak,
  notificationPermission,
  onRequestNotificationPermission,
  onOpenQuickAdd,
  onTriggerTestAlarm,
  todayCompletedCount,
  todayTotalCount,
  onOpenInstallModal,
  isInstalled,
}) => {
  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 py-2.5 sm:py-0 flex items-center justify-between gap-2">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-indigo-500/20 border border-emerald-500/30 flex items-center justify-center shadow-inner shrink-0">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-zinc-100 tracking-tight text-base sm:text-lg">
                Chronos Flow
              </span>
              <span className="hidden xs:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                Zen
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 flex items-center gap-1">
              <span>{currentDateFormatted}</span>
              <span className="text-zinc-600">•</span>
              <span className="text-emerald-400/90 font-medium">
                {todayCompletedCount}/{todayTotalCount} done
              </span>
            </p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap justify-end">
          {/* Streak pill */}
          <div
            title={`Current Streak: ${currentStreak} days`}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
            <span className="font-semibold">{currentStreak}</span>
            <span className="hidden sm:inline text-amber-400/80">streak</span>
          </div>

          {/* Quick Alarm Test & Notification status */}
          <button
            type="button"
            onClick={
              notificationPermission === 'granted'
                ? onTriggerTestAlarm
                : onRequestNotificationPermission
            }
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              notificationPermission === 'granted'
                ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-emerald-400 hover:border-emerald-500/30'
                : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20'
            }`}
            title={
              notificationPermission === 'granted'
                ? 'Sound & Notifications enabled. Click to test alarm sound.'
                : 'Click to enable phone & browser notifications'
            }
            aria-label={
              notificationPermission === 'granted'
                ? 'Test alarm sound'
                : 'Enable notifications'
            }
          >
            <Bell className={`w-3.5 h-3.5 ${notificationPermission === 'granted' ? 'text-emerald-400' : 'text-indigo-400'}`} />
            <span className="hidden md:inline">
              {notificationPermission === 'granted' ? 'Test Alarm' : 'Enable Alarms'}
            </span>
          </button>

          {/* Add Task Quick button */}
          <button
            type="button"
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium text-xs shadow-sm shadow-emerald-500/20 transition-all cursor-pointer"
            aria-label="Add new daily task"
          >
            <span className="text-sm font-bold leading-none">+</span>
            <span className="hidden xs:inline font-semibold">Add Task</span>
          </button>

          {/* Install Native App button */}
          {!isInstalled && (
            <button
              type="button"
              onClick={onOpenInstallModal}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition-all cursor-pointer shadow-sm"
              title="Install Chronos Flow as a native application"
              aria-label="Install App"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline font-semibold">Install App</span>
            </button>
          )}

          {/* User / Google Sign-in */}
          {user ? (
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-zinc-800">
              <div className="flex items-center gap-1.5">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User profile'}
                    className="w-6 h-6 rounded-full border border-emerald-500/30"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <span className="hidden lg:inline text-xs font-medium text-zinc-300 truncate max-w-[120px]">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 rounded-lg transition-colors"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onLogin}
              disabled={isLoggingIn}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 rounded-lg text-xs font-medium transition-all shadow-sm cursor-pointer disabled:opacity-60"
              aria-label="Sign in with Google Calendar"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              <span className="hidden sm:inline">
                {isLoggingIn ? 'Connecting...' : 'Connect Calendar'}
              </span>
              <span className="sm:hidden">{isLoggingIn ? '...' : 'Sync'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
