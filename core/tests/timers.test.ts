import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TimerManager, createDefaultTickScheduler } from "../src/timers";
import type { TimerCallbacks } from "../src/types";

type AnimationFrameCallback = (time: number) => void;
type TestGlobals = typeof globalThis & {
  requestAnimationFrame?: (callback: AnimationFrameCallback) => number;
  cancelAnimationFrame?: (id: number) => void;
};

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

  it("replaces an existing autoclose timer for the same toast", () => {
    manager.startAutoclose("toast-1", 1000);
    manager.startAutoclose("toast-1", 2000);

    vi.advanceTimersByTime(1999);
    expect(callbacks.onAutoclose).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callbacks.onAutoclose).toHaveBeenCalledOnce();
    expect(callbacks.onAutoclose).toHaveBeenCalledWith("toast-1");
  });

  it("tracks remaining time until the timer is cleared", () => {
    manager.startAutoclose("toast-1", 3000);

    vi.advanceTimersByTime(1000);
    expect(manager.getRemainingTime("toast-1")).toBe(2000);

    manager.clearAutoclose("toast-1");
    expect(manager.getRemainingTime("toast-1")).toBe(0);
  });

  it("emits linear progress and stops once the timer completes", () => {
    manager.startAutoclose("toast-1", 1000, {
      enabled: true,
      startValue: 0.25,
    });

    vi.advanceTimersByTime(500);

    const midwayCalls = vi.mocked(callbacks.onProgressTick).mock.calls;
    expect(midwayCalls.at(-1)?.[0]).toBe("toast-1");
    expect(midwayCalls.at(-1)?.[1]).toBeCloseTo(0.625, 1);

    vi.advanceTimersByTime(600);

    const completedCalls = vi.mocked(callbacks.onProgressTick).mock.calls;
    const lastCount = completedCalls.length;
    expect(completedCalls.at(-1)?.[1]).toBe(1);

    vi.advanceTimersByTime(200);
    expect(vi.mocked(callbacks.onProgressTick).mock.calls).toHaveLength(
      lastCount,
    );
  });

  it("clears progress updates together with the autoclose timer", () => {
    manager.startAutoclose("toast-1", 1000, { enabled: true, startValue: 0 });

    vi.advanceTimersByTime(100);
    const tickCount = vi.mocked(callbacks.onProgressTick).mock.calls.length;

    manager.clearAutoclose("toast-1");
    vi.advanceTimersByTime(1000);

    expect(vi.mocked(callbacks.onAutoclose)).not.toHaveBeenCalled();
    expect(vi.mocked(callbacks.onProgressTick).mock.calls).toHaveLength(
      tickCount,
    );
  });

  it("replaces an existing safety timeout", () => {
    manager.startSafetyTimeout("toast-1", 5000);
    manager.startSafetyTimeout("toast-1", 1000);

    vi.advanceTimersByTime(999);
    expect(callbacks.onSafetyTimeout).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callbacks.onSafetyTimeout).toHaveBeenCalledOnce();
    expect(callbacks.onSafetyTimeout).toHaveBeenCalledWith("toast-1");
  });

  it("keeps timers for different toasts independent", () => {
    manager.startAutoclose("toast-1", 1000);
    manager.startAutoclose("toast-2", 2000);

    vi.advanceTimersByTime(1000);
    expect(callbacks.onAutoclose).toHaveBeenCalledWith("toast-1");
    expect(callbacks.onAutoclose).not.toHaveBeenCalledWith("toast-2");

    vi.advanceTimersByTime(1000);
    expect(callbacks.onAutoclose).toHaveBeenCalledWith("toast-2");
  });

  it("destroyAll cancels every pending timer and progress loop", () => {
    manager.startAutoclose("toast-1", 1000, { enabled: true, startValue: 0 });
    manager.startAutoclose("toast-2", 2000);
    manager.startSafetyTimeout("toast-3", 500);

    manager.destroyAll();
    vi.advanceTimersByTime(5000);

    expect(callbacks.onAutoclose).not.toHaveBeenCalled();
    expect(callbacks.onSafetyTimeout).not.toHaveBeenCalled();
    expect(callbacks.onProgressTick).not.toHaveBeenCalled();
  });
});

describe("createDefaultTickScheduler", () => {
  const testGlobals = globalThis as TestGlobals;
  let originalRAF: ((callback: AnimationFrameCallback) => number) | undefined;
  let originalCAF: ((id: number) => void) | undefined;
  let pendingFrames: Map<number, () => void>;
  let nextFrameId: number;

  beforeEach(() => {
    originalRAF = testGlobals.requestAnimationFrame;
    originalCAF = testGlobals.cancelAnimationFrame;
    pendingFrames = new Map();
    nextFrameId = 1;

    testGlobals.requestAnimationFrame = (callback: AnimationFrameCallback) => {
      const id = nextFrameId++;
      pendingFrames.set(id, () => callback(id));
      return id;
    };

    testGlobals.cancelAnimationFrame = (id: number) => {
      pendingFrames.delete(id);
    };
  });

  afterEach(() => {
    if (originalRAF) {
      testGlobals.requestAnimationFrame = originalRAF;
    } else {
      delete testGlobals.requestAnimationFrame;
    }

    if (originalCAF) {
      testGlobals.cancelAnimationFrame = originalCAF;
    } else {
      delete testGlobals.cancelAnimationFrame;
    }
  });

  function flushFrame() {
    const next = pendingFrames.entries().next();

    if (next.done) {
      return false;
    }

    const [id, callback] = next.value;
    pendingFrames.delete(id);
    callback();
    return true;
  }

  it("uses requestAnimationFrame when it is available", () => {
    const scheduler = createDefaultTickScheduler();
    const callback = vi.fn();

    const cancel = scheduler(callback);
    expect(pendingFrames.size).toBe(1);

    flushFrame();
    expect(callback).toHaveBeenCalledOnce();
    expect(pendingFrames.size).toBe(1);

    cancel();
    expect(pendingFrames.size).toBe(0);
  });

  it("stops scheduling frames after cancellation", () => {
    const scheduler = createDefaultTickScheduler();
    const callback = vi.fn();

    const cancel = scheduler(callback);
    flushFrame();
    flushFrame();

    cancel();
    const callCount = callback.mock.calls.length;
    flushFrame();

    expect(callback).toHaveBeenCalledTimes(callCount);
    expect(pendingFrames.size).toBe(0);
  });
});
