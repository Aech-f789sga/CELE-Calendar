import type { GoogleCalendarEvent, Task, TaskCategory, TaskPriority } from '../types.ts';

export function categorizeEvent(summary: string, description?: string): TaskCategory {
  const text = `${summary} ${description || ''}`.toLowerCase();
  
  if (
    text.includes('deep work') ||
    text.includes('focus') ||
    text.includes('code') ||
    text.includes('coding') ||
    text.includes('write') ||
    text.includes('design') ||
    text.includes('research') ||
    text.includes('study') ||
    text.includes('feature') ||
    text.includes('architect')
  ) {
    return 'deep-work';
  }

  if (
    text.includes('meeting') ||
    text.includes('sync') ||
    text.includes('catch up') ||
    text.includes('standup') ||
    text.includes('1:1') ||
    text.includes('one-on-one') ||
    text.includes('call') ||
    text.includes('interview') ||
    text.includes('review') ||
    text.includes('huddle') ||
    text.includes('presentation')
  ) {
    return 'meeting';
  }

  if (
    text.includes('workout') ||
    text.includes('gym') ||
    text.includes('run') ||
    text.includes('walk') ||
    text.includes('lunch') ||
    text.includes('dinner') ||
    text.includes('breakfast') ||
    text.includes('meditation') ||
    text.includes('stretch') ||
    text.includes('doctor') ||
    text.includes('nap') ||
    text.includes('break')
  ) {
    return 'wellness';
  }

  if (
    text.includes('email') ||
    text.includes('inbox') ||
    text.includes('organize') ||
    text.includes('invoice') ||
    text.includes('bills') ||
    text.includes('triage') ||
    text.includes('schedule') ||
    text.includes('admin') ||
    text.includes('plan')
  ) {
    return 'admin';
  }

  return 'personal';
}

export function detectPriority(summary: string, durationMinutes: number): TaskPriority {
  const text = summary.toLowerCase();
  if (
    text.includes('urgent') ||
    text.includes('deadline') ||
    text.includes('important') ||
    text.includes('interview') ||
    text.includes('demo') ||
    text.includes('launch') ||
    text.includes('ceo') ||
    text.includes('client')
  ) {
    return 'high';
  }
  if (durationMinutes >= 60 || text.includes('sync') || text.includes('review')) {
    return 'medium';
  }
  return 'low';
}

export function calculateDurationMinutes(startIsoOrTime: string, endIsoOrTime: string): number {
  try {
    const startDate = new Date(startIsoOrTime);
    const endDate = new Date(endIsoOrTime);
    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      const diffMs = endDate.getTime() - startDate.getTime();
      return Math.max(5, Math.round(diffMs / (1000 * 60)));
    }
  } catch {
    // fallback to HH:mm parse
  }

  const [sh, sm] = startIsoOrTime.includes(':') ? startIsoOrTime.split(':').map(Number) : [9, 0];
  const [eh, em] = endIsoOrTime.includes(':') ? endIsoOrTime.split(':').map(Number) : [10, 0];
  const diffMinutes = (eh * 60 + em) - (sh * 60 + sm);
  return diffMinutes > 0 ? diffMinutes : 60;
}

export function formatTime(isoString: string): string {
  if (!isoString) return '09:00';
  if (/^\d{2}:\d{2}$/.test(isoString)) return isoString;
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoString)) return '09:00';

  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch {
    return isoString;
  }
}

export function extractDateString(isoString: string): string {
  if (!isoString) {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoString)) {
    return isoString;
  }
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}

export function convertEventToTask(
  event: GoogleCalendarEvent,
  defaultReminderMinutes = 10
): Task {
  const startRaw = event.start.dateTime || event.start.date || new Date().toISOString();
  const endRaw = event.end.dateTime || event.end.date || new Date(Date.now() + 3600000).toISOString();
  
  const startTime = formatTime(startRaw);
  const endTime = formatTime(endRaw);
  const date = extractDateString(startRaw);
  const durationMinutes = calculateDurationMinutes(startRaw, endRaw);
  const category = categorizeEvent(event.summary || 'Calendar Schedule', event.description);
  const priority = detectPriority(event.summary || '', durationMinutes);

  return {
    id: `gcal-${event.id}`,
    title: event.summary || 'Untitled Schedule',
    description: event.description || '',
    startTime,
    endTime,
    date,
    durationMinutes,
    category,
    priority,
    completed: false,
    isCalendarEvent: true,
    calendarEventId: event.id,
    reminderMinutesBefore: defaultReminderMinutes,
    notes: event.location ? `Location: ${event.location}` : undefined,
  };
}

export function getCategoryBadgeColor(category: TaskCategory): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (category) {
    case 'deep-work':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/20',
        dot: 'bg-emerald-400',
      };
    case 'meeting':
      return {
        bg: 'bg-indigo-500/10',
        text: 'text-indigo-400',
        border: 'border-indigo-500/20',
        dot: 'bg-indigo-400',
      };
    case 'admin':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/20',
        dot: 'bg-amber-400',
      };
    case 'wellness':
      return {
        bg: 'bg-teal-500/10',
        text: 'text-teal-400',
        border: 'border-teal-500/20',
        dot: 'bg-teal-400',
      };
    case 'personal':
    default:
      return {
        bg: 'bg-purple-500/10',
        text: 'text-purple-400',
        border: 'border-purple-500/20',
        dot: 'bg-purple-400',
      };
  }
}
