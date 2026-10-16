import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Flag, Bell, Sparkles, Check } from 'lucide-react';
import type { Task } from '../types.ts';
import { soundPlayer } from '../utils/alarm.ts';

interface Lap {
  id: number;
  lapTimeSeconds: number;
  totalTimeSeconds: number;
}

interface SessionScreenProps {
  activeTask: Task | null;
  onClose: () => void;
  onCompleteTask: (taskId: string) => void;
  allTasks: Task[];
  onSelectTask: (task: Task) => void;
}

export const SessionScreen: React.FC<SessionScreenProps> = ({
  activeTask,
  onClose,
  onCompleteTask,
  allTasks,
  onSelectTask,
}) => {
  const [seconds, setSeconds] = useState(8622); // starts around 02:23:42 as in mockup
  const [isRunning, setIsRunning] = useState(true);
  const [laps, setLaps] = useState<Lap[]>([
    { id: 2, lapTimeSeconds: 4339, totalTimeSeconds: 7201 }, // 01:12:19 & 02:00:01
    { id: 1, lapTimeSeconds: 2852, totalTimeSeconds: 2852 }, // 00:47:32 & 00:47:32
  ]);
  const [lastLapTotalSeconds, setLastLapTotalSeconds] = useState(7201);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const formatTime = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleTogglePlay = () => {
    soundPlayer.playZenChime(isRunning ? 'gentle' : 'alert');
    setIsRunning((prev) => !prev);
  };

  const handleAddLap = () => {
    const currentLapTime = seconds - lastLapTotalSeconds;
    const newLap: Lap = {
      id: laps.length + 1,
      lapTimeSeconds: Math.max(1, currentLapTime),
      totalTimeSeconds: seconds,
    };
    setLaps([newLap, ...laps]);
    setLastLapTotalSeconds(seconds);
    soundPlayer.playZenChime('gentle');
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
    setLaps([]);
    setLastLapTotalSeconds(0);
  };

  const currentTaskTitle = activeTask?.title || 'First Screen Design';

  // SVG Dial Clock calculations
  // Hours 1 to 12 around circular perimeter (radius ~125 inside 300x300 viewBox)
  const dialRadius = 125;
  const cx = 150;
  const cy = 150;

  const hourMarks = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((hour, index) => {
    const angleDeg = index * 30 - 90; // 12 is at -90 deg (top)
    const angleRad = (angleDeg * Math.PI) / 180;
    const x = cx + dialRadius * Math.cos(angleRad);
    const y = cy + dialRadius * Math.sin(angleRad);
    return { hour, x, y };
  });

  // 60 tick marks around dial
  const ticks = Array.from({ length: 60 }).map((_, i) => {
    const angleDeg = i * 6 - 90;
    const angleRad = (angleDeg * Math.PI) / 180;
    const isMajor = i % 5 === 0;
    const rInner = isMajor ? dialRadius - 28 : dialRadius - 22;
    const rOuter = dialRadius - 15;
    const x1 = cx + rInner * Math.cos(angleRad);
    const y1 = cy + rInner * Math.sin(angleRad);
    const x2 = cx + rOuter * Math.cos(angleRad);
    const y2 = cy + rOuter * Math.sin(angleRad);
    return { x1, y1, x2, y2, isMajor };
  });

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#380e06] via-[#942907] to-[#ea580c] text-white flex flex-col items-center justify-between px-4 sm:px-6 pt-6 pb-28 select-none overflow-x-hidden">
      {/* Background ambient radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

      {/* Top Header */}
      <div className="w-full max-w-md flex items-center justify-between z-10">
        <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">Session</h1>
        <button
          type="button"
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/90 transition-all cursor-pointer shadow-sm"
          aria-label="Close session view"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Center Analog & Digital Chronometer Dial */}
      <div className="w-full max-w-sm flex flex-col items-center my-auto py-4 z-10">
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
          <svg viewBox="0 0 300 300" className="w-full h-full overflow-visible">
            <defs>
              {/* Inner Circle Gradient */}
              <radialGradient id="innerDialGrad" cx="50%" cy="45%" r="55%">
                <stop offset="0%" stopColor="#c2410c" />
                <stop offset="70%" stopColor="#9a3412" />
                <stop offset="100%" stopColor="#7c2d12" />
              </radialGradient>

              {/* Progress Arc Shadow */}
              <filter id="arcGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000000" floodOpacity="0.4" />
              </filter>
            </defs>

            {/* Outer Subtle Dial Ring */}
            <circle
              cx={cx}
              cy={cy}
              r={dialRadius + 12}
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
            />

            {/* Hour Numbers around perimeter */}
            {hourMarks.map(({ hour, x, y }) => (
              <text
                key={hour}
                x={x}
                y={y + 4}
                textAnchor="middle"
                fontSize="11"
                fontWeight="500"
                fill="rgba(255, 255, 255, 0.65)"
                className="font-mono tracking-tighter"
              >
                {hour}
              </text>
            ))}

            {/* Dial Tick Marks */}
            {ticks.map((t, idx) => (
              <line
                key={idx}
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke={t.isMajor ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.35)'}
                strokeWidth={t.isMajor ? '1.5' : '1'}
                strokeLinecap="round"
              />
            ))}

            {/* Prominent Black Progress Arc (sweeping from ~3 o'clock to ~5:30 o'clock) */}
            <path
              d="M 270 150 A 120 120 0 0 1 200 255"
              fill="none"
              stroke="#0f172a"
              strokeWidth="20"
              strokeLinecap="round"
              filter="url(#arcGlow)"
            />

            {/* Amber accent active marker on progress arc */}
            <circle cx="270" cy="150" r="4" fill="#fbbf24" />

            {/* White Ticks Ring Underlay */}
            <circle
              cx={cx}
              cy={cy}
              r="76"
              fill="none"
              stroke="rgba(255, 255, 255, 0.25)"
              strokeWidth="1.5"
            />

            {/* Center Glowing Disc */}
            <circle
              cx={cx}
              cy={cy}
              r="68"
              fill="url(#innerDialGrad)"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="2"
              className="drop-shadow-2xl"
            />

            {/* Digital Timer Center Typography */}
            <text
              x={cx}
              y={cy + 6}
              textAnchor="middle"
              fontSize="21"
              fontWeight="700"
              fill="#ffffff"
              className="font-mono tracking-tight"
            >
              {formatTime(seconds)}
            </text>
          </svg>
        </div>

        {/* Task Title & Selector */}
        <div className="mt-2 text-center">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow">
            {currentTaskTitle}
          </h2>
          {activeTask?.description && (
            <p className="text-xs text-white/70 mt-1 max-w-xs mx-auto line-clamp-1">
              {activeTask.description}
            </p>
          )}

          {/* Quick task dropdown if other tasks exist */}
          {allTasks.length > 1 && (
            <div className="mt-2">
              <select
                value={activeTask?.id || ''}
                onChange={(e) => {
                  const found = allTasks.find((t) => t.id === e.target.value);
                  if (found) onSelectTask(found);
                }}
                className="bg-black/30 backdrop-blur-md text-white/80 border border-white/20 text-xs rounded-full px-3 py-1 focus:outline-none cursor-pointer"
              >
                {allTasks.map((t) => (
                  <option key={t.id} value={t.id} className="bg-zinc-900 text-white">
                    Switch: {t.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Lap Times Table */}
        <div className="w-full max-w-xs mt-6 space-y-2 text-sm">
          <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-white/60 border-b border-white/10 pb-1.5">
            <span className="w-8"></span>
            <span>Lap Time</span>
            <span>Total Time</span>
          </div>

          <div className="space-y-1.5 font-mono">
            {laps.slice(0, 3).map((lap) => (
              <div
                key={lap.id}
                className="flex items-center justify-between text-xs sm:text-sm text-white/90"
              >
                <span className="w-8 text-white/50 text-xs">
                  {String(lap.id).padStart(2, '0')}
                </span>
                <span className="font-semibold text-amber-200">
                  {formatTime(lap.lapTimeSeconds)}
                </span>
                <span className="text-white/80">{formatTime(lap.totalTimeSeconds)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Complete Task CTA & Control Pill at Bottom */}
      <div className="w-full max-w-xs z-10 flex flex-col items-center gap-3">
        {activeTask && !activeTask.completed && (
          <button
            type="button"
            onClick={() => onCompleteTask(activeTask.id)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs tracking-wide shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>FINISH TASK & EXTEND STREAK</span>
          </button>
        )}

        <div className="w-full flex items-center justify-center gap-5 p-3 rounded-full bg-white/15 backdrop-blur-xl border border-white/20 shadow-xl shadow-black/30">
        {/* Lap Flag Button */}
        <button
          type="button"
          onClick={handleAddLap}
          disabled={!isRunning}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer"
          title="Record Lap Time"
          aria-label="Record lap time"
        >
          <Flag className="w-4 h-4" />
        </button>

        {/* Primary Play / Pause Action */}
        <button
          type="button"
          onClick={handleTogglePlay}
          className="w-14 h-14 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title={isRunning ? 'Pause Session' : 'Resume Session'}
          aria-label={isRunning ? 'Pause Session' : 'Resume Session'}
        >
          {isRunning ? (
            <Pause className="w-6 h-6 fill-zinc-950 stroke-none" />
          ) : (
            <Play className="w-6 h-6 fill-zinc-950 stroke-none ml-0.5" />
          )}
        </button>

        {/* Reset / Complete Button */}
        <button
          type="button"
          onClick={handleReset}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          title="Reset Stopwatch"
          aria-label="Reset stopwatch"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
      </div>
    </div>
  );
};
