import type { Task } from '../types.ts';

export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  // If ISO string
  if (timeStr.includes('T')) {
    try {
      const d = new Date(timeStr);
      return d.getHours() * 60 + d.getMinutes();
    } catch {
      // fall back
    }
  }
  const parts = timeStr.split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

export function getMinutesDifference(targetTimeStr: string, currentTimeStr: string): number {
  const targetMinutes = parseTimeToMinutes(targetTimeStr);
  const currentMinutes = parseTimeToMinutes(currentTimeStr);
  return targetMinutes - currentMinutes;
}

export function isTaskDueForReminder(
  task: Task,
  currentTimeStr: string,
  currentDateStr: string
): boolean {
  if (task.completed || task.reminderTriggered) return false;
  if (task.date !== currentDateStr) return false;

  const diffMinutes = getMinutesDifference(task.startTime, currentTimeStr);
  const reminderOffset = task.reminderMinutesBefore ?? 10;

  // Trigger if we are within [reminderOffset - 1, reminderOffset + 1] or exactly due
  return diffMinutes <= reminderOffset && diffMinutes >= 0;
}

// Audio Chime Synthesizer using Web Audio API (soft, soothing, zen chime)
class SoundSynthesizer {
  private audioCtx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public playZenChime(type: 'gentle' | 'alert' | 'complete' = 'gentle') {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const gainNode = ctx.createGain();
      gainNode.connect(ctx.destination);

      if (type === 'complete') {
        // Upbeat harmonic chord: C5 (523Hz), E5 (659Hz), G5 (784Hz)
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);

          noteGain.gain.setValueAtTime(0, now + idx * 0.08);
          noteGain.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.03);
          noteGain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.8);

          osc.connect(noteGain);
          noteGain.connect(ctx.destination);

          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.85);
        });
      } else if (type === 'alert') {
        // Repeating soft temple bell chime
        const freqs = [880, 1108.73, 1318.51];
        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.12);

          noteGain.gain.setValueAtTime(0, now + i * 0.12);
          noteGain.gain.linearRampToValueAtTime(0.18, now + i * 0.12 + 0.04);
          noteGain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 1.2);

          osc.connect(noteGain);
          noteGain.connect(ctx.destination);

          osc.start(now + i * 0.12);
          osc.stop(now + i * 0.12 + 1.25);
        });
      } else {
        // Gentle mindfulness bell
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, now); // E5
        osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.9);

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 1.45);
      }
    } catch (err) {
      console.warn('Audio playback not supported or user has not interacted yet', err);
    }
  }
}

export const soundPlayer = new SoundSynthesizer();

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

export function triggerDeviceNotification(
  title: string,
  body: string,
  tag = 'chronos-task-reminder'
): boolean {
  try {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        tag,
        icon: '/favicon.ico',
        silent: false,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      return true;
    }
  } catch (err) {
    console.warn('Could not fire native notification:', err);
  }
  return false;
}
