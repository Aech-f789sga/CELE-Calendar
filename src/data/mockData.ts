import { GoogleCalendarEvent, StreakData, Task } from '../types.ts';

export const getTodayDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getInitialMockTasks = (): Task[] => {
  const today = getTodayDateString();

  return [
    {
      id: 'task-1',
      title: 'Deep Work: High-Performance Cache Layer',
      description: 'Implement distributed memory cache and optimize query response latency',
      startTime: '09:00',
      endTime: '10:30',
      date: today,
      durationMinutes: 90,
      category: 'deep-work',
      priority: 'high',
      completed: true,
      completedAt: '10:28',
      isCalendarEvent: true,
      calendarEventId: 'mock-evt-1',
      reminderMinutesBefore: 10,
      reminderTriggered: true,
      notes: 'Focus mode active. Target under 15ms p99 latency.',
    },
    {
      id: 'task-2',
      title: 'Product Sprint & UX Review Sync',
      description: 'Review interactive prototypes and align on upcoming milestone release',
      startTime: '11:00',
      endTime: '11:45',
      date: today,
      durationMinutes: 45,
      category: 'meeting',
      priority: 'medium',
      completed: true,
      completedAt: '11:43',
      isCalendarEvent: true,
      calendarEventId: 'mock-evt-2',
      reminderMinutesBefore: 5,
      reminderTriggered: true,
      notes: 'Meeting link: meet.google.com/xyz-flow-demo',
    },
    {
      id: 'task-3',
      title: 'Mindful Break & Outdoor Walk',
      description: 'Step away from screens, hydrate, and do a quick posture reset',
      startTime: '13:00',
      endTime: '13:30',
      date: today,
      durationMinutes: 30,
      category: 'wellness',
      priority: 'low',
      completed: false,
      isCalendarEvent: false,
      reminderMinutesBefore: 5,
      reminderTriggered: false,
      notes: 'Take 20 deep belly breaths and refill water bottle.',
    },
    {
      id: 'task-4',
      title: 'Code Review: OAuth Token Rotation',
      description: 'Conduct thorough security pass on refresh token rotation PRs',
      startTime: '14:30',
      endTime: '15:30',
      date: today,
      durationMinutes: 60,
      category: 'deep-work',
      priority: 'high',
      completed: false,
      isCalendarEvent: true,
      calendarEventId: 'mock-evt-3',
      reminderMinutesBefore: 10,
      reminderTriggered: false,
      notes: 'Check edge cases for token expiry during offline state.',
    },
    {
      id: 'task-5',
      title: 'Inbox Triage & Schedule Organization',
      description: 'Process incoming emails, update calendar blocks, and set tomorrow’s top 3 tasks',
      startTime: '16:30',
      endTime: '17:00',
      date: today,
      durationMinutes: 30,
      category: 'admin',
      priority: 'low',
      completed: false,
      isCalendarEvent: false,
      reminderMinutesBefore: 15,
      reminderTriggered: false,
      notes: 'Aim for Inbox Zero.',
    },
  ];
};

export const getMockCalendarEvents = (): GoogleCalendarEvent[] => {
  const today = getTodayDateString();

  return [
    {
      id: 'mock-gcal-101',
      summary: 'Q4 Product Roadmap & Key Results',
      description: 'Quarterly review with engineering and design team leads.',
      start: { dateTime: `${today}T10:00:00Z` },
      end: { dateTime: `${today}T11:00:00Z` },
      location: 'Google Meet (meet.google.com/prd-road-map)',
    },
    {
      id: 'mock-gcal-102',
      summary: 'Deep Work: Database Index Optimization',
      description: 'Analyze slow query logs and add composite indexes to PostgreSQL.',
      start: { dateTime: `${today}T13:30:00Z` },
      end: { dateTime: `${today}T15:00:00Z` },
    },
    {
      id: 'mock-gcal-103',
      summary: 'Weekly 1:1 Growth & Mentorship Sync',
      description: 'Bi-weekly check-in discussing career progress and project blockers.',
      start: { dateTime: `${today}T15:30:00Z` },
      end: { dateTime: `${today}T16:00:00Z` },
      location: 'Room 4B / Meet',
    },
    {
      id: 'mock-gcal-104',
      summary: 'Evening Run & Stretch Routine',
      description: '5k trail run followed by 10 minutes of mobility work.',
      start: { dateTime: `${today}T17:30:00Z` },
      end: { dateTime: `${today}T18:15:00Z` },
    },
  ];
};

export const getInitialStreakData = (): StreakData => {
  const today = getTodayDateString();
  const history: Record<string, { total: number; completed: number; percentage: number }> = {};

  const baseDate = new Date();
  // Generate 35 days of past history for rich heatmap & trend charts
  for (let i = 35; i >= 1; i--) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Seed realistic completions with 85% success rate for a 5-day active streak leading into today
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    let total = isWeekend ? 3 : 5;
    let completed = total;

    // Introduce a couple realistic lower days 2-3 weeks ago
    if (i === 7 || i === 18) {
      completed = Math.floor(total * 0.4); // Missed day
    } else {
      completed = Math.max(Math.floor(total * 0.8), total - (i % 2));
    }

    history[dateStr] = {
      total,
      completed,
      percentage: Math.round((completed / total) * 100),
    };
  }

  // Today initial
  history[today] = {
    total: 5,
    completed: 2,
    percentage: 40,
  };

  return {
    currentStreak: 6,
    longestStreak: 12,
    lastActiveDate: today,
    history,
    freezesRemaining: 2,
  };
};
