import React, { useState } from 'react';
import {
  Calendar,
  RefreshCw,
  Check,
  Plus,
  Clock,
  ExternalLink,
  ShieldCheck,
  Sliders,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';
import type { GoogleCalendarEvent, Task } from '../types.ts';
import { categorizeEvent, calculateDurationMinutes, formatTime, getCategoryBadgeColor } from '../utils/calendar.ts';
import type { User } from 'firebase/auth';

interface CalendarSyncViewProps {
  user: User | null;
  calendarEvents: GoogleCalendarEvent[];
  isLoadingEvents: boolean;
  onRefreshEvents: () => void;
  onImportEventsAsTasks: (
    events: GoogleCalendarEvent[],
    options: { addPrepTime: boolean; defaultReminder: number }
  ) => void;
  onLogin: () => void;
  onOpenCreateGoogleEventModal: () => void;
}

export const CalendarSyncView: React.FC<CalendarSyncViewProps> = ({
  user,
  calendarEvents,
  isLoadingEvents,
  onRefreshEvents,
  onImportEventsAsTasks,
  onLogin,
  onOpenCreateGoogleEventModal,
}) => {
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>(
    calendarEvents.map((e) => e.id)
  );
  const [addPrepTime, setAddPrepTime] = useState<boolean>(true);
  const [defaultReminder, setDefaultReminder] = useState<number>(10);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  const toggleSelectEvent = (id: string) => {
    setSelectedEventIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedEventIds(calendarEvents.map((e) => e.id));
  };

  const deselectAll = () => {
    setSelectedEventIds([]);
  };

  const handleApplyToDailyList = () => {
    const toImport = calendarEvents.filter((e) => selectedEventIds.includes(e.id));
    if (toImport.length === 0) return;

    onImportEventsAsTasks(toImport, { addPrepTime, defaultReminder });
    setImportSuccessMessage(`Successfully applied ${toImport.length} calendar schedule(s) to your daily tasks!`);
    setTimeout(() => setImportSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Sync Status Header */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`w-2 h-2 rounded-full ${
                user ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              {user ? 'Google Calendar Connected' : 'Demo Schedule Mode'}
            </span>
          </div>
          <h2 className="text-xl font-semibold text-zinc-100">
            {user
              ? `Synced with ${user.email}`
              : 'Connect your Google Calendar or test with demo schedules'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Import your scheduled appointments, meetings, and focus blocks into productive daily
            action items with automatic time estimation and smart reminder alarms.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {user ? (
            <button
              type="button"
              onClick={onRefreshEvents}
              disabled={isLoadingEvents}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingEvents ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{isLoadingEvents ? 'Syncing...' : 'Sync Calendar'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onLogin}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-xl text-xs shadow-sm transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Sign in with Google</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenCreateGoogleEventModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Google Event</span>
          </button>
        </div>
      </div>

      {/* Success notification banner */}
      {importSuccessMessage && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 flex items-center justify-between text-emerald-300 text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{importSuccessMessage}</span>
          </div>
        </div>
      )}

      {/* Conversion Options Card */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-zinc-200">Smart Conversion Options</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="text-xs text-zinc-400 hover:text-emerald-400 transition-colors"
            >
              Select All
            </button>
            <span className="text-zinc-600">•</span>
            <button
              type="button"
              onClick={deselectAll}
              className="text-xs text-zinc-400 hover:text-rose-400 transition-colors"
            >
              Deselect All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Prep time toggle */}
          <label className="flex items-start gap-3 p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60 cursor-pointer hover:border-zinc-700">
            <input
              type="checkbox"
              checked={addPrepTime}
              onChange={(e) => setAddPrepTime(e.target.checked)}
              className="mt-1 accent-emerald-500 rounded"
            />
            <div>
              <div className="text-xs font-medium text-zinc-200">
                Generate 10-Minute Meeting Preparation Checklists
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                Automatically attaches prep notes and agenda check to meeting schedules.
              </div>
            </div>
          </label>

          {/* Default reminder */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60">
            <div>
              <div className="text-xs font-medium text-zinc-200">Default Alarm Reminder</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                Smart audio chime & notification before event
              </div>
            </div>
            <select
              value={defaultReminder}
              onChange={(e) => setDefaultReminder(Number(e.target.value))}
              className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500/50"
            >
              <option value={0}>At start</option>
              <option value={5}>5m before</option>
              <option value={10}>10m before</option>
              <option value={15}>15m before</option>
              <option value={30}>30m before</option>
            </select>
          </div>
        </div>

        {/* Apply Action */}
        <div className="mt-4 pt-4 border-t border-zinc-800/60 flex items-center justify-between">
          <span className="text-xs text-zinc-400">
            {selectedEventIds.length} event(s) selected
          </span>
          <button
            type="button"
            onClick={handleApplyToDailyList}
            disabled={selectedEventIds.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 text-zinc-950 font-semibold rounded-xl text-xs shadow-sm transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Apply Selected to Daily Tasks</span>
          </button>
        </div>
      </div>

      {/* Calendar Events List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
          <span>Today's Calendar Schedules</span>
          <span className="text-xs font-normal text-zinc-500">
            ({calendarEvents.length} detected)
          </span>
        </h3>

        {calendarEvents.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-8 text-center">
            <Calendar className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-xs text-zinc-400">No events found for today on this calendar.</p>
          </div>
        ) : (
          calendarEvents.map((evt) => {
            const isSelected = selectedEventIds.includes(evt.id);
            const startRaw = evt.start.dateTime || evt.start.date || '';
            const endRaw = evt.end.dateTime || evt.end.date || '';
            const startTimeStr = formatTime(startRaw);
            const endTimeStr = formatTime(endRaw);
            const duration = calculateDurationMinutes(startRaw, endRaw);
            const category = categorizeEvent(evt.summary || '', evt.description);
            const badgeStyle = getCategoryBadgeColor(category);

            return (
              <div
                key={evt.id}
                onClick={() => toggleSelectEvent(evt.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-900/90 border-emerald-500/40 shadow-sm'
                    : 'bg-zinc-950/40 border-zinc-800/60 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="pt-0.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectEvent(evt.id)}
                      className="accent-emerald-500 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-300 px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700/50">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        {startTimeStr} - {endTimeStr} ({duration}m)
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 text-[10px] uppercase font-medium px-2 py-0.5 rounded border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badgeStyle.dot}`} />
                        {category.replace('-', ' ')}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-zinc-100">{evt.summary}</h4>

                    {evt.description && (
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                        {evt.description}
                      </p>
                    )}

                    {evt.location && (
                      <p className="text-[11px] text-zinc-500 mt-1.5 flex items-center gap-1">
                        <span>📍 {evt.location}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
