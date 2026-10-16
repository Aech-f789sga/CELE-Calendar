export type TaskCategory = 'deep-work' | 'meeting' | 'admin' | 'wellness' | 'personal';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  description?: string;
  startTime: string; // ISO string or 'HH:mm'
  endTime: string; // ISO string or 'HH:mm'
  date: string; // 'YYYY-MM-DD'
  durationMinutes: number;
  category: TaskCategory;
  priority: TaskPriority;
  completed: boolean;
  completedAt?: string;
  isCalendarEvent?: boolean;
  calendarEventId?: string;
  reminderMinutesBefore: number; // e.g. 5, 10, 15
  reminderTriggered?: boolean;
  notes?: string;
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  location?: string;
  htmlLink?: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  history: Record<string, { total: number; completed: number; percentage: number }>;
  freezesRemaining: number;
}

export interface ProductivityTrend {
  date: string;
  completedTasks: number;
  totalTasks: number;
  completionRate: number;
  focusMinutes: number;
  meetingMinutes: number;
}

export interface CategoryDistribution {
  category: TaskCategory;
  label: string;
  minutes: number;
  percentage: number;
  color: string;
}
