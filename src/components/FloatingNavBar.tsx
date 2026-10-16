import React from 'react';
import { Home, Calendar, Clock, BarChart3, Settings } from 'lucide-react';

export type AppScreen = 'home' | 'calendar' | 'session' | 'analytics' | 'settings';

interface FloatingNavBarProps {
  activeScreen: AppScreen;
  onChangeScreen: (screen: AppScreen) => void;
  isSessionRunning?: boolean;
}

export const FloatingNavBar: React.FC<FloatingNavBarProps> = ({
  activeScreen,
  onChangeScreen,
  isSessionRunning = false,
}) => {
  const navItems = [
    { id: 'home' as AppScreen, label: 'Home', icon: Home },
    { id: 'calendar' as AppScreen, label: 'Calendar', icon: Calendar },
    { id: 'session' as AppScreen, label: 'Session', icon: Clock, hasPulse: isSessionRunning },
    { id: 'analytics' as AppScreen, label: 'Analytics', icon: BarChart3 },
    { id: 'settings' as AppScreen, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav
        aria-label="Floating Navigation Bar"
        className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-full bg-black/60 backdrop-blur-2xl border border-white/15 shadow-2xl shadow-black/80 ring-1 ring-white/5"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeScreen(item.id)}
              className={`relative flex items-center justify-center transition-all duration-300 rounded-full cursor-pointer ${
                isActive
                  ? 'w-11 h-11 bg-white text-zinc-950 shadow-lg scale-105'
                  : 'w-10 h-10 text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title={item.label}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              
              {item.hasPulse && !isActive && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
