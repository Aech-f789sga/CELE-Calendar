import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Bell, Calendar as CalIcon, Clock, Plus, RefreshCw, Check, Sparkles, MapPin, Video } from 'lucide-react';
import type { GoogleCalendarEvent, Task } from '../types.ts';
import type { User } from 'firebase/auth';
import { formatTime, calculateDurationMinutes, categorizeEvent, getCategoryBadgeColor } from '../utils/calendar.ts';

interface CalendarScreenProps {
  tasks: Task[];
  calendarEvents: GoogleCalendarEvent[];
  user: User | null;
  onRefreshEvents: () => void;
  isLoadingEvents: boolean;
  onOpenSession: (task: Task) => void;
  onOpenAddEventModal: () => void;
  onTriggerAlarmSound: () => void;
  onFetchEventsForDate?: (dateStr: string) => Promise<GoogleCalendarEvent[]>;
  lastSyncedTime?: string | null;
  calendarSyncError?: string | null;
  onReconnectCalendar?: () => void;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({
  tasks,
  calendarEvents,
  user,
  onRefreshEvents,
  isLoadingEvents,
  onOpenSession,
  onOpenAddEventModal,
  onTriggerAlarmSound,
  onFetchEventsForDate,
  lastSyncedTime,
  calendarSyncError,
  onReconnectCalendar,
}) => {
  const today = new Date();
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate());
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(today.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedDayEvents, setSelectedDayEvents] = useState<GoogleCalendarEvent[]>(calendarEvents);
  const [isFetchingDate, setIsFetchingDate] = useState<boolean>(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handlePrevMonth = () => {
    if (selectedMonthIndex === 0) {
      setSelectedMonthIndex(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonthIndex((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonthIndex === 11) {
      setSelectedMonthIndex(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonthIndex((m) => m + 1);
    }
  };

  // Days in selected month
  const daysInMonth = new Date(selectedYear, selectedMonthIndex + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // When date selection changes
  useEffect(() => {
    const monthStr = String(selectedMonthIndex + 1).padStart(2, '0');
    const dayStr = String(selectedDay).padStart(2, '0');
    const dateStr = `${selectedYear}-${monthStr}-${dayStr}`;

    const isToday =
      selectedYear === today.getFullYear() &&
      selectedMonthIndex === today.getMonth() &&
      selectedDay === today.getDate();

    // Check if we already have matching events in calendarEvents
    const matchingEvents = calendarEvents.filter((evt) => {
      const s = evt.start?.dateTime || evt.start?.date || '';
      return s.startsWith(dateStr);
    });

    if (matchingEvents.length > 0) {
      setSelectedDayEvents(matchingEvents);
      return;
    }

    if (isToday && calendarEvents.length > 0) {
      setSelectedDayEvents(calendarEvents);
      return;
    }

    if (user && onFetchEventsForDate) {
      setIsFetchingDate(true);
      onFetchEventsForDate(dateStr)
        .then((evts) => {
          if (evts && evts.length > 0) {
            setSelectedDayEvents(evts);
          } else {
            // Check tasks for this date
            const matchingTasks = tasks.filter((t) => t.date === dateStr);
            if (matchingTasks.length > 0) {
              setSelectedDayEvents(
                matchingTasks.map((t) => ({
                  id: t.id,
                  summary: t.title,
                  description: t.description,
                  start: { dateTime: `${dateStr}T${t.startTime}:00` },
                  end: { dateTime: `${dateStr}T${t.endTime}:00` },
                  location: t.notes,
                }))
              );
            } else {
              setSelectedDayEvents([]);
            }
          }
        })
        .catch(() => {
          setSelectedDayEvents(calendarEvents);
        })
        .finally(() => {
          setIsFetchingDate(false);
        });
    } else {
      // Filter existing tasks matching this date
      const matchingTasks = tasks.filter((t) => t.date === dateStr);
      if (matchingTasks.length > 0) {
        setSelectedDayEvents(
          matchingTasks.map((t) => ({
            id: t.id,
            summary: t.title,
            description: t.description,
            start: { dateTime: `${dateStr}T${t.startTime}:00` },
            end: { dateTime: `${dateStr}T${t.endTime}:00` },
            location: t.notes,
          }))
        );
      } else if (isToday) {
        setSelectedDayEvents(calendarEvents);
      } else {
        setSelectedDayEvents([]);
      }
    }
  }, [selectedDay, selectedMonthIndex, selectedYear, calendarEvents, tasks, user]);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#2b0804] via-[#7c1d06] to-[#ea580c] text-white flex flex-col items-center justify-start px-4 sm:px-6 pt-6 pb-28 select-none">
      <div className="w-full max-w-md space-y-5">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">Calendar</h1>
            <p className="text-[11px] text-white/70">
              {user ? `Connected to ${user.email}` : 'Google Calendar Ready'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefreshEvents}
              disabled={isLoadingEvents}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/90 transition-all cursor-pointer shadow-sm"
              title="Sync Google Calendar"
              aria-label="Sync Google Calendar"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingEvents ? 'animate-spin text-amber-300' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onTriggerAlarmSound}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/90 transition-all cursor-pointer shadow-sm"
              title="Notifications & Alarms"
              aria-label="Alarm notifications"
            >
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sync Status Pill */}
        <div className="space-y-2">
          {calendarSyncError && (
            <div className="px-3.5 py-2 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between gap-2">
              <span className="truncate">⚠️ {calendarSyncError}</span>
              {onReconnectCalendar && (
                <button
                  type="button"
                  onClick={onReconnectCalendar}
                  className="px-2 py-0.5 rounded bg-rose-500 text-white font-bold text-[10px]"
                >
                  Reconnect
                </button>
              )}
            </div>
          )}

          <div className="flex items-center justify-between px-3 py-1.5 rounded-2xl bg-black/25 backdrop-blur-md border border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${user ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-white/90 font-medium">
                {isLoadingEvents || isFetchingDate
                  ? 'Updating schedules...'
                  : user
                  ? `${selectedDayEvents.length} event(s) • ${lastSyncedTime ? `Synced ${lastSyncedTime}` : 'Active'}`
                  : 'Demo mode • Connect Google Calendar to auto-sync'}
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenAddEventModal}
              className="text-[11px] font-bold text-amber-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Event</span>
            </button>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between px-2 text-white/90 font-medium">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5 text-white/70" />
          </button>
          <span className="text-base font-semibold text-white tracking-wide">
            {months[selectedMonthIndex]} {selectedYear}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase tracking-wider text-white/60">
          <span>S</span>
          <span>M</span>
          <span className="text-white font-bold">T</span>
          <span>W</span>
          <span>T</span>
          <span>F</span>
          <span>S</span>
        </div>

        {/* Circular Days Grid */}
        <div className="grid grid-cols-7 gap-2 sm:gap-2.5 text-center">
          {days.map((d) => {
            const isSelected = d === selectedDay;
            // Mark days with circled style
            const isToday =
              d === today.getDate() &&
              selectedMonthIndex === today.getMonth() &&
              selectedYear === today.getFullYear();

            return (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDay(d)}
                className={`w-10 h-10 sm:w-11 sm:h-11 mx-auto rounded-full flex flex-col items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-950 text-white shadow-xl scale-110 ring-2 ring-white/60'
                    : isToday
                    ? 'border-2 border-amber-300 text-amber-200 font-bold'
                    : d <= 15
                    ? 'border border-white/60 text-white hover:bg-white/10'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{d}</span>
              </button>
            );
          })}
        </div>

        {/* Schedule Cards for Selected Date */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs text-white/70 px-1">
            <span className="font-semibold uppercase tracking-wider">
              {months[selectedMonthIndex]} {selectedDay} Schedule
            </span>
            <span>{selectedDayEvents.length} event(s)</span>
          </div>

          {selectedDayEvents.length === 0 ? (
            <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/15 text-center space-y-2">
              <CalIcon className="w-8 h-8 text-white/50 mx-auto" />
              <p className="text-sm font-medium text-white">No events scheduled for this day</p>
              <p className="text-xs text-white/60">
                Create a schedule or check another date.
              </p>
              <button
                type="button"
                onClick={onOpenAddEventModal}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-zinc-950 text-xs font-bold shadow-md hover:bg-amber-100 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Event</span>
              </button>
            </div>
          ) : (
            selectedDayEvents.map((evt, idx) => {
              const startRaw = evt.start.dateTime || evt.start.date || '';
              const endRaw = evt.end.dateTime || evt.end.date || '';
              const startTimeStr = formatTime(startRaw);
              const endTimeStr = formatTime(endRaw);
              const duration = calculateDurationMinutes(startRaw, endRaw);
              const category = categorizeEvent(evt.summary || '', evt.description);

              // Find or create associated task
              const matchingTask: Task = tasks.find(
                (t) => t.calendarEventId === evt.id || t.title === evt.summary
              ) || {
                id: `evt-${evt.id}`,
                title: evt.summary || 'Scheduled Event',
                description: evt.description,
                startTime: startTimeStr,
                endTime: endTimeStr,
                date: `${selectedYear}-${String(selectedMonthIndex + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`,
                durationMinutes: duration,
                category,
                priority: 'medium',
                completed: false,
                reminderMinutesBefore: 10,
              };

              return (
                <div
                  key={evt.id || idx}
                  onClick={() => onOpenSession(matchingTask)}
                  className="p-4 sm:p-5 rounded-3xl bg-white/15 backdrop-blur-xl border border-white/20 shadow-xl hover:bg-white/20 hover:scale-[1.01] transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/30 text-amber-200 border border-white/10">
                          {category.replace('-', ' ')}
                        </span>
                        {evt.location && (
                          <span className="text-[10px] text-white/70 flex items-center gap-1 truncate max-w-[150px]">
                            <MapPin className="w-3 h-3 text-amber-300" />
                            {evt.location}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-200 transition-colors truncate">
                        {evt.summary || 'Untitled Schedule'}
                      </h3>

                      {evt.description && (
                        <p className="text-xs text-white/70 mt-0.5 line-clamp-1">
                          {evt.description}
                        </p>
                      )}

                      <div className="flex items-center gap-6 mt-3 text-xs sm:text-sm">
                        <div>
                          <span className="block text-[10px] uppercase font-bold text-white/60">Start</span>
                          <span className="font-bold text-white text-sm sm:text-base">{startTimeStr}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase font-bold text-white/60">Finish</span>
                          <span className="font-bold text-white text-sm sm:text-base">{endTimeStr}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase font-bold text-white/60">Duration</span>
                          <span className="font-bold text-amber-300 text-sm sm:text-base">{duration}m</span>
                        </div>
                      </div>
                    </div>

                    {/* Avatar Badge Indicator */}
                    <div className="flex -space-x-2 overflow-hidden shrink-0 pt-1">
                      <div className="inline-block h-8 w-8 rounded-full ring-2 ring-amber-600 bg-sky-400 text-zinc-950 font-bold text-xs flex items-center justify-center shadow">
                        {evt.summary ? evt.summary.charAt(0) : 'G'}
                      </div>
                      <div className="inline-block h-8 w-8 rounded-full ring-2 ring-amber-600 bg-purple-500 text-white font-bold text-xs flex items-center justify-center shadow">
                        {category === 'meeting' ? '📹' : '⚡'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
