import type { TimerCallbacks, ProgressConfig } from "./types";

class TimerManager {
  private callbacks: TimerCallbacks;
  private timers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private timerStarts: Map<string, number> = new Map();
  private timerDurations: Map<string, number> = new Map();
  private safetyTimeouts: Map<string, ReturnType<typeof setTimeout>> =
    new Map();
  private progressIntervals: Map<string, ReturnType<typeof setInterval>> =
    new Map();

  constructor(callbacks: TimerCallbacks) {
    this.callbacks = callbacks;
  }

  public startAutoclose(
    id: string,
    duration: number,
    progress?: ProgressConfig,
  ): void {
    if (duration === 0) {
      return;
    }

    this.clearAutoclose(id);

    this.timerStarts.set(id, Date.now());
    this.timerDurations.set(id, duration);

    const timer = setTimeout(() => {
      this.callbacks.onAutoclose(id);
    }, duration);
    this.timers.set(id, timer);

    if (progress?.enabled) {
      this.startProgressTick(id, duration, progress.startValue);
    }
  }

  public getRemainingTime(id: string) {
    const start = this.timerStarts.get(id);
    const duration = this.timerDurations.get(id);

    if (start === undefined || duration === undefined) {
      return 0;
    }

    const elapsed = Date.now() - start;

    return Math.max(duration - elapsed, 0);
  }

  public clearAutoclose(id: string) {
    const timer = this.timers.get(id);

    if (timer) {
      clearTimeout(timer);

      this.timers.delete(id);
    }

    this.clearProgressInterval(id);
    this.timerStarts.delete(id);
    this.timerDurations.delete(id);
  }

  public startSafetyTimeout(id: string, durationMs: number) {
    this.clearSafetyTimeout(id);

    this.safetyTimeouts.set(
      id,
      setTimeout(() => {
        this.callbacks.onSafetyTimeout(id);
      }, durationMs),
    );
  }

  public clearSafetyTimeout(id: string) {
    const timeout = this.safetyTimeouts.get(id);

    if (timeout) {
      clearTimeout(timeout);

      this.safetyTimeouts.delete(id);
    }
  }

  public clearAll(id: string) {
    this.clearAutoclose(id);
    this.clearSafetyTimeout(id);
  }

  public destroyAll() {
    for (const id of this.timers.keys()) {
      this.clearAutoclose(id);
    }

    for (const id of this.safetyTimeouts.keys()) {
      this.clearSafetyTimeout(id);
    }

    for (const id of this.progressIntervals.keys()) {
      this.clearProgressInterval(id);
    }
  }

  private startProgressTick(
    id: string,
    duration: number,
    startProgress: number,
  ) {
    this.clearProgressInterval(id);

    const startTime = Date.now();
    const remainingProgress = 1 - startProgress;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(
        startProgress + (elapsed / duration) * remainingProgress,
        1,
      );
      this.callbacks.onProgressTick(id, progress);

      if (progress >= 1) {
        clearInterval(interval);
        this.progressIntervals.delete(id);
      }
    }, 50);

    this.progressIntervals.set(id, interval);
  }

  private clearProgressInterval(id: string) {
    const interval = this.progressIntervals.get(id);

    if (interval) {
      clearInterval(interval);

      this.progressIntervals.delete(id);
    }
  }
}

export { TimerManager };
