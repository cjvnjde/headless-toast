import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TimerManager, createDefaultTickScheduler } from "../src/timers";
import type { TimerCallbacks, TickScheduler } from "../src/types";

describe("TimerManager", () => {
  let callbacks: TimerCallbacks;
  let manager: TimerManager;

  beforeEach(() => {
    vi.useFakeTimers();
    callbacks = {
      onAutoclose: vi.fn(),
      onSafetyTimeout: vi.fn(),
      onProgressTick: vi.fn(),
    };
    manager = new TimerManager(callbacks, createDefaultTickScheduler());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ---- startAutoclose ----

  describe("startAutoclose", () => {
    it("fires onAutoclose after the specified duration", () => {
      manager.startAutoclose("t1", 3000);

      vi.advanceTimersByTime(2999);
      expect(callbacks.onAutoclose).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(callbacks.onAutoclose).toHaveBeenCalledWith("t1");
      expect(callbacks.onAutoclose).toHaveBeenCalledTimes(1);
    });

    it("clears previous timer when called twice without explicit clear", () => {
      manager.startAutoclose("t1", 1000);
      manager.startAutoclose("t1", 2000);

      // The original 1000ms timer should have been cleared
      vi.advanceTimersByTime(1000);
      expect(callbacks.onAutoclose).not.toHaveBeenCalled();

      // Only the second timer (2000ms) should fire
      vi.advanceTimersByTime(1000);
      expect(callbacks.onAutoclose).toHaveBeenCalledTimes(1);
      expect(callbacks.onAutoclose).toHaveBeenCalledWith("t1");
    });

    it("does nothing when duration is 0", () => {
      manager.startAutoclose("t1", 0);

      vi.advanceTimersByTime(10000);
      expect(callbacks.onAutoclose).not.toHaveBeenCalled();
    });

    it("starts progress ticking when progress is enabled", () => {
      manager.startAutoclose("t1", 1000, { enabled: true, startValue: 0 });

      vi.advanceTimersByTime(50);
      expect(callbacks.onProgressTick).toHaveBeenCalled();
      const [id, progress] = (
        callbacks.onProgressTick as ReturnType<typeof vi.fn>
      ).mock.calls[0];
      expect(id).toBe("t1");
      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThanOrEqual(1);
    });

    it("does not start progress ticking when progress is disabled", () => {
      manager.startAutoclose("t1", 1000, { enabled: false, startValue: 0 });

      vi.advanceTimersByTime(500);
      expect(callbacks.onProgressTick).not.toHaveBeenCalled();
    });

    it("does not start progress ticking when progress config is omitted", () => {
      manager.startAutoclose("t1", 1000);

      vi.advanceTimersByTime(500);
      expect(callbacks.onProgressTick).not.toHaveBeenCalled();
    });

    it("resumes progress from a non-zero start value", () => {
      manager.startAutoclose("t1", 500, { enabled: true, startValue: 0.5 });

      // At 250ms (half of 500ms remaining), progress should be ~0.75
      // startProgress + (elapsed / duration) * remainingProgress = 0.5 + (250/500) * 0.5 = 0.75
      vi.advanceTimersByTime(250);
      const calls = (callbacks.onProgressTick as ReturnType<typeof vi.fn>).mock
        .calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[0]).toBe("t1");
      expect(lastCall[1]).toBeCloseTo(0.75, 1);
    });

    it("caps progress at 1 and stops ticking", () => {
      manager.startAutoclose("t1", 1000, { enabled: true, startValue: 0 });

      vi.advanceTimersByTime(1100);
      const calls = (callbacks.onProgressTick as ReturnType<typeof vi.fn>).mock
        .calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[1]).toBeLessThanOrEqual(1);

      // Further advances should not produce more ticks
      const countBefore = calls.length;
      vi.advanceTimersByTime(200);
      expect(
        (callbacks.onProgressTick as ReturnType<typeof vi.fn>).mock.calls
          .length,
      ).toBe(countBefore);
    });
  });

  // ---- getRemainingTime ----

  describe("getRemainingTime", () => {
    it("returns remaining time after partial elapsed", () => {
      manager.startAutoclose("t1", 3000);
      vi.advanceTimersByTime(1000);
      expect(manager.getRemainingTime("t1")).toBe(2000);
    });

    it("returns 0 when no timer exists", () => {
      expect(manager.getRemainingTime("nonexistent")).toBe(0);
    });

    it("returns 0 when timer has fully elapsed", () => {
      manager.startAutoclose("t1", 1000);
      vi.advanceTimersByTime(2000);
      // Timer has fired and been cleaned up by setTimeout, but timerStarts/durations still exist
      expect(manager.getRemainingTime("t1")).toBe(0);
    });

    it("returns full duration immediately after start", () => {
      manager.startAutoclose("t1", 5000);
      expect(manager.getRemainingTime("t1")).toBe(5000);
    });
  });

  // ---- clearAutoclose ----

  describe("clearAutoclose", () => {
    it("prevents autoclose callback from firing", () => {
      manager.startAutoclose("t1", 1000);
      manager.clearAutoclose("t1");

      vi.advanceTimersByTime(2000);
      expect(callbacks.onAutoclose).not.toHaveBeenCalled();
    });

    it("stops progress ticking", () => {
      manager.startAutoclose("t1", 1000, { enabled: true, startValue: 0 });

      vi.advanceTimersByTime(50);
      const countAfterFirstTick = (
        callbacks.onProgressTick as ReturnType<typeof vi.fn>
      ).mock.calls.length;
      expect(countAfterFirstTick).toBeGreaterThan(0);

      manager.clearAutoclose("t1");

      vi.advanceTimersByTime(500);
      expect(
        (callbacks.onProgressTick as ReturnType<typeof vi.fn>).mock.calls
          .length,
      ).toBe(countAfterFirstTick);
    });

    it("resets remaining time to 0", () => {
      manager.startAutoclose("t1", 3000);
      vi.advanceTimersByTime(1000);
      manager.clearAutoclose("t1");
      expect(manager.getRemainingTime("t1")).toBe(0);
    });

    it("is safe to call when no timer exists", () => {
      expect(() => manager.clearAutoclose("nonexistent")).not.toThrow();
    });
  });

  // ---- startSafetyTimeout ----

  describe("startSafetyTimeout", () => {
    it("fires onSafetyTimeout after the specified duration", () => {
      manager.startSafetyTimeout("t1", 5000);

      vi.advanceTimersByTime(4999);
      expect(callbacks.onSafetyTimeout).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(callbacks.onSafetyTimeout).toHaveBeenCalledWith("t1");
    });

    it("replaces an existing safety timeout", () => {
      manager.startSafetyTimeout("t1", 5000);
      manager.startSafetyTimeout("t1", 1000);

      // The original 5000ms should be cancelled
      vi.advanceTimersByTime(1000);
      expect(callbacks.onSafetyTimeout).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(5000);
      expect(callbacks.onSafetyTimeout).toHaveBeenCalledTimes(1);
    });
  });

  // ---- clearSafetyTimeout ----

  describe("clearSafetyTimeout", () => {
    it("prevents safety timeout from firing", () => {
      manager.startSafetyTimeout("t1", 1000);
      manager.clearSafetyTimeout("t1");

      vi.advanceTimersByTime(2000);
      expect(callbacks.onSafetyTimeout).not.toHaveBeenCalled();
    });

    it("is safe to call when no timeout exists", () => {
      expect(() => manager.clearSafetyTimeout("nonexistent")).not.toThrow();
    });
  });

  // ---- clearAll ----

  describe("clearAll", () => {
    it("clears both autoclose and safety timeout", () => {
      manager.startAutoclose("t1", 3000, { enabled: true, startValue: 0 });
      manager.startSafetyTimeout("t1", 5000);

      manager.clearAll("t1");

      vi.advanceTimersByTime(10000);
      expect(callbacks.onAutoclose).not.toHaveBeenCalled();
      expect(callbacks.onSafetyTimeout).not.toHaveBeenCalled();
      expect(callbacks.onProgressTick).not.toHaveBeenCalled();
    });

    it("is safe to call when nothing exists for the id", () => {
      expect(() => manager.clearAll("nonexistent")).not.toThrow();
    });
  });

  // ---- Multiple timers ----

  describe("multiple timers", () => {
    it("manages independent timers for different ids", () => {
      manager.startAutoclose("t1", 1000);
      manager.startAutoclose("t2", 2000);

      vi.advanceTimersByTime(1000);
      expect(callbacks.onAutoclose).toHaveBeenCalledWith("t1");
      expect(callbacks.onAutoclose).not.toHaveBeenCalledWith("t2");

      vi.advanceTimersByTime(1000);
      expect(callbacks.onAutoclose).toHaveBeenCalledWith("t2");
    });

    it("clearing one timer does not affect another", () => {
      manager.startAutoclose("t1", 1000);
      manager.startAutoclose("t2", 1000);

      manager.clearAutoclose("t1");

      vi.advanceTimersByTime(1000);
      expect(callbacks.onAutoclose).not.toHaveBeenCalledWith("t1");
      expect(callbacks.onAutoclose).toHaveBeenCalledWith("t2");
    });
  });

  // ---- Progress tick math ----

  describe("progress tick math", () => {
    it("progresses linearly from 0 to 1", () => {
      manager.startAutoclose("t1", 1000, { enabled: true, startValue: 0 });

      // At ~500ms, progress should be ~0.5
      vi.advanceTimersByTime(500);
      const calls = (callbacks.onProgressTick as ReturnType<typeof vi.fn>).mock
        .calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[1]).toBeCloseTo(0.5, 1);
    });

    it("ticks at the default scheduler interval", () => {
      manager.startAutoclose("t1", 1000, { enabled: true, startValue: 0 });

      vi.advanceTimersByTime(200);
      // Should have ticked at 50, 100, 150, 200 = 4 times
      expect(
        (callbacks.onProgressTick as ReturnType<typeof vi.fn>).mock.calls
          .length,
      ).toBe(4);
    });

    it("accounts for start value when resuming from pause", () => {
      // Simulates resume: duration=500ms remaining, progress already at 0.5
      manager.startAutoclose("t1", 500, { enabled: true, startValue: 0.5 });

      // At end (500ms), progress should reach 1.0
      vi.advanceTimersByTime(500);
      const calls = (callbacks.onProgressTick as ReturnType<typeof vi.fn>).mock
        .calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[1]).toBeCloseTo(1, 1);
    });
  });
});

describe("createDefaultTickScheduler (rAF path)", () => {
  let originalRAF: typeof globalThis.requestAnimationFrame;
  let originalCAF: typeof globalThis.cancelAnimationFrame;
  let pendingFrames: Map<number, () => void>;
  let nextFrameId: number;

  beforeEach(() => {
    originalRAF = globalThis.requestAnimationFrame;
    originalCAF = globalThis.cancelAnimationFrame;

    pendingFrames = new Map();
    nextFrameId = 1;

    globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => {
      const id = nextFrameId++;
      pendingFrames.set(id, () => cb(id));
      return id;
    };
    globalThis.cancelAnimationFrame = (id: number) => {
      pendingFrames.delete(id);
    };
  });

  afterEach(() => {
    if (originalRAF) {
      globalThis.requestAnimationFrame = originalRAF;
    } else {
      delete (globalThis as Record<string, unknown>).requestAnimationFrame;
    }
    if (originalCAF) {
      globalThis.cancelAnimationFrame = originalCAF;
    } else {
      delete (globalThis as Record<string, unknown>).cancelAnimationFrame;
    }
  });

  function flushFrames(maxIterations = 100) {
    let iterations = 0;
    while (pendingFrames.size > 0 && iterations < maxIterations) {
      // Snapshot current frames — callbacks may schedule new ones
      const frames = [...pendingFrames.entries()];
      pendingFrames.clear();
      for (const [, cb] of frames) {
        cb();
      }
      iterations++;
    }
    return iterations;
  }

  function flushOneFrame() {
    const frame = pendingFrames.entries().next();
    if (frame.done) return false;
    const [id, cb] = frame.value;
    pendingFrames.delete(id);
    cb();
    return true;
  }

  it("uses rAF when available", () => {
    const scheduler = createDefaultTickScheduler();
    const callback = vi.fn();

    const cancel = scheduler(callback);
    expect(pendingFrames.size).toBe(1);

    flushOneFrame();
    expect(callback).toHaveBeenCalledTimes(1);
    // Should have scheduled the next frame
    expect(pendingFrames.size).toBe(1);

    cancel();
    expect(pendingFrames.size).toBe(0);
  });

  it("stops ticking after cancel is called", () => {
    const scheduler = createDefaultTickScheduler();
    const callback = vi.fn();

    const cancel = scheduler(callback);

    // Flush a few frames
    flushOneFrame();
    flushOneFrame();
    flushOneFrame();
    expect(callback).toHaveBeenCalledTimes(3);

    cancel();
    const countAfterCancel = callback.mock.calls.length;

    // No more frames should fire
    flushFrames();
    expect(callback).toHaveBeenCalledTimes(countAfterCancel);
  });

  it("stops when the callback itself triggers cancellation", () => {
    const scheduler = createDefaultTickScheduler();
    let cancel: () => void;
    let callCount = 0;

    cancel = scheduler(() => {
      callCount++;
      if (callCount >= 3) {
        cancel();
      }
    });

    // Flush frames — the callback cancels itself on the 3rd call
    const iterations = flushFrames();

    expect(callCount).toBe(3);
    expect(pendingFrames.size).toBe(0);
    // Should have stopped quickly, not hit the 100-iteration limit
    expect(iterations).toBeLessThan(10);
  });

  it("does not leak frames when progress reaches 1 (TimerManager integration)", () => {
    vi.useFakeTimers();

    const scheduler = createDefaultTickScheduler();
    const callbacks: TimerCallbacks = {
      onAutoclose: vi.fn(),
      onSafetyTimeout: vi.fn(),
      onProgressTick: vi.fn(),
    };
    const manager = new TimerManager(callbacks, scheduler);

    manager.startAutoclose("t1", 1000, { enabled: true, startValue: 0 });

    // Simulate time passing beyond the duration so progress exceeds 1
    vi.advanceTimersByTime(1100);
    // Flush all pending rAF frames — this triggers the progress >= 1 path
    const iterations = flushFrames();

    const tickCount = (callbacks.onProgressTick as ReturnType<typeof vi.fn>)
      .mock.calls.length;

    // Flush again — no more ticks should happen
    flushFrames();
    expect(
      (callbacks.onProgressTick as ReturnType<typeof vi.fn>).mock.calls.length,
    ).toBe(tickCount);
    expect(pendingFrames.size).toBe(0);

    // Should not have run endlessly
    expect(iterations).toBeLessThan(10);

    vi.useRealTimers();
  });
});
