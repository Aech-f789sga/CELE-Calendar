import React, { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import confetti from 'canvas-confetti';
import type { GoogleCalendarEvent, StreakData, Task } from './types.ts';
import {
  getInitialMockTasks,
  getMockCalendarEvents,
  getInitialStreakData,
  getTodayDateString,
} from './data/mockData.ts';
import { updateStreakRecord } from './utils/streak.ts';
import { convertEventToTask } from './utils/calendar.ts';
import {
  soundPlayer,
  requestNotificationPermission,
  triggerDeviceNotification,
  isTaskDueForReminder,
} from './utils/alarm.ts';
import { initAuth, googleSignIn, logout } from './services/firebaseAuth.ts';
import {
  fetchCalendarEvents,
  fetchCalendarEventsForMonth,
  createGoogleCalendarEvent,
} from './services/googleCalendar.ts';
import { usePWAInstall } from './hooks/usePWAInstall.ts';

// New Screens matching reference mockup
import { FloatingNavBar, type AppScreen } from './components/FloatingNavBar.tsx';
import { HomeScreen } from './components/HomeScreen.tsx';
import { CalendarScreen } from './components/CalendarScreen.tsx';
import { SessionScreen } from './components/SessionScreen.tsx';
import { AnalyticsScreen } from './components/AnalyticsScreen.tsx';
import { SettingsScreen } from './components/SettingsScreen.tsx';

// Modals
import { AlarmModal } from './components/AlarmModal.tsx';
import { QuickAddTaskModal } from './components/QuickAddTaskModal.tsx';
import { GoogleCalendarEventModal } from './components/GoogleCalendarEventModal.tsx';
import { PWAInstallModal } from './components/PWAInstallModal.tsx';
import { FireStreakModal } from './components/FireStreakModal.tsx';
import { OfflineIndicator } from './components/OfflineIndicator.tsx';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<AppScreen>('home');
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [syncSuccessNotice, setSyncSuccessNotice] = useState<string | null>(null);
  const [calendarSyncError, setCalendarSyncError] = useState<string | null>(null);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);

  // Core application data
  const [tasks, setTasks] = useState<Task[]>(() => getInitialMockTasks());
  const [calendarEvents, setCalendarEvents] = useState<GoogleCalendarEvent[]>(() =>
    getMockCalendarEvents()
  );
  const [streakData, setStreakData] = useState<StreakData>(() => getInitialStreakData());

  // Active Session Task
  const [activeSessionTask, setActiveSessionTask] = useState<Task | null>(() => tasks[0] || null);

  // Notification state
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  // Modals state
  const [activeAlarmTask, setActiveAlarmTask] = useState<Task | null>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isCreateGoogleEventOpen, setIsCreateGoogleEventOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isFireStreakOpen, setIsFireStreakOpen] = useState(false);

  // PWA Install state
  const { isInstalled } = usePWAInstall();

  // Helper to sync and apply Google Calendar events directly into tasks
  const syncGoogleCalendarAndApplyTasks = async (
    targetDateStr: string = getTodayDateString(),
    silent = false
  ) => {
    if (!silent) setIsLoadingEvents(true);
    setCalendarSyncError(null);

    try {
      const events = await fetchCalendarEvents(targetDateStr);
      setCalendarEvents(events);

      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSyncedTime(currentTime);

      if (events && events.length > 0) {
        // Automatically convert and integrate Google Calendar events into daily tasks
        const gcalTasks = events.map((evt) => convertEventToTask(evt, 10));

        setTasks((prev) => {
          // Keep user-created tasks that are not from Google Calendar
          const userCustomTasks = prev.filter((t) => !t.isCalendarEvent);

          // Preserve completion states if a task was already completed today
          const mergedGcalTasks = gcalTasks.map((newTask) => {
            const existing = prev.find(
              (p) => p.calendarEventId === newTask.calendarEventId || p.id === newTask.id
            );
            if (existing && existing.completed) {
              return { ...newTask, completed: true, completedAt: existing.completedAt };
            }
            return newTask;
          });

          return [...mergedGcalTasks, ...userCustomTasks];
        });

        // Set active session task to first upcoming event
        if (gcalTasks[0]) {
          setActiveSessionTask(gcalTasks[0]);
        }

        setSyncSuccessNotice(`✓ Synced ${events.length} Google Calendar event(s) at ${currentTime}`);
        setTimeout(() => setSyncSuccessNotice(null), 5000);
      } else {
        setSyncSuccessNotice(`✓ Google Calendar connected (0 events today, synced at ${currentTime})`);
        setTimeout(() => setSyncSuccessNotice(null), 5000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google Calendar sync error';
      console.warn('Calendar sync notice:', msg);
      setCalendarSyncError(msg);
    } finally {
      if (!silent) setIsLoadingEvents(false);
    }
  };

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      async (authedUser, token) => {
        setUser(authedUser);
        if (token || authedUser) {
          await syncGoogleCalendarAndApplyTasks();
        }
      },
      () => {
        setUser(null);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Auto-sync whenever user returns to the tab/window from Google Calendar
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        syncGoogleCalendarAndApplyTasks(getTodayDateString(), true);
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  // Periodic background auto-sync every 45 seconds when connected
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      syncGoogleCalendarAndApplyTasks(getTodayDateString(), true);
    }, 45000);
    return () => clearInterval(interval);
  }, [user]);

  // Periodic alarm checker (every 10 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const todayDateStr = getTodayDateString();

      const dueTask = tasks.find((t) => isTaskDueForReminder(t, currentTimeStr, todayDateStr));

      if (dueTask) {
        setTasks((prev) =>
          prev.map((t) => (t.id === dueTask.id ? { ...t, reminderTriggered: true } : t))
        );

        soundPlayer.playZenChime('alert');
        triggerDeviceNotification(
          `⏰ Reminder: ${dueTask.title}`,
          `Scheduled for ${dueTask.startTime}. Tap to view task details and actions.`
        );

        setActiveAlarmTask(dueTask);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [tasks]);

  // Request notifications permission
  const handleRequestNotificationPermission = async () => {
    const perm = await requestNotificationPermission();
    setNotificationPermission(perm);
    if (perm === 'granted') {
      soundPlayer.playZenChime('gentle');
      triggerDeviceNotification(
        'Chronos Flow Notifications Enabled',
        'Smart alarms and focus reminders are now active on your device.'
      );
    }
  };

  // Google sign in with immediate calendar schedule sync
  const handleLogin = async () => {
    setIsLoggingIn(true);
    setCalendarSyncError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        await syncGoogleCalendarAndApplyTasks();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google Sign In failed';
      console.error('Google Sign In error:', msg);
      setCalendarSyncError(msg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    await logout();
    setUser(null);
    setCalendarSyncError(null);
    setSyncSuccessNotice(null);
  };

  // Refresh calendar events
  const handleRefreshEvents = async () => {
    if (!user) {
      await handleLogin();
      return;
    }
    await syncGoogleCalendarAndApplyTasks();
  };

  // Fetch events for any specific date on the calendar
  const handleFetchEventsForDate = async (dateStr: string): Promise<GoogleCalendarEvent[]> => {
    if (!user) return [];
    try {
      return await fetchCalendarEvents(dateStr);
    } catch {
      return [];
    }
  };

  // Toggle task complete / incomplete + check for Duolingo fire streak trigger!
  const handleToggleTask = (taskId: string) => {
    const today = getTodayDateString();

    setTasks((prevTasks) => {
      let isNowAllTasksCompleted = false;

      const updated = prevTasks.map((t) => {
        if (t.id === taskId) {
          const willComplete = !t.completed;
          if (willComplete) {
            soundPlayer.playZenChime('complete');
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#38bdf8', '#fbbf24', '#f97316', '#10b981'],
            });
          }
          return {
            ...t,
            completed: willComplete,
            completedAt: willComplete
              ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : undefined,
          };
        }
        return t;
      });

      // Check if all tasks for today are now completed
      const remainingIncomplete = updated.filter((t) => !t.completed).length;
      if (remainingIncomplete === 0 && updated.length > 0) {
        isNowAllTasksCompleted = true;
      }

      // Update streak
      setStreakData((prevStreak) => {
        const nextStreak = updateStreakRecord(prevStreak, updated, today);
        return nextStreak;
      });

      // Trigger the Duolingo Fire Streak Animation if all tasks are complete!
      if (isNowAllTasksCompleted) {
        setTimeout(() => {
          setIsFireStreakOpen(true);
        }, 350);
      }

      return updated;
    });
  };

  // Add task
  const handleAddTask = async (
    taskData: Omit<Task, 'id' | 'completed' | 'reminderTriggered'> & {
      syncToGoogleCalendar?: boolean;
    }
  ) => {
    const today = getTodayDateString();
    let calendarEventId: string | undefined = undefined;

    if (taskData.syncToGoogleCalendar && user) {
      try {
        const createdEvt = await createGoogleCalendarEvent(
          taskData.title,
          taskData.date,
          taskData.startTime,
          taskData.endTime,
          taskData.description
        );
        calendarEventId = createdEvt.id;
      } catch (err) {
        console.warn('Could not sync newly created task to Google Calendar:', err);
      }
    }

    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      completed: false,
      isCalendarEvent: !!calendarEventId,
      calendarEventId,
    };

    setTasks((prev) => {
      const updated = [newTask, ...prev];
      setStreakData((prevStreak) => updateStreakRecord(prevStreak, updated, today));
      return updated;
    });

    soundPlayer.playZenChime('gentle');
  };

  // Open focus session screen
  const handleOpenSession = (task: Task) => {
    setActiveSessionTask(task);
    setActiveScreen('session');
  };

  // Trigger test alarm
  const handleTriggerAlarmSound = () => {
    soundPlayer.playZenChime('alert');
    triggerDeviceNotification(
      '⏰ Smart Reminder: Team Sync',
      'Starts in 10 minutes. Click to launch focus session.'
    );
    if (tasks.length > 0) {
      setActiveAlarmTask(tasks[0]);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-amber-500/20 selection:text-amber-300">
      {/* Dynamic View rendering matching the reference mockup */}
      {activeScreen === 'home' && (
        <HomeScreen
          tasks={tasks}
          streakData={streakData}
          user={user}
          onOpenSession={handleOpenSession}
          onToggleTask={handleToggleTask}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          onOpenCalendar={() => setActiveScreen('calendar')}
          onTriggerAlarmSound={handleTriggerAlarmSound}
          onOpenFireStreakModal={() => setIsFireStreakOpen(true)}
          onRefreshEvents={handleRefreshEvents}
          isLoadingEvents={isLoadingEvents}
          syncSuccessNotice={syncSuccessNotice}
          calendarSyncError={calendarSyncError}
          lastSyncedTime={lastSyncedTime}
          onReconnectCalendar={handleLogin}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
          isInstalled={isInstalled}
        />
      )}

      {activeScreen === 'calendar' && (
        <CalendarScreen
          tasks={tasks}
          calendarEvents={calendarEvents}
          user={user}
          onRefreshEvents={handleRefreshEvents}
          isLoadingEvents={isLoadingEvents}
          onOpenSession={handleOpenSession}
          onOpenAddEventModal={() => setIsCreateGoogleEventOpen(true)}
          onTriggerAlarmSound={handleTriggerAlarmSound}
          onFetchEventsForDate={handleFetchEventsForDate}
          lastSyncedTime={lastSyncedTime}
          calendarSyncError={calendarSyncError}
          onReconnectCalendar={handleLogin}
        />
      )}

      {activeScreen === 'session' && (
        <SessionScreen
          activeTask={activeSessionTask}
          onClose={() => setActiveScreen('home')}
          onCompleteTask={(id) => {
            handleToggleTask(id);
            setActiveScreen('home');
          }}
          allTasks={tasks}
          onSelectTask={(task) => setActiveSessionTask(task)}
        />
      )}

      {activeScreen === 'analytics' && (
        <AnalyticsScreen
          streakData={streakData}
          tasks={tasks}
          onTriggerAlarmSound={handleTriggerAlarmSound}
        />
      )}

      {activeScreen === 'settings' && (
        <SettingsScreen
          user={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
          isLoggingIn={isLoggingIn}
          notificationPermission={notificationPermission}
          onRequestNotificationPermission={handleRequestNotificationPermission}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
          isInstalled={isInstalled}
          streakData={streakData}
          onTriggerAlarmSound={handleTriggerAlarmSound}
        />
      )}

      {/* Signature Floating Frosted Pill Nav Bar shown across all screens */}
      <FloatingNavBar
        activeScreen={activeScreen}
        onChangeScreen={setActiveScreen}
        isSessionRunning={activeScreen === 'session'}
      />

      {/* Duolingo Fire Streak Celebration Modal */}
      <FireStreakModal
        isOpen={isFireStreakOpen}
        onClose={() => setIsFireStreakOpen(false)}
        streakCount={streakData.currentStreak}
      />

      {/* Offline Status Toast */}
      <OfflineIndicator />

      {/* PWA Native App Install Modal */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Active Alarm Modal */}
      <AlarmModal
        task={activeAlarmTask}
        isOpen={!!activeAlarmTask}
        onClose={() => setActiveAlarmTask(null)}
        onCompleteTask={(taskId) => handleToggleTask(taskId)}
        onSnoozeTask={(taskId, mins) => {
          setTasks((prev) =>
            prev.map((t) => (t.id === taskId ? { ...t, reminderTriggered: false } : t))
          );
        }}
      />

      {/* Quick Add Task Modal */}
      <QuickAddTaskModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onAddTask={handleAddTask}
        isCalendarConnected={!!user}
      />

      {/* Google Calendar Create Event Modal */}
      <GoogleCalendarEventModal
        isOpen={isCreateGoogleEventOpen}
        onClose={() => setIsCreateGoogleEventOpen(false)}
        onConfirmCreateEvent={async (title, date, startTime, endTime, desc) => {
          if (!user) {
            await handleLogin();
          }
          await createGoogleCalendarEvent(title, date, startTime, endTime, desc);
          await syncGoogleCalendarAndApplyTasks();
        }}
      />
    </div>
  );
}
