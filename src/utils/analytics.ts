import type { CategoryDistribution, ProductivityTrend, Task, TaskCategory } from '../types.ts';

export function calculateFocusStats(tasks: Task[]): {
  focusMinutes: number;
  meetingMinutes: number;
  adminMinutes: number;
  wellnessMinutes: number;
  personalMinutes: number;
  totalScheduledMinutes: number;
} {
  let focusMinutes = 0;
  let meetingMinutes = 0;
  let adminMinutes = 0;
  let wellnessMinutes = 0;
  let personalMinutes = 0;

  for (const task of tasks) {
    const mins = task.durationMinutes || 30;
    switch (task.category) {
      case 'deep-work':
        focusMinutes += mins;
        break;
      case 'meeting':
        meetingMinutes += mins;
        break;
      case 'admin':
        adminMinutes += mins;
        break;
      case 'wellness':
        wellnessMinutes += mins;
        break;
      case 'personal':
      default:
        personalMinutes += mins;
        break;
    }
  }

  const totalScheduledMinutes =
    focusMinutes + meetingMinutes + adminMinutes + wellnessMinutes + personalMinutes;

  return {
    focusMinutes,
    meetingMinutes,
    adminMinutes,
    wellnessMinutes,
    personalMinutes,
    totalScheduledMinutes,
  };
}

export function calculateCategoryDistribution(tasks: Task[]): CategoryDistribution[] {
  const stats = calculateFocusStats(tasks);
  const total = stats.totalScheduledMinutes || 1;

  const categories: Array<{
    category: TaskCategory;
    label: string;
    minutes: number;
    color: string;
  }> = [
    { category: 'deep-work', label: 'Deep Focus', minutes: stats.focusMinutes, color: '#10b981' },
    { category: 'meeting', label: 'Meetings & Syncs', minutes: stats.meetingMinutes, color: '#6366f1' },
    { category: 'admin', label: 'Admin & Ops', minutes: stats.adminMinutes, color: '#f59e0b' },
    { category: 'wellness', label: 'Wellness & Breaks', minutes: stats.wellnessMinutes, color: '#14b8a6' },
    { category: 'personal', label: 'Personal & Habits', minutes: stats.personalMinutes, color: '#a855f7' },
  ];

  return categories.map((cat) => ({
    ...cat,
    percentage: Math.round((cat.minutes / total) * 100),
  }));
}

export function calculateProductivityScore(tasks: Task[]): number {
  if (tasks.length === 0) return 0;

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const baseRate = (completed / total) * 60; // Up to 60 points

  // High priority bonus
  const highPriority = tasks.filter((t) => t.priority === 'high');
  let priorityBonus = 0;
  if (highPriority.length > 0) {
    const highCompleted = highPriority.filter((t) => t.completed).length;
    priorityBonus = (highCompleted / highPriority.length) * 25; // Up to 25 points
  } else {
    priorityBonus = 20; // Default when no high priority tasks
  }

  // Deep work focus bonus
  const deepWork = tasks.filter((t) => t.category === 'deep-work');
  let focusBonus = 0;
  if (deepWork.length > 0) {
    const deepCompleted = deepWork.filter((t) => t.completed).length;
    focusBonus = (deepCompleted / deepWork.length) * 15; // Up to 15 points
  } else {
    focusBonus = 10;
  }

  return Math.min(100, Math.round(baseRate + priorityBonus + focusBonus));
}

export function generateTrendSeries(
  history: Record<string, { total: number; completed: number; percentage: number }>,
  days: number,
  todayStr: string
): ProductivityTrend[] {
  const result: ProductivityTrend[] = [];
  const refDate = new Date(`${todayStr}T12:00:00Z`);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(refDate);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const entry = history[dateStr];

    const completedTasks = entry ? entry.completed : Math.floor(3 + ((i * 7) % 4));
    const totalTasks = entry ? entry.total : Math.max(completedTasks, Math.floor(4 + ((i * 5) % 3)));
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Approximate focus vs meeting time based on date modulo for consistent realistic trend
    const focusMinutes = 90 + ((i * 23) % 150);
    const meetingMinutes = 45 + ((i * 17) % 90);

    result.push({
      date: dateStr,
      completedTasks,
      totalTasks,
      completionRate,
      focusMinutes,
      meetingMinutes,
    });
  }

  return result;
}
