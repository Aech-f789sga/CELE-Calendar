import React from 'react';
import { CheckSquare, Calendar, Flame, BarChart3, BellRing } from 'lucide-react';

export type ActiveTab = 'tasks' | 'calendar' | 'streak' | 'analytics' | 'alarms';

interface NavigationTabsProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  pendingTasksCount: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onChangeTab,
  pendingTasksCount,
}) => {
  const tabs = [
    {
      id: 'tasks' as ActiveTab,
      label: 'Daily Flow',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
    },
    {
      id: 'calendar' as ActiveTab,
      label: 'Calendar Sync',
      icon: Calendar,
    },
    {
      id: 'streak' as ActiveTab,
      label: 'Streak & Habits',
      icon: Flame,
    },
    {
      id: 'analytics' as ActiveTab,
      label: 'Productivity Trends',
      icon: BarChart3,
    },
    {
      id: 'alarms' as ActiveTab,
      label: 'Smart Alarms',
      icon: BellRing,
    },
  ];

  return (
    <nav aria-label="Main Navigation" className="border-b border-zinc-800/80 bg-zinc-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2.5 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangeTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-zinc-800/90 text-emerald-400 border border-emerald-500/20 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-300'
                  }`}
                />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
