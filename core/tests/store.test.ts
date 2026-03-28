import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createToastStore,
  CLOSE_REASON,
  TOAST_PHASE,
  TOAST_STATUS,
  TOAST_TYPE,
} from "../src";
import type { ToastCustomOptions, ToastData, ToastStore } from "../src";

function getToast<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
>(store: ToastStore<TData, TCustom>, id?: string) {
  const toasts = store.getToasts();

  if (!id) {
    expect(toasts).toHaveLength(1);
    return toasts[0];
  }

  const toast = toasts.find((currentToast) => currentToast.id === id);
  expect(toast).toBeDefined();
  return toast!;
}

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
}

describe("createToastStore", () => {
  let store: ToastStore;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
    store = createToastStore();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("creation and identity", () => {
    it("applies defaults and normalizes missing data", () => {
      const typedStore = createToastStore<
        { title?: string },
        { placement?: "top-right" | "bottom-center" }
      >({
        defaults: {
          type: TOAST_TYPE.WARNING,
          duration: 5000,
          placement: "top-right",
        },
      });

      const handle = typedStore.add({});
      const toast = getToast(typedStore, handle.id);

      expect(toast).toMatchObject({
        id: handle.id,
        status: TOAST_STATUS.ENTERING,
        type: TOAST_TYPE.WARNING,
        remaining: 5000,
        paused: false,
        progress: 0,
        data: {},
      });
      expect(toast.options.placement).toBe("top-right");
    });

    it("reuses an existing id instead of creating a duplicate toast", () => {
      store.add({ id: "same-id", data: { title: "First", body: "Body" } });

      const returnedHandle = store.add({
        id: "same-id",
        type: TOAST_TYPE.SUCCESS,
        data: { title: "Updated" },
      });

      const toast = getToast(store, returnedHandle.id);

      expect(store.getToasts()).toHaveLength(1);
      expect(toast.type).toBe(TOAST_TYPE.SUCCESS);
      expect(toast.data).toEqual({ title: "Updated", body: "Body" });
    });

    it("revives an exiting toast when the same id is added again", () => {
      const handle = store.add({ id: "revive-me", duration: 1000 });

      store.markEntered(handle);
      store.dismiss(handle, CLOSE_REASON.USER);
      expect(getToast(store, handle.id).status).toBe(TOAST_STATUS.EXITING);

      store.add({
        id: "revive-me",
        type: TOAST_TYPE.SUCCESS,
        duration: 2000,
        data: { title: "Back again" },
      });

      const toast = getToast(store, handle.id);
      expect(toast.status).toBe(TOAST_STATUS.VISIBLE);
      expect(toast.type).toBe(TOAST_TYPE.SUCCESS);
      expect(toast.remaining).toBe(2000);
      expect(toast.data).toEqual({ title: "Back again" });
    });
  });

  describe("subscriptions", () => {
    it("publishes lifecycle snapshots and supports unsubscribe", () => {
      const listener = vi.fn();
      const unsubscribe = store.subscribe(listener);
      const handle = store.add({ duration: 1000 });

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0][0]?.status).toBe(TOAST_STATUS.ENTERING);

      store.markEntered(handle);
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener.mock.calls[1][0][0]?.status).toBe(TOAST_STATUS.VISIBLE);

      unsubscribe();
      store.dismiss(handle);
      expect(listener).toHaveBeenCalledTimes(2);
    });
  });

  describe("lifecycle", () => {
    it("auto closes after becoming visible and resolves the close handle", async () => {
      const onClose = vi.fn();
      const onAutoClose = vi.fn();
      const handle = store.add({
        duration: 1000,
        onClose,
        onAutoClose,
      });

      store.markEntered(handle);
      expect(getToast(store, handle.id).status).toBe(TOAST_STATUS.VISIBLE);

      vi.advanceTimersByTime(1000);
      expect(getToast(store, handle.id).status).toBe(TOAST_STATUS.EXITING);

      store.markExited(handle);

      await expect(handle.closed).resolves.toBe(CLOSE_REASON.TIMEOUT);
      expect(store.getToasts()).toEqual([]);
      expect(onClose).toHaveBeenCalledWith(CLOSE_REASON.TIMEOUT);
      expect(onAutoClose).toHaveBeenCalledOnce();
    });

    it("can dismiss while entering and keeps the explicit close reason", async () => {
      const handle = store.add({});
      const closePromise = store.waitForClose(handle);

      store.dismiss(handle, CLOSE_REASON.SWIPE);
      expect(getToast(store, handle.id).status).toBe(TOAST_STATUS.EXITING);

      store.markExited(handle);
      await expect(closePromise).resolves.toBe(CLOSE_REASON.SWIPE);
    });

    it("lets onClose safely recreate a toast with the same id", () => {
      const handle = store.add({
        id: "reusable",
        onClose: () => {
          store.add({ id: "reusable", data: { title: "Reborn" } });
        },
      });

      store.dismiss(handle);
      store.markExited(handle);

      const toast = getToast(store, "reusable");
      expect(toast.status).toBe(TOAST_STATUS.ENTERING);
      expect(toast.data).toEqual({ title: "Reborn" });
    });
  });

  describe("timing controls", () => {
    it("pauses and resumes autoclose without losing remaining time", () => {
      const handle = store.add({ duration: 4000, progress: true });

      store.markEntered(handle);
      vi.advanceTimersByTime(1000);

      const progressBeforePause = getToast(store, handle.id).progress;
      store.pause(handle);
      const pausedToast = getToast(store, handle.id);

      expect(pausedToast.paused).toBe(true);
      expect(pausedToast.remaining).toBe(3000);
      expect(progressBeforePause).toBeGreaterThan(0);

      vi.advanceTimersByTime(5000);
      expect(getToast(store, handle.id).status).toBe(TOAST_STATUS.VISIBLE);

      store.resume(handle);
      expect(getToast(store, handle.id).paused).toBe(false);

      vi.advanceTimersByTime(2999);
      expect(getToast(store, handle.id).status).toBe(TOAST_STATUS.VISIBLE);

      vi.advanceTimersByTime(1);
      expect(getToast(store, handle.id).status).toBe(TOAST_STATUS.EXITING);
    });

    it("pauseAll pauses all visible toasts", () => {
      const a = store.add({ duration: 3000 });
      const b = store.add({ duration: 5000 });

      store.markEntered(a);
      store.markEntered(b);

      store.pauseAll();

      expect(getToast(store, a.id).paused).toBe(true);
      expect(getToast(store, b.id).paused).toBe(true);

      vi.advanceTimersByTime(10000);
      expect(getToast(store, a.id).status).toBe(TOAST_STATUS.VISIBLE);
      expect(getToast(store, b.id).status).toBe(TOAST_STATUS.VISIBLE);
    });

    it("pauseAll skips entering, exiting and already-paused toasts", () => {
      const entering = store.add({ duration: 3000 });
      const visible = store.add({ duration: 3000 });
      const paused = store.add({ duration: 3000 });

      store.markEntered(visible);
      store.markEntered(paused);
      store.pause(paused);

      const listener = vi.fn();
      store.subscribe(listener);

      store.pauseAll();

      expect(getToast(store, entering.id).paused).toBe(false);
      expect(getToast(store, visible.id).paused).toBe(true);
      expect(getToast(store, paused.id).paused).toBe(true);

      // Only one notification for the one toast that transitioned
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("resumeAll resumes all paused toasts", () => {
      const a = store.add({ duration: 3000 });
      const b = store.add({ duration: 5000 });

      store.markEntered(a);
      store.markEntered(b);
      vi.advanceTimersByTime(1000);

      store.pauseAll();

      expect(getToast(store, a.id).remaining).toBe(2000);
      expect(getToast(store, b.id).remaining).toBe(4000);

      store.resumeAll();

      expect(getToast(store, a.id).paused).toBe(false);
      expect(getToast(store, b.id).paused).toBe(false);

      vi.advanceTimersByTime(1999);
      expect(getToast(store, a.id).status).toBe(TOAST_STATUS.VISIBLE);

      vi.advanceTimersByTime(1);
      expect(getToast(store, a.id).status).toBe(TOAST_STATUS.EXITING);

      vi.advanceTimersByTime(1999);
      expect(getToast(store, b.id).status).toBe(TOAST_STATUS.VISIBLE);

      vi.advanceTimersByTime(1);
      expect(getToast(store, b.id).status).toBe(TOAST_STATUS.EXITING);
    });

    it("resumeAll skips toasts that are not paused", () => {
      const a = store.add({ duration: 3000 });
      store.markEntered(a);

      const listener = vi.fn();
      store.subscribe(listener);

      store.resumeAll();

      expect(listener).not.toHaveBeenCalled();
    });

    it("restarts autoclose when the duration is updated", () => {
      const handle = store.add({ duration: 1000 });

      store.markEntered(handle);
      vi.advanceTimersByTime(900);

      store.update(handle, { duration: 1000 });
      expect(getToast(store, handle.id).remaining).toBe(1000);

      vi.advanceTimersByTime(999);
      expect(getToast(store, handle.id).status).toBe(TOAST_STATUS.VISIBLE);

      vi.advanceTimersByTime(1);
      expect(getToast(store, handle.id).status).toBe(TOAST_STATUS.EXITING);
    });

    it("clears the previous close reason when an exiting toast is revived", async () => {
      const onClose = vi.fn();
      const handle = store.add({ duration: 1000, onClose });

      store.markEntered(handle);
      store.dismiss(handle, CLOSE_REASON.USER);
      store.update(handle, { type: TOAST_TYPE.SUCCESS, duration: 500 });

      expect(getToast(store, handle.id).status).toBe(TOAST_STATUS.VISIBLE);

      vi.advanceTimersByTime(500);
      store.markExited(handle);

      await expect(handle.closed).resolves.toBe(CLOSE_REASON.TIMEOUT);
      expect(onClose).toHaveBeenCalledOnce();
      expect(onClose).toHaveBeenCalledWith(CLOSE_REASON.TIMEOUT);
    });

    it("uses animation hints and adapter-reported durations for safety timeouts", () => {
      const handle = store.add({ enter: { name: "fade-in", duration: 300 } });

      vi.advanceTimersByTime(399);
      expect(getToast(store, handle.id).status).toBe(TOAST_STATUS.ENTERING);

      vi.advanceTimersByTime(1);
      expect(getToast(store, handle.id).status).toBe(TOAST_STATUS.VISIBLE);

      store.dismiss(handle);
      store.setAnimationDuration(handle, TOAST_PHASE.EXIT, 200);

      vi.advanceTimersByTime(299);
      expect(getToast(store, handle.id).status).toBe(TOAST_STATUS.EXITING);

      vi.advanceTimersByTime(1);
      expect(store.getToasts()).toEqual([]);
    });
  });

  describe("resource limits", () => {
    it("dismisses the oldest active toast when maxToasts is exceeded", () => {
      store = createToastStore({ maxToasts: 2 });

      const first = store.add({ id: "first" });
      const second = store.add({ id: "second" });
      store.add({ id: "third" });

      expect(getToast(store, first.id).status).toBe(TOAST_STATUS.EXITING);
      expect(getToast(store, second.id).status).toBe(TOAST_STATUS.ENTERING);

      store.add({ id: "fourth" });

      expect(getToast(store, second.id).status).toBe(TOAST_STATUS.EXITING);
    });
  });

  describe("cleanup", () => {
    it("destroy clears timers, toasts, and subscribers", () => {
      const listener = vi.fn();
      store.subscribe(listener);

      const handle = store.add({ duration: 1000, progress: true });
      store.markEntered(handle);

      store.destroy();
      vi.advanceTimersByTime(5000);

      expect(store.getToasts()).toEqual([]);

      store.add({});
      expect(listener).toHaveBeenCalledTimes(2);
    });
  });

  describe("promise toasts", () => {
    it("turns a loading toast into a success toast and keeps the original promise value", async () => {
      const promise = Promise.resolve("done");

      const returned = store.promise(
        promise,
        {
          loading: { title: "Loading" },
          success: (result) => ({ title: `Saved: ${result}` }),
          error: { title: "Failed" },
        },
        { duration: 2500 },
      );

      await expect(returned).resolves.toBe("done");
      await flushPromises();

      const toast = getToast(store);
      expect(toast.type).toBe(TOAST_TYPE.SUCCESS);
      expect(toast.data).toEqual({ title: "Saved: done" });
      expect(toast.remaining).toBe(2500);
    });

    it("turns a loading toast into an error toast without swallowing the rejection", async () => {
      const error = new Error("boom");
      const promise = Promise.reject(error);

      await expect(
        store.promise(promise, {
          loading: { title: "Loading" },
          success: { title: "Saved" },
          error: (reason) => ({
            title: `Failed: ${(reason as Error).message}`,
          }),
        }),
      ).rejects.toThrow("boom");

      await flushPromises();

      const toast = getToast(store);
      expect(toast.type).toBe(TOAST_TYPE.ERROR);
      expect(toast.data).toEqual({ title: "Failed: boom" });
      expect(toast.remaining).toBe(5000);
    });
  });

  describe("known issue", () => {
    it.fails(
      "does not start progress tracking when progress is enabled during a duration reset",
      () => {
        const handle = store.add({ duration: 1000, progress: false });

        store.markEntered(handle);
        store.update(handle, { duration: 1000, progress: true });

        vi.advanceTimersByTime(500);

        expect(getToast(store, handle.id).progress).toBeGreaterThan(0);
      },
    );
  });
});
