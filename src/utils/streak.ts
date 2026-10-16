import type { StreakData, Task } from '../types.ts';

export function calculateCompletionPercentage(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function isDaySuccessful(completed: number, total: number, thresholdPercent = 70): boolean {
  if (total === 0) return false;
  return (completed / total) * 100 >= thresholdPercent;
}

export function getPastDateString(daysAgo: number, fromDate: Date = new Date()): string {
  const d = new Date(fromDate);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

export function computeStreakMetrics(
  history: Record<string, { total: number; completed: number; percentage: number }>,
  todayStr: string,
  thresholdPercent = 70
): { currentStreak: number; longestStreak: number } {
  const dates = Object.keys(history).sort(); // ascending
  if (dates.length === 0) return { currentStreak: 0, longestStreak: 0 };

  let currentStreak = 0;
  let longestStreak = 0;
  let runningStreak = 0;

  // Calculate longest streak across history
  // Build a sorted map of day success
  const successMap: Record<string, boolean> = {};
  for (const date of dates) {
    const entry = history[date];
    successMap[date] = entry ? isDaySuccessful(entry.completed, entry.total, thresholdPercent) : false;
  }

  // Iterate backwards from yesterday or today to compute current streak
  const todayEntry = history[todayStr];
  const isTodayDone = todayEntry ? isDaySuccessful(todayEntry.completed, todayEntry.total, thresholdPercent) : false;

  const refDate = new Date(`${todayStr}T12:00:00Z`);
  let checkOffset = isTodayDone ? 0 : 1; // if today is done, start counting from today; otherwise check starting from yesterday

  while (true) {
    const d = new Date(refDate);
    d.setDate(d.getDate() - checkOffset);
    const dateKey = d.toISOString().split('T')[0];
    const dayEntry = history[dateKey];

    if (dayEntry && isDaySuccessful(dayEntry.completed, dayEntry.total, thresholdPercent)) {
      currentStreak++;
      checkOffset++;
    } else {
      break;
    }
  }

  // Calculate overall longest streak by consecutive days
  const dateObjList = dates.map((d) => ({
    dateStr: d,
    time: new Date(`${d}T12:00:00Z`).getTime(),
    success: successMap[d],
  }));

  for (let i = 0; i < dateObjList.length; i++) {
    if (dateObjList[i].success) {
      if (i > 0) {
        const prevTime = dateObjList[i - 1].time;
        const diffDays = Math.round((dateObjList[i].time - prevTime) / (1000 * 60 * 60 * 24));
        if (diffDays === 1 && dateObjList[i - 1].success) {
          runningStreak++;
        } else {
          runningStreak = 1;
        }
      } else {
        runningStreak = 1;
      }
      if (runningStreak > longestStreak) {
        longestStreak = runningStreak;
      }
    } else {
      runningStreak = 0;
    }
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  return { currentStreak, longestStreak };
}

export function updateStreakRecord(
  prevStreak: StreakData,
  todayTasks: Task[],
  todayStr: string,
  thresholdPercent = 70
): StreakData {
  const total = todayTasks.length;
  const completed = todayTasks.filter((t) => t.completed).length;
  const percentage = calculateCompletionPercentage(completed, total);

  const updatedHistory = {
    ...prevStreak.history,
    [todayStr]: { total, completed, percentage },
  };

  const { currentStreak, longestStreak } = computeStreakMetrics(
    updatedHistory,
    todayStr,
    thresholdPercent
  );

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, prevStreak.longestStreak),
    lastActiveDate: todayStr,
    history: updatedHistory,
    freezesRemaining: prevStreak.freezesRemaining,
  };
}

export function getStreakBadge(streak: number): {
  title: string;
  emoji: string;
  description: string;
} {
  if (streak >= 30) {
    return {
      title: 'Titan of Consistency',
      emoji: '⚡',
      description: '30+ days of unwavering productivity mastery.',
    };
  }
  if (streak >= 14) {
    return {
      title: 'Flow State Master',
      emoji: '🔥',
      description: 'Two weeks of sustained focus and momentum.',
    };
  }
  if (streak >= 7) {
    return {
      title: 'Momentum Builder',
      emoji: '✨',
      description: 'One full week of disciplined daily execution.',
    };
  }
  if (streak >= 3) {
    return {
      title: 'Ignition',
      emoji: '🌱',
      description: 'Great start! 3 days in a row builds lasting habits.',
    };
  }
  return {
    title: 'Beginner Flow',
    emoji: '🎯',
    description: 'Complete today’s tasks to spark your streak.',
  };
}
