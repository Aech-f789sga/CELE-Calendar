import React, { useState } from 'react';
import { X, Calendar, AlertCircle } from 'lucide-react';

interface GoogleCalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmCreateEvent: (title: string, date: string, startTime: string, endTime: string, desc?: string) => Promise<void>;
}

export const GoogleCalendarEventModal: React.FC<GoogleCalendarEventModalProps> = ({
  isOpen,
  onClose,
  onConfirmCreateEvent,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('15:00');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter an event summary.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onConfirmCreateEvent(title.trim(), date, startTime, endTime, description.trim() || undefined);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create event on Google Calendar';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="google-event-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
    >
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6 shadow-2xl space-y-4 scrollbar-none">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <h3 id="google-event-title" className="text-base font-semibold text-zinc-100">
              Create Event on Google Calendar
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

        {/* Explicit confirmation notice */}
        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            With your permission, this action will create a new schedule block on your primary Google
            Calendar account.
          </span>
        </div>

        {error && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="calendar-event-title" className="block text-xs font-medium text-zinc-300 mb-1">
              Event Title <span className="text-rose-400">*</span>
            </label>
            <input
              id="calendar-event-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Strategic Roadmap Review"
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 px-3 py-2 rounded-xl text-xs placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="calendar-event-date" className="block text-xs font-medium text-zinc-300 mb-1">
                Date
              </label>
              <input
                id="calendar-event-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label htmlFor="calendar-event-start" className="block text-xs font-medium text-zinc-300 mb-1">
                Start Time
              </label>
              <input
                id="calendar-event-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label htmlFor="calendar-event-end" className="block text-xs font-medium text-zinc-300 mb-1">
                End Time
              </label>
              <input
                id="calendar-event-end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div>
            <label htmlFor="calendar-event-desc" className="block text-xs font-medium text-zinc-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              id="calendar-event-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Event agenda, details..."
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 px-3 py-2 rounded-xl text-xs placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 rounded-xl hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-zinc-950 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Creating on Google...' : 'Confirm & Add to Calendar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
