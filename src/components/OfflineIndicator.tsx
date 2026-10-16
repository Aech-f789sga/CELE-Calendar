import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus.ts';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-4 left-4 right-4 sm:right-auto z-50 flex items-center justify-between sm:justify-start gap-2.5 rounded-xl bg-amber-500/90 backdrop-blur-md px-4 py-2 text-xs font-semibold text-zinc-950 shadow-xl border border-amber-400/50 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4" />
        <span>Offline Mode — Tasks & Zen Alarms work uninterrupted</span>
      </div>
    </div>
  );
};
