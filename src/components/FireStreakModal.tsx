import React, { useEffect, useState } from 'react';
import { X, Sparkles, Flame, Check, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundPlayer } from '../utils/alarm.ts';

interface FireStreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakCount: number;
}

export const FireStreakModal: React.FC<FireStreakModalProps> = ({
  isOpen,
  onClose,
  streakCount,
}) => {
  const [displayNumber, setDisplayNumber] = useState(Math.max(1, streakCount - 1));
  const [isSparkling, setIsSparkling] = useState(false);

  useEffect(() => {
    if (isOpen) {
      soundPlayer.playZenChime('complete');

      // Duolingo number count-up animation: e.g. 5 -> 6
      setDisplayNumber(Math.max(1, streakCount - 1));
      setIsSparkling(false);

      const numTimer = setTimeout(() => {
        setDisplayNumber(streakCount);
        setIsSparkling(true);
        soundPlayer.playZenChime('gentle');
      }, 400);

      // Multi-stage celebratory confetti cannon
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#ff7a00', '#ffc700', '#ff3d00', '#10b981', '#38bdf8'],
      });

      const cannonTimer = setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 60,
          origin: { x: 0 },
          colors: ['#ff5722', '#ff9800', '#ffeb3b'],
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 60,
          origin: { x: 1 },
          colors: ['#ff5722', '#ff9800', '#ffeb3b'],
        });
      }, 350);

      return () => {
        clearTimeout(numTimer);
        clearTimeout(cannonTimer);
      };
    }
  }, [isOpen, streakCount]);

  if (!isOpen) return null;

  // Day initials for the Duolingo week strip
  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const todayIndex = (new Date().getDay() + 6) % 7; // 0 for Monday to 6 for Sunday

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="streak-celebration-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
    >
      <div className="relative w-full max-w-sm rounded-[38px] border-2 border-amber-500/50 bg-gradient-to-b from-[#2a0b02] via-[#1c0803] to-[#0d0402] p-6 sm:p-8 shadow-2xl text-center space-y-5 overflow-hidden animate-pop-in">
        {/* Radiant Ambient Aura Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-tr from-amber-600/30 to-orange-500/20 rounded-full blur-3xl pointer-events-none animate-aura-pulse" />

        {/* Close icon */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/50 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer z-20"
          aria-label="Close streak celebration"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Authentic Duolingo-Style Animated Fire Flame Character */}
        <div className="relative w-40 h-40 mx-auto flex items-center justify-center pt-2">
          {/* Animated floating fire ember sparks */}
          <span className="absolute top-2 left-6 w-2.5 h-2.5 rounded-full bg-amber-300 animate-ember-1 pointer-events-none" />
          <span className="absolute top-4 right-8 w-2 h-2 rounded-full bg-orange-400 animate-ember-2 pointer-events-none" />
          <span className="absolute -top-1 left-16 w-3 h-3 rounded-full bg-yellow-300 animate-ember-3 pointer-events-none" />
          <span className="absolute top-12 right-4 w-1.5 h-1.5 rounded-full bg-red-400 animate-ember-1 pointer-events-none" />

          {/* Golden energy ring behind flame */}
          <div className="absolute inset-2 rounded-full border border-amber-500/20 bg-amber-500/5 animate-aura-pulse" />

          {/* The Living Mascot Fire Flame */}
          <div className="relative animate-flame-wobble">
            <svg
              viewBox="0 0 100 125"
              className="w-36 h-36 drop-shadow-[0_0_30px_rgba(249,115,22,0.95)]"
            >
              <defs>
                {/* Outer Flame Gradient */}
                <linearGradient id="duoFlameOuter" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#b91c1c" />
                  <stop offset="40%" stopColor="#ea580c" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>

                {/* Middle Tongue Gradient */}
                <linearGradient id="duoFlameMid" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#ea580c" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#fde047" />
                </linearGradient>

                {/* Core Blazing Gradient */}
                <linearGradient id="duoFlameCore" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
              </defs>

              {/* Outer Roaring Flame Body */}
              <path
                d="M50 0 C56 28 82 42 88 68 C96 92 78 118 50 118 C22 118 4 92 12 68 C18 42 44 28 50 0 Z"
                fill="url(#duoFlameOuter)"
              />

              {/* Secondary dancing tongue flames */}
              <g className="animate-flame-inner">
                <path
                  d="M50 16 C63 40 80 54 76 82 C71 106 46 114 50 114 C54 114 29 106 24 82 C20 54 37 40 50 16 Z"
                  fill="url(#duoFlameMid)"
                />
                {/* Hot White/Yellow Inner Blazing Core */}
                <path
                  d="M50 48 C57 62 65 72 61 92 C57 106 43 106 39 92 C35 72 43 62 50 48 Z"
                  fill="url(#duoFlameCore)"
                />
              </g>

              {/* Rosy Glowing Cheeks */}
              <ellipse cx="36" cy="80" rx="3.5" ry="2.2" fill="#ef4444" opacity="0.45" />
              <ellipse cx="64" cy="80" rx="3.5" ry="2.2" fill="#ef4444" opacity="0.45" />

              {/* Cute Duolingo Big Expressive Eyes */}
              <ellipse cx="43" cy="74" rx="3.2" ry="4.2" fill="#18181b" />
              <ellipse cx="57" cy="74" rx="3.2" ry="4.2" fill="#18181b" />
              {/* Eye Catchlight reflections */}
              <circle cx="44.2" cy="72.5" r="1.3" fill="#ffffff" />
              <circle cx="58.2" cy="72.5" r="1.3" fill="#ffffff" />
              <circle cx="42" cy="75.5" r="0.6" fill="#ffffff" />
              <circle cx="56" cy="75.5" r="0.6" fill="#ffffff" />

              {/* Cute Cheerful Mouth */}
              <path
                d="M45 81 Q50 86 55 81"
                fill="none"
                stroke="#18181b"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Big Number Pill & Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500/30 to-orange-500/30 border border-amber-400/60 text-amber-300 text-xs font-black tracking-wider uppercase shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
            <span>DAILY GOAL COMPLETE!</span>
          </div>

          <h2
            id="streak-celebration-title"
            className="text-5xl sm:text-6xl font-black tracking-tight text-white drop-shadow-lg flex items-center justify-center gap-2"
          >
            <span
              className={`transition-all duration-300 transform ${
                isSparkling ? 'scale-110 text-amber-400' : 'scale-100 text-white'
              }`}
            >
              {displayNumber}
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">
              DAYS!
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-amber-100/90 max-w-xs mx-auto leading-relaxed pt-1 font-medium">
            You completed every single task scheduled for today. You're on fire! 🔥
          </p>
        </div>

        {/* Duolingo 7-Day Week Strip */}
        <div className="p-3.5 rounded-2xl bg-black/40 border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-amber-200/80 uppercase tracking-wider px-1">
            <span>Weekly Progress</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-3 h-3 stroke-[3]" /> All Done Today
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 pt-1">
            {daysOfWeek.map((dayLetter, idx) => {
              const isPastCompleted = idx < todayIndex;
              const isToday = idx === todayIndex;

              return (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-white/50">{dayLetter}</span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isToday
                        ? 'bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 text-zinc-950 font-black shadow-[0_0_15px_rgba(249,115,22,0.9)] scale-110 ring-2 ring-white animate-pulse'
                        : isPastCompleted
                        ? 'bg-amber-500/25 border border-amber-500/60 text-amber-400'
                        : 'bg-white/5 border border-white/10 text-white/30'
                    }`}
                  >
                    {isToday ? (
                      <Flame className="w-4 h-4 fill-zinc-950 stroke-none" />
                    ) : isPastCompleted ? (
                      <Flame className="w-3.5 h-3.5 fill-amber-400 stroke-none" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Duolingo 3D Chunky Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-black text-sm tracking-wide shadow-lg shadow-orange-500/30 border-b-4 border-amber-700 active:border-b-0 active:translate-y-1 transition-all cursor-pointer"
          >
            <span>CONTINUE</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
