import test from 'node:test';
import assert from 'node:assert/strict';
import { categorizeEvent, detectPriority, calculateDurationMinutes, convertEventToTask } from '../utils/calendar.ts';
import { calculateCompletionPercentage, isDaySuccessful, computeStreakMetrics } from '../utils/streak.ts';
import { calculateProductivityScore, calculateFocusStats } from '../utils/analytics.ts';
import { parseTimeToMinutes, getMinutesDifference, isTaskDueForReminder } from '../utils/alarm.ts';
import type { Task, GoogleCalendarEvent } from '../types.ts';

test('calendar categorization categorizes events accurately', () => {
  assert.equal(categorizeEvent('Engineering Deep Work - Refactor DB'), 'deep-work');
  assert.equal(categorizeEvent('Product Team Sync & 1:1'), 'meeting');
  assert.equal(categorizeEvent('Morning Yoga & Hydration Break'), 'wellness');
  assert.equal(categorizeEvent('Weekly Invoices & Email Triage'), 'admin');
  assert.equal(categorizeEvent('Buy groceries and books'), 'personal');
});

test('priority detection accurately assigns priority', () => {
  assert.equal(detectPriority('URGENT: Client Demo Prep', 45), 'high');
  assert.equal(detectPriority('Team Sync', 60), 'medium');
  assert.equal(detectPriority('Water plants', 15), 'low');
});

test('duration calculation computes correct minutes', () => {
  assert.equal(calculateDurationMinutes('09:00', '10:30'), 90);
  assert.equal(calculateDurationMinutes('14:15', '15:00'), 45);
});

test('convertEventToTask properly transforms a Google Calendar event', () => {
  const gcalEvent: GoogleCalendarEvent = {
    id: 'evt_123',
    summary: 'Sprint Architecture Review',
    description: 'Review system design documents',
    start: { dateTime: '2026-10-16T10:00:00Z' },
    end: { dateTime: '2026-10-16T11:00:00Z' },
    location: 'Google Meet',
  };

  const task = convertEventToTask(gcalEvent, 15);
  assert.equal(task.id, 'gcal-evt_123');
  assert.equal(task.title, 'Sprint Architecture Review');
  assert.equal(task.isCalendarEvent, true);
  assert.equal(task.reminderMinutesBefore, 15);
  assert.equal(task.category, 'deep-work'); // contains 'architecture' / 'review'
});

test('streak calculation computes current and longest streaks', () => {
  assert.equal(calculateCompletionPercentage(3, 4), 75);
  assert.equal(isDaySuccessful(4, 5, 70), true);
  assert.equal(isDaySuccessful(1, 5, 70), false);

  const history = {
    '2026-10-13': { total: 5, completed: 5, percentage: 100 },
    '2026-10-14': { total: 4, completed: 4, percentage: 100 },
    '2026-10-15': { total: 6, completed: 5, percentage: 83 },
    '2026-10-16': { total: 5, completed: 4, percentage: 80 },
  };

  const metrics = computeStreakMetrics(history, '2026-10-16', 70);
  assert.equal(metrics.currentStreak, 4);
  assert.equal(metrics.longestStreak, 4);
});

test('productivity scoring calculates high scores for high completions and deep work', () => {
  const tasks: Task[] = [
    {
      id: '1',
      title: 'Deep coding session',
      category: 'deep-work',
      priority: 'high',
      completed: true,
      durationMinutes: 90,
      startTime: '09:00',
      endTime: '10:30',
      date: '2026-10-16',
      reminderMinutesBefore: 10,
    },
    {
      id: '2',
      title: 'Design review',
      category: 'meeting',
      priority: 'medium',
      completed: true,
      durationMinutes: 45,
      startTime: '11:00',
      endTime: '11:45',
      date: '2026-10-16',
      reminderMinutesBefore: 10,
    },
  ];

  const score = calculateProductivityScore(tasks);
  assert.ok(score >= 80, `Expected score to be >= 80, got ${score}`);

  const stats = calculateFocusStats(tasks);
  assert.equal(stats.focusMinutes, 90);
  assert.equal(stats.meetingMinutes, 45);
});

test('alarm check accurately detects upcoming reminders', () => {
  assert.equal(parseTimeToMinutes('10:30'), 630);
  assert.equal(getMinutesDifference('10:30', '10:15'), 15);

  const task: Task = {
    id: 'test-alarm',
    title: 'Standup Sync',
    category: 'meeting',
    priority: 'medium',
    completed: false,
    durationMinutes: 30,
    startTime: '10:30',
    endTime: '11:00',
    date: '2026-10-16',
    reminderMinutesBefore: 10,
    reminderTriggered: false,
  };

  // If current time is 10:20 (10 minutes before start time 10:30)
  assert.equal(isTaskDueForReminder(task, '10:20', '2026-10-16'), true);
  // If current time is 09:30 (1 hour before, not yet due)
  assert.equal(isTaskDueForReminder(task, '09:30', '2026-10-16'), false);
  // If task is completed, it should not trigger
  assert.equal(isTaskDueForReminder({ ...task, completed: true }, '10:20', '2026-10-16'), false);
});
