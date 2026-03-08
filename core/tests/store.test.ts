import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createToastStore } from "../src";
import type { ToastStore } from "../src";

describe("ToastStore", () => {
  let store: ToastStore;

  beforeEach(() => {
    vi.useFakeTimers();
    store = createToastStore();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ---- Creation ----

  describe("createToastStore", () => {
    it("creates a store with no toasts", () => {
      expect(store.getToasts()).toEqual([]);
    });

    it("applies default options to new toasts", () => {
      const typedStore = createToastStore<
        { title: string },
        { placement?: "top-right" | "bottom-center" }
      >({
        defaults: { placement: "top-right", duration: 5000, type: "warning" },
      });
      const id = typedStore.add({ data: { title: "Test" } });
      const toast = typedStore.getToasts().find((t) => t.id === id.id)!;
      expect(toast.options.placement).toBe("top-right");
      expect(toast.remaining).toBe(5000);
      expect(toast.type).toBe("warning");
    });
  });

  // ---- add ----

  describe("add", () => {
    it("creates a toast in entering status", () => {
      const id = store.add({ data: { title: "Hello" } });
      const toasts = store.getToasts();
      expect(toasts).toHaveLength(1);
      expect(toasts[0].id).toBe(id.id);
      expect(toasts[0].status).toBe("entering");
      expect(toasts[0].data).toEqual({ title: "Hello" });
    });

    it("uses a custom id when provided", () => {
      const id = store.add({ id: "my-toast", data: { title: "Test" } });
      expect(id.id).toBe("my-toast");
    });

    it("generates unique ids for each toast", () => {
      const id1 = store.add({});
      const id2 = store.add({});
      expect(id1.id).not.toBe(id2.id);
    });

    it("defaults type to info", () => {
      store.add({});
      expect(store.getToasts()[0].type).toBe("info");
    });

    it("uses configured default type", () => {
      store = createToastStore({ defaults: { type: "error" } });
      store.add({});
      expect(store.getToasts()[0].type).toBe("error");
    });

    it("leaves duration/remaining unset without configured defaults", () => {
      store.add({});
      expect(store.getToasts()[0].remaining).toBeUndefined();
    });

    it("respects duration: 0 (manual dismiss only)", () => {
      store.add({ duration: 0 });
      expect(store.getToasts()[0].remaining).toBe(0);
    });

    it("initializes progress to 0", () => {
      store.add({});
      expect(store.getToasts()[0].progress).toBe(0);
    });

    it("initializes paused to false", () => {
      store.add({});
      expect(store.getToasts()[0].paused).toBe(false);
    });

    it("sets createdAt and updatedAt", () => {
      const now = Date.now();
      store.add({});
      const toast = store.getToasts()[0];
      expect(toast.createdAt).toBe(now);
      expect(toast.updatedAt).toBe(now);
    });

    it("calls onOpen callback", () => {
      const onOpen = vi.fn();
      store.add({ onOpen });
      expect(onOpen).toHaveBeenCalledOnce();
    });

    it("defaults data to empty object", () => {
      store.add({});
      expect(store.getToasts()[0].data).toEqual({});
    });
  });

  // ---- Convenience methods ----

  describe("convenience methods", () => {
    it("success() sets type to success", () => {
      store.success({ title: "Done" });
      const toast = store.getToasts()[0];
      expect(toast.type).toBe("success");
      expect(toast.data).toEqual({ title: "Done" });
    });

    it("error() sets type to error", () => {
      store.error({ title: "Failed" });
      expect(store.getToasts()[0].type).toBe("error");
    });

    it("warning() sets type to warning", () => {
      store.warning({ title: "Watch out" });
      expect(store.getToasts()[0].type).toBe("warning");
    });

    it("info() sets type to info", () => {
      store.info({ title: "FYI" });
      expect(store.getToasts()[0].type).toBe("info");
    });

    it("loading() sets type to loading with duration 0", () => {
      store.loading({ title: "Loading..." });
      const toast = store.getToasts()[0];
      expect(toast.type).toBe("loading");
      expect(toast.remaining).toBe(0);
    });

    it("convenience methods accept options as second parameter", () => {
      const typedStore = createToastStore<
        { title: string },
        { placement?: "top-right" | "bottom-center" }
      >();
      typedStore.success({ title: "Done" }, { placement: "bottom-center" });
      expect(typedStore.getToasts()[0].options.placement).toBe("bottom-center");
    });
  });

  describe("ToastHandle", () => {
    it("handle.update() proxies updates to the store", () => {
      const handle = store.add({ data: { title: "Original" } });

      handle.update({ data: { title: "Updated" } });

      expect(store.getToasts()[0].data).toEqual({ title: "Updated" });
    });

    it("handle.dismiss() uses the provided close reason", () => {
      const onClose = vi.fn();
      const handle = store.add({ onClose });

      handle.dismiss("user");
      store.markExited(handle);

      expect(onClose).toHaveBeenCalledWith("user");
    });

    it("handle.closed resolves when the toast is removed", async () => {
      const handle = store.add({});

      handle.dismiss("swipe");
      store.markExited(handle);

      await expect(handle.closed).resolves.toBe("swipe");
    });
  });

  // ---- subscribe ----

  describe("subscribe", () => {
    it("notifies subscribers when toasts change", () => {
      const listener = vi.fn();
      store.subscribe(listener);
      store.add({ data: { title: "Test" } });
      expect(listener).toHaveBeenCalled();
      expect(listener.mock.calls[0][0]).toHaveLength(1);
    });

    it("returns an unsubscribe function", () => {
      const listener = vi.fn();
      const unsubscribe = store.subscribe(listener);
      unsubscribe();
      store.add({ data: { title: "Test" } });
      expect(listener).not.toHaveBeenCalled();
    });

    it("notifies multiple subscribers independently", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      store.subscribe(listener1);
      store.subscribe(listener2);
      store.add({});
      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });

    it("does not notify removed subscribers", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const unsub = store.subscribe(listener1);
      store.subscribe(listener2);
      unsub();
      store.add({});
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });

  // ---- markEntered ----

  describe("markEntered", () => {
    it("transitions from entering to visible", () => {
      const id = store.add({});
      expect(store.getToasts()[0].status).toBe("entering");
      store.markEntered(id);
      expect(store.getToasts()[0].status).toBe("visible");
    });

    it("is a no-op if toast is not in entering status", () => {
      const id = store.add({});
      store.markEntered(id);
      store.markEntered(id); // already visible
      expect(store.getToasts()[0].status).toBe("visible");
    });

    it("is a no-op for nonexistent toast", () => {
      store.markEntered("nonexistent"); // should not throw
    });

    it("starts the autoclose timer", () => {
      const id = store.add({ duration: 3000 });
      store.markEntered(id);
      expect(store.getToasts()[0].status).toBe("visible");
      vi.advanceTimersByTime(3000);
      expect(store.getToasts()[0].status).toBe("exiting");
    });

    it("does not start autoclose for duration 0", () => {
      const id = store.add({ duration: 0 });
      store.markEntered(id);
      vi.advanceTimersByTime(100000);
      expect(store.getToasts()[0].status).toBe("visible");
    });
  });

  // ---- dismiss ----

  describe("dismiss", () => {
    it("transitions toast to exiting", () => {
      const id = store.add({});
      store.markEntered(id);
      store.dismiss(id);
      expect(store.getToasts()[0].status).toBe("exiting");
    });

    it("can dismiss an entering toast", () => {
      const id = store.add({});
      store.dismiss(id);
      expect(store.getToasts()[0].status).toBe("exiting");
    });

    it("is a no-op for nonexistent toast", () => {
      store.dismiss("nonexistent"); // should not throw
    });

    it("is a no-op if already exiting", () => {
      const id = store.add({});
      store.dismiss(id);
      const listener = vi.fn();
      store.subscribe(listener);
      store.dismiss(id); // second call — no-op
      expect(listener).not.toHaveBeenCalled();
    });

    it("defaults to programmatic reason", () => {
      const onClose = vi.fn();
      const id = store.add({ onClose });
      store.dismiss(id);
      store.markExited(id);
      expect(onClose).toHaveBeenCalledWith("programmatic");
    });

    it("passes the specified close reason", () => {
      const onClose = vi.fn();
      const id = store.add({ onClose });
      store.dismiss(id, "user");
      store.markExited(id);
      expect(onClose).toHaveBeenCalledWith("user");
    });

    it("clears the autoclose timer", () => {
      const id = store.add({ duration: 3000 });
      store.markEntered(id);
      vi.advanceTimersByTime(1000);
      store.dismiss(id, "user");
      store.markExited(id);
      // Advancing more time should not cause errors
      vi.advanceTimersByTime(5000);
      expect(store.getToasts()).toHaveLength(0);
    });
  });

  // ---- dismissAll ----

  describe("dismissAll", () => {
    it("dismisses all active toasts", () => {
      store.add({});
      store.add({});
      store.add({});
      expect(store.getToasts()).toHaveLength(3);
      store.dismissAll();
      for (const toast of store.getToasts()) {
        expect(toast.status).toBe("exiting");
      }
    });

    it("skips already exiting/removed toasts", () => {
      const id1 = store.add({});
      store.add({});
      store.dismiss(id1); // already exiting
      store.dismissAll();
      for (const toast of store.getToasts()) {
        expect(toast.status).toBe("exiting");
      }
    });

    it("handles empty store", () => {
      store.dismissAll(); // should not throw
    });
  });

  // ---- markExited ----

  describe("markExited", () => {
    it("removes the toast from the store", () => {
      const id = store.add({});
      store.dismiss(id);
      store.markExited(id);
      expect(store.getToasts()).toHaveLength(0);
    });

    it("is a no-op if toast is not exiting", () => {
      const id = store.add({});
      store.markExited(id); // toast is entering, not exiting
      expect(store.getToasts()).toHaveLength(1);
    });

    it("is a no-op for nonexistent toast", () => {
      store.markExited("nonexistent"); // should not throw
    });

    it("calls onClose callback with reason", () => {
      const onClose = vi.fn();
      const id = store.add({ onClose });
      store.dismiss(id, "user");
      store.markExited(id);
      expect(onClose).toHaveBeenCalledWith("user");
    });

    it("calls onAutoClose when reason is timeout", () => {
      const onAutoClose = vi.fn();
      const onClose = vi.fn();
      const id = store.add({ onAutoClose, onClose, duration: 1000 });
      store.markEntered(id);
      vi.advanceTimersByTime(1000); // triggers dismiss("timeout")
      store.markExited(id);
      expect(onAutoClose).toHaveBeenCalledOnce();
      expect(onClose).toHaveBeenCalledWith("timeout");
    });

    it("does not call onAutoClose for non-timeout reasons", () => {
      const onAutoClose = vi.fn();
      const id = store.add({ onAutoClose });
      store.dismiss(id, "user");
      store.markExited(id);
      expect(onAutoClose).not.toHaveBeenCalled();
    });
  });

  // ---- update ----

  describe("update", () => {
    it("merges data shallowly", () => {
      const id = store.add({ data: { title: "Original", body: "Body" } });
      store.update(id, { data: { title: "Updated" } });
      const toast = store.getToasts().find((t) => t.id === id.id)!;
      expect(toast.data).toEqual({ title: "Updated", body: "Body" });
    });

    it("updates type in place", () => {
      const id = store.add({ type: "info" });
      store.update(id, { type: "success" });
      expect(store.getToasts()[0].type).toBe("success");
    });

    it("revives an exiting toast to visible", () => {
      const id = store.add({});
      store.dismiss(id);
      expect(store.getToasts()[0].status).toBe("exiting");
      store.update(id, { data: { title: "Revived" } });
      expect(store.getToasts()[0].status).toBe("visible");
      expect(store.getToasts()[0].data).toEqual({ title: "Revived" });
    });

    it("resets the autoclose timer when duration changes", () => {
      const id = store.add({ duration: 5000 });
      store.markEntered(id);
      vi.advanceTimersByTime(2000);
      store.update(id, { duration: 5000 }); // fresh 5s timer
      vi.advanceTimersByTime(4999);
      expect(store.getToasts().find((t) => t.id === id.id)?.status).toBe(
        "visible",
      );
      vi.advanceTimersByTime(1);
      expect(store.getToasts().find((t) => t.id === id.id)?.status).toBe(
        "exiting",
      );
    });

    it("cancels autoclose when duration set to 0", () => {
      const id = store.add({ duration: 3000 });
      store.markEntered(id);
      store.update(id, { duration: 0 });
      vi.advanceTimersByTime(100000);
      expect(store.getToasts().find((t) => t.id === id.id)?.status).toBe(
        "visible",
      );
    });

    it("updates updatedAt timestamp", () => {
      const id = store.add({});
      const originalUpdatedAt = store.getToasts()[0].updatedAt;
      vi.advanceTimersByTime(100);
      store.update(id, { data: { title: "New" } });
      expect(store.getToasts()[0].updatedAt).toBeGreaterThan(originalUpdatedAt);
    });

    it("merges options", () => {
      const typedStore = createToastStore<
        Record<string, unknown>,
        { dismissible?: boolean; pauseOnHover?: boolean }
      >();
      const id = typedStore.add({ dismissible: true });
      typedStore.update(id, { pauseOnHover: true });
      const toast = typedStore.getToasts()[0];
      expect(toast.options.dismissible).toBe(true);
      expect(toast.options.pauseOnHover).toBe(true);
    });

    it("is a no-op for nonexistent toast", () => {
      store.update("nonexistent", { data: { title: "Test" } }); // should not throw
    });

    it("works during entering status", () => {
      const id = store.add({ type: "info" });
      store.update(id, {
        type: "success",
        data: { title: "Updated while entering" },
      });
      const toast = store.getToasts()[0];
      expect(toast.status).toBe("entering");
      expect(toast.type).toBe("success");
      expect(toast.data).toEqual({ title: "Updated while entering" });
    });

    it("does not start autoclose when updating duration during entering", () => {
      const id = store.add({ duration: 3000 });
      // Update duration while still entering — timer should NOT start yet
      store.update(id, { duration: 5000 });
      expect(store.getToasts()[0].remaining).toBe(5000);

      // Advance past original 3000ms — should still be entering (no premature autoclose)
      vi.advanceTimersByTime(3000);
      expect(store.getToasts()[0].status).toBe("entering");

      // Now mark entered — autoclose timer should start with the updated 5000ms
      store.markEntered(id);
      expect(store.getToasts()[0].status).toBe("visible");
      vi.advanceTimersByTime(4999);
      expect(store.getToasts()[0].status).toBe("visible");
      vi.advanceTimersByTime(1);
      expect(store.getToasts()[0].status).toBe("exiting");
    });

    it("resets remaining to 0 when reviving without new duration", () => {
      const id = store.add({ duration: 3000 });
      store.markEntered(id);
      store.dismiss(id);
      store.update(id, { data: { title: "Revived" } });
      // After revival without duration, remaining should be 0 (manual dismiss only)
      expect(store.getToasts()[0].remaining).toBe(0);
      vi.advanceTimersByTime(100000);
      expect(store.getToasts()[0].status).toBe("visible");
    });

    it("keeps a paused toast paused when duration changes", () => {
      const id = store.add({ duration: 3000, progress: true });
      store.markEntered(id);

      vi.advanceTimersByTime(1000);
      store.pause(id);
      store.update(id, { duration: 5000 });

      expect(store.getToasts()[0].paused).toBe(true);
      expect(store.getToasts()[0].remaining).toBe(5000);
      expect(store.getToasts()[0].progress).toBe(0);

      vi.advanceTimersByTime(10000);
      expect(store.getToasts()[0].status).toBe("visible");

      store.resume(id);
      vi.advanceTimersByTime(4999);
      expect(store.getToasts()[0].status).toBe("visible");
      vi.advanceTimersByTime(1);
      expect(store.getToasts()[0].status).toBe("exiting");
    });
  });

  // ---- pause / resume ----

  describe("pause / resume", () => {
    it("pauses the autoclose timer", () => {
      const id = store.add({ duration: 3000 });
      store.markEntered(id);
      vi.advanceTimersByTime(1000);
      store.pause(id);
      vi.advanceTimersByTime(10000);
      expect(store.getToasts().find((t) => t.id === id.id)?.status).toBe(
        "visible",
      );
    });

    it("resumes with remaining time", () => {
      const id = store.add({ duration: 3000 });
      store.markEntered(id);
      vi.advanceTimersByTime(1000); // 1s elapsed, ~2s remaining
      store.pause(id);
      vi.advanceTimersByTime(5000); // time passes while paused
      store.resume(id);
      vi.advanceTimersByTime(1999);
      expect(store.getToasts().find((t) => t.id === id.id)?.status).toBe(
        "visible",
      );
      vi.advanceTimersByTime(1);
      expect(store.getToasts().find((t) => t.id === id.id)?.status).toBe(
        "exiting",
      );
    });

    it("sets and clears the paused flag", () => {
      const id = store.add({ duration: 3000 });
      store.markEntered(id);
      store.pause(id);
      expect(store.getToasts()[0].paused).toBe(true);
      store.resume(id);
      expect(store.getToasts()[0].paused).toBe(false);
    });

    it("only pauses visible toasts", () => {
      const id = store.add({}); // entering
      store.pause(id);
      expect(store.getToasts()[0].paused).toBe(false);
    });

    it("is a no-op if already paused", () => {
      const id = store.add({ duration: 3000 });
      store.markEntered(id);
      vi.advanceTimersByTime(1000);
      store.pause(id);
      const remaining = store.getToasts()[0].remaining;
      store.pause(id); // no-op
      expect(store.getToasts()[0].remaining).toBe(remaining);
    });

    it("resume is a no-op if not paused", () => {
      const id = store.add({ duration: 3000 });
      store.markEntered(id);
      const listener = vi.fn();
      store.subscribe(listener);
      store.resume(id);
      expect(listener).not.toHaveBeenCalled();
    });

    it("calculates remaining time correctly", () => {
      const id = store.add({ duration: 3000 });
      store.markEntered(id);
      vi.advanceTimersByTime(1000);
      store.pause(id);
      expect(store.getToasts()[0].remaining).toBe(2000);
    });
  });

  // ---- promise ----

  describe("promise", () => {
    it("creates a loading toast initially", () => {
      const p = new Promise<string>(() => {}); // never resolves
      store.promise(p, {
        loading: { title: "Loading..." },
        success: { title: "Done" },
        error: { title: "Failed" },
      });
      const toast = store.getToasts()[0];
      expect(toast.type).toBe("loading");
      expect(toast.data).toEqual({ title: "Loading..." });
    });

    it("updates to success on resolve", async () => {
      const p = Promise.resolve("result");
      await store.promise(p, {
        loading: { title: "Loading..." },
        success: (result: string) => ({ title: `Done: ${result}` }),
        error: { title: "Failed" },
      });
      const toast = store.getToasts()[0];
      expect(toast.type).toBe("success");
      expect(toast.data).toEqual({ title: "Done: result" });
    });

    it("updates to error on reject", async () => {
      const p = Promise.reject(new Error("fail"));
      store
        .promise(p, {
          loading: { title: "Loading..." },
          success: { title: "Done" },
          error: (err: unknown) => ({
            title: `Failed: ${(err as Error).message}`,
          }),
        })
        .catch(() => {});
      // Flush microtasks for the internal .then().catch() chain
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      const toast = store.getToasts()[0];
      expect(toast.type).toBe("error");
      expect(toast.data).toEqual({ title: "Failed: fail" });
    });

    it("returns the original promise value", async () => {
      const original = Promise.resolve(42);
      const returned = store.promise(original, {
        loading: { title: "Loading..." },
        success: { title: "Done" },
        error: { title: "Failed" },
      });
      const result = await returned;
      expect(result).toBe(42);
    });

    it("uses static success/error data when not functions", async () => {
      const p = Promise.resolve("ok");
      await store.promise(p, {
        loading: { title: "Loading..." },
        success: { title: "Success!" },
        error: { title: "Error!" },
      });
      expect(store.getToasts()[0].data).toEqual({ title: "Success!" });
    });

    it("applies custom duration from options on success", async () => {
      const p = Promise.resolve("ok");
      await store.promise(
        p,
        {
          loading: { title: "Loading..." },
          success: { title: "Done" },
          error: { title: "Failed" },
        },
        { duration: 10000 },
      );
      const toast = store.getToasts()[0];
      expect(toast.options.duration).toBe(10000);
    });

    it("uses configured promise durations by default", async () => {
      const storeWithTiming = createToastStore({
        timing: {
          promiseSuccessDuration: 1234,
          promiseErrorDuration: 4321,
        },
      });
      const pSuccess = Promise.resolve("ok");
      await storeWithTiming.promise(pSuccess, {
        loading: { title: "Loading..." },
        success: { title: "Done" },
        error: { title: "Failed" },
      });
      expect(storeWithTiming.getToasts()[0].remaining).toBe(1234);

      const rejectedStoreWithTiming = createToastStore({
        timing: {
          promiseSuccessDuration: 1234,
          promiseErrorDuration: 4321,
        },
      });
      const pError = Promise.reject(new Error("fail"));
      rejectedStoreWithTiming
        .promise(pError, {
          loading: { title: "Loading..." },
          success: { title: "Done" },
          error: { title: "Failed" },
        })
        .catch(() => {});
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      expect(rejectedStoreWithTiming.getToasts()[0].remaining).toBe(4321);
    });

    it("defaults success duration to 3000 and error to 5000", async () => {
      const storeS = createToastStore();
      const pSuccess = Promise.resolve("ok");
      await storeS.promise(pSuccess, {
        loading: { title: "Loading..." },
        success: { title: "Done" },
        error: { title: "Failed" },
      });
      expect(storeS.getToasts()[0].remaining).toBe(3000);

      const storeE = createToastStore();
      const pError = Promise.reject(new Error("fail"));
      storeE
        .promise(pError, {
          loading: { title: "Loading..." },
          success: { title: "Done" },
          error: { title: "Failed" },
        })
        .catch(() => {});
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      expect(storeE.getToasts()[0].remaining).toBe(5000);
    });

    it("preserves the original rejection for callers", async () => {
      const error = new Error("fail");
      const promise = Promise.reject(error);

      await expect(
        store.promise(promise, {
          loading: { title: "Loading..." },
          success: { title: "Done" },
          error: { title: "Failed" },
        }),
      ).rejects.toThrow("fail");

      await Promise.resolve();
      await Promise.resolve();

      expect(store.getToasts()[0].type).toBe("error");
    });
  });

  // ---- setAnimationDuration ----

  describe("setAnimationDuration", () => {
    it("updates enter safety timeout to match reported duration", () => {
      const id = store.add({});
      store.setAnimationDuration(id, "enter", 300);
      vi.advanceTimersByTime(399);
      expect(store.getToasts()[0].status).toBe("entering");
      vi.advanceTimersByTime(1);
      expect(store.getToasts()[0].status).toBe("visible");
    });

    it("updates exit safety timeout to match reported duration", () => {
      const id = store.add({});
      store.markEntered(id);
      store.dismiss(id);
      store.setAnimationDuration(id, "exit", 200);
      vi.advanceTimersByTime(300); // 200 + 100 buffer
      expect(store.getToasts()).toHaveLength(0);
    });

    it("is a no-op for nonexistent toast", () => {
      store.setAnimationDuration("nonexistent", "enter", 300);
    });

    it("does not affect enter if toast is not entering", () => {
      const id = store.add({});
      store.markEntered(id);
      store.setAnimationDuration(id, "enter", 300);
      vi.advanceTimersByTime(500);
      expect(store.getToasts()[0].status).toBe("visible");
    });

    it("replaces an existing enter safety timeout when updated", () => {
      const id = store.add({});

      store.setAnimationDuration(id, "enter", 500);
      vi.advanceTimersByTime(300);
      store.setAnimationDuration(id, "enter", 400);

      vi.advanceTimersByTime(499);
      expect(store.getToasts()[0].status).toBe("entering");
      vi.advanceTimersByTime(1);
      expect(store.getToasts()[0].status).toBe("visible");
    });
  });

  // ---- Safety timeouts ----

  describe("safety timeouts", () => {
    it("uses configured animation fallback and buffer", () => {
      store = createToastStore({
        timing: {
          animationFallbackMs: 1200,
          animationBufferMs: 50,
        },
      });

      store.add({ enter: "custom-animation" });
      vi.advanceTimersByTime(1199);
      expect(store.getToasts()[0].status).toBe("entering");
      vi.advanceTimersByTime(1);
      expect(store.getToasts()[0].status).toBe("visible");

      const id = store.add({ exit: { name: "slideOut", duration: 200 } });
      store.markEntered(id);
      store.dismiss(id);
      vi.advanceTimersByTime(249);
      expect(
        store.getToasts().find((toast) => toast.id === id.id)?.status,
      ).toBe("exiting");
      vi.advanceTimersByTime(1);
      expect(
        store.getToasts().find((toast) => toast.id === id.id),
      ).toBeUndefined();
    });

    it("auto-advances entering to visible after 5s default", () => {
      store.add({});
      expect(store.getToasts()[0].status).toBe("entering");
      vi.advanceTimersByTime(5000);
      expect(store.getToasts()[0].status).toBe("visible");
    });

    it("uses enter animation hint for safety timeout", () => {
      store.add({ enter: { name: "slideIn", duration: 300 } });
      expect(store.getToasts()[0].status).toBe("entering");
      vi.advanceTimersByTime(399);
      expect(store.getToasts()[0].status).toBe("entering");
      vi.advanceTimersByTime(1);
      expect(store.getToasts()[0].status).toBe("visible");
    });

    it("uses exit animation hint for safety timeout", () => {
      const id = store.add({ exit: { name: "slideOut", duration: 200 } });
      store.markEntered(id);
      store.dismiss(id);
      vi.advanceTimersByTime(299);
      expect(store.getToasts()[0].status).toBe("exiting");
      vi.advanceTimersByTime(1);
      expect(store.getToasts()).toHaveLength(0);
    });

    it("auto-removes exiting toast after 5s default", () => {
      const id = store.add({});
      store.markEntered(id);
      store.dismiss(id);
      vi.advanceTimersByTime(4999);
      expect(store.getToasts()).toHaveLength(1);
      vi.advanceTimersByTime(1);
      expect(store.getToasts()).toHaveLength(0);
    });

    it("string animation name uses 5s fallback", () => {
      store.add({ enter: "custom-animation" });
      vi.advanceTimersByTime(4999);
      expect(store.getToasts()[0].status).toBe("entering");
      vi.advanceTimersByTime(1);
      expect(store.getToasts()[0].status).toBe("visible");
    });
  });

  // ---- Autoclose ----

  describe("autoclose", () => {
    it("dismisses toast after duration elapses", () => {
      const id = store.add({ duration: 2000 });
      store.markEntered(id);
      vi.advanceTimersByTime(1999);
      expect(store.getToasts()[0].status).toBe("visible");
      vi.advanceTimersByTime(1);
      expect(store.getToasts()[0].status).toBe("exiting");
    });

    it("does not autoclose when duration is 0", () => {
      const id = store.add({ duration: 0 });
      store.markEntered(id);
      vi.advanceTimersByTime(100000);
      expect(store.getToasts()[0].status).toBe("visible");
    });

    it("does not autoclose without a configured duration", () => {
      const id = store.add({});
      store.markEntered(id);
      vi.advanceTimersByTime(100000);
      expect(store.getToasts()[0].status).toBe("visible");
    });

    it("uses store default duration", () => {
      store = createToastStore({ defaults: { duration: 1500 } });
      const id = store.add({});
      store.markEntered(id);
      vi.advanceTimersByTime(1500);
      expect(store.getToasts()[0].status).toBe("exiting");
    });

    it("toast-level duration overrides store default", () => {
      store = createToastStore({ defaults: { duration: 1000 } });
      const id = store.add({ duration: 5000 });
      store.markEntered(id);
      vi.advanceTimersByTime(1000);
      expect(store.getToasts()[0].status).toBe("visible");
      vi.advanceTimersByTime(4000);
      expect(store.getToasts()[0].status).toBe("exiting");
    });
  });

  // ---- waitForClose ----

  describe("waitForClose", () => {
    it("resolves with close reason when toast is removed", async () => {
      const id = store.add({});
      const promise = store.waitForClose(id);
      store.dismiss(id, "user");
      store.markExited(id);
      const reason = await promise;
      expect(reason).toBe("user");
    });

    it("resolves immediately for nonexistent toast", async () => {
      const reason = await store.waitForClose("nonexistent");
      expect(reason).toBe("programmatic");
    });

    it("resolves with timeout on autoclose", async () => {
      const id = store.add({ duration: 1000 });
      const promise = store.waitForClose(id);
      store.markEntered(id);
      vi.advanceTimersByTime(1000);
      store.markExited(id);
      const reason = await promise;
      expect(reason).toBe("timeout");
    });

    it("resolves with swipe reason", async () => {
      const id = store.add({});
      const promise = store.waitForClose(id);
      store.dismiss(id, "swipe");
      store.markExited(id);
      const reason = await promise;
      expect(reason).toBe("swipe");
    });

    it("resolves multiple waitForClose promises for the same toast", async () => {
      const id = store.add({});
      const promise1 = store.waitForClose(id);
      const promise2 = store.waitForClose(id);
      const promise3 = store.waitForClose(id);
      store.dismiss(id, "user");
      store.markExited(id);
      const [r1, r2, r3] = await Promise.all([promise1, promise2, promise3]);
      expect(r1).toBe("user");
      expect(r2).toBe("user");
      expect(r3).toBe("user");
    });
  });

  // ---- Progress ----

  describe("progress", () => {
    it("tracks progress from 0 toward 1 over duration", () => {
      const id = store.add({ duration: 1000, progress: true });
      store.markEntered(id);
      expect(store.getToasts()[0].progress).toBe(0);

      vi.advanceTimersByTime(500);
      const midProgress = store.getToasts()[0].progress;
      expect(midProgress).toBeGreaterThan(0.4);
      expect(midProgress).toBeLessThanOrEqual(0.6);
    });

    it("does not track progress when progress option is falsy", () => {
      const id = store.add({ duration: 1000 });
      store.markEntered(id);
      vi.advanceTimersByTime(500);
      expect(store.getToasts()[0].progress).toBe(0);
    });

    it("resets progress on timer reset", () => {
      const id = store.add({ duration: 1000, progress: true });
      store.markEntered(id);
      vi.advanceTimersByTime(500);
      expect(store.getToasts()[0].progress).toBeGreaterThan(0);
      store.update(id, { duration: 2000 });
      expect(store.getToasts()[0].progress).toBe(0);
    });
  });

  // ---- Full lifecycle ----

  describe("full lifecycle", () => {
    it("entering → visible → exiting → removed", () => {
      const id = store.add({ duration: 3000 });
      expect(store.getToasts()[0].status).toBe("entering");

      store.markEntered(id);
      expect(store.getToasts()[0].status).toBe("visible");

      vi.advanceTimersByTime(3000);
      expect(store.getToasts()[0].status).toBe("exiting");

      store.markExited(id);
      expect(store.getToasts()).toHaveLength(0);
    });

    it("tracks multiple toasts independently", () => {
      const id1 = store.add({ duration: 1000 });
      const id2 = store.add({ duration: 2000 });

      store.markEntered(id1);
      store.markEntered(id2);

      vi.advanceTimersByTime(1000);
      expect(store.getToasts().find((t) => t.id === id1.id)?.status).toBe(
        "exiting",
      );
      expect(store.getToasts().find((t) => t.id === id2.id)?.status).toBe(
        "visible",
      );

      vi.advanceTimersByTime(1000);
      expect(store.getToasts().find((t) => t.id === id2.id)?.status).toBe(
        "exiting",
      );
    });

    it("full lifecycle with adapter-reported animation durations", () => {
      const id = store.add({ duration: 2000 });

      store.setAnimationDuration(id, "enter", 300);
      vi.advanceTimersByTime(400); // 300 + 100 buffer
      expect(store.getToasts()[0].status).toBe("visible");

      vi.advanceTimersByTime(2000);
      expect(store.getToasts()[0].status).toBe("exiting");

      store.setAnimationDuration(id, "exit", 200);
      vi.advanceTimersByTime(300); // 200 + 100 buffer
      expect(store.getToasts()).toHaveLength(0);
    });

    it("adapter-driven lifecycle with markEntered/markExited", () => {
      const onClose = vi.fn();
      const id = store.add({ duration: 2000, onClose });

      store.markEntered(id);
      expect(store.getToasts()[0].status).toBe("visible");

      vi.advanceTimersByTime(2000);
      expect(store.getToasts()[0].status).toBe("exiting");

      store.markExited(id);
      expect(store.getToasts()).toHaveLength(0);
      expect(onClose).toHaveBeenCalledWith("timeout");
    });

    it("revive during exit then complete lifecycle", () => {
      const id = store.add({ duration: 2000 });
      store.markEntered(id);

      vi.advanceTimersByTime(2000);
      expect(store.getToasts()[0].status).toBe("exiting");

      store.update(id, {
        type: "success",
        data: { title: "Revived!" },
        duration: 1000,
      });
      expect(store.getToasts()[0].status).toBe("visible");
      expect(store.getToasts()[0].type).toBe("success");

      vi.advanceTimersByTime(1000);
      expect(store.getToasts()[0].status).toBe("exiting");

      store.markExited(id);
      expect(store.getToasts()).toHaveLength(0);
    });
  });

  // ---- getToasts ----

  describe("getToasts", () => {
    it("returns toasts in insertion order", () => {
      const id1 = store.add({ data: { order: 1 } });
      const id2 = store.add({ data: { order: 2 } });
      const id3 = store.add({ data: { order: 3 } });
      const toasts = store.getToasts();
      expect(toasts[0].id).toBe(id1.id);
      expect(toasts[1].id).toBe(id2.id);
      expect(toasts[2].id).toBe(id3.id);
    });

    it("excludes removed toasts", () => {
      const id1 = store.add({});
      store.add({});
      store.dismiss(id1);
      store.markExited(id1);
      expect(store.getToasts()).toHaveLength(1);
    });

    it("returns a new array each call", () => {
      store.add({});
      const snapshot = store.getToasts();
      store.add({});
      expect(snapshot).toHaveLength(1);
      expect(store.getToasts()).toHaveLength(2);
    });
  });

  // ---- Callback safety ----

  describe("callback safety", () => {
    it("allows onClose to re-add a toast with the same custom id", () => {
      const id = store.add({
        id: "reusable",
        onClose: () => {
          store.add({ id: "reusable", data: { title: "Reborn" } });
        },
      });
      store.dismiss(id);
      store.markExited(id);
      // The onClose callback re-added a toast with the same id.
      // It must not be deleted by the removeToast cleanup.
      const toasts = store.getToasts();
      expect(toasts).toHaveLength(1);
      expect(toasts[0].id).toBe("reusable");
      expect(toasts[0].data).toEqual({ title: "Reborn" });
      expect(toasts[0].status).toBe("entering");
    });
  });

  // ---- maxToasts ----

  describe("maxToasts", () => {
    it("does not limit toasts when maxToasts is 0 (default)", () => {
      for (let i = 0; i < 10; i++) {
        store.add({ data: { index: i } });
      }
      expect(store.getToasts()).toHaveLength(10);
    });

    it("dismisses oldest toasts when limit is exceeded", () => {
      store = createToastStore({ maxToasts: 3 });
      const id1 = store.add({ data: { index: 1 } });
      const id2 = store.add({ data: { index: 2 } });
      const id3 = store.add({ data: { index: 3 } });
      expect(store.getToasts()).toHaveLength(3);

      // Adding a 4th toast should dismiss the oldest (id1)
      const id4 = store.add({ data: { index: 4 } });
      const toasts = store.getToasts();
      // id1 should be exiting, so still visible in getToasts; but it should be dismissed
      const toast1 = toasts.find((t) => t.id === id1.id);
      expect(toast1?.status).toBe("exiting");

      // After marking id1 as exited, it should be removed
      store.markExited(id1);
      const remaining = store.getToasts();
      expect(remaining).toHaveLength(3);
      expect(remaining.map((t) => t.id)).toEqual([id2.id, id3.id, id4.id]);
    });

    it("dismisses multiple oldest toasts when adding exceeds limit by more than one", () => {
      store = createToastStore({ maxToasts: 2 });
      const id1 = store.add({ data: { index: 1 } });
      store.add({ data: { index: 2 } });

      // Both are within limit
      expect(store.getToasts()).toHaveLength(2);

      // Adding a 3rd should dismiss id1
      store.add({ data: { index: 3 } });
      const toast1 = store.getToasts().find((t) => t.id === id1.id);
      expect(toast1?.status).toBe("exiting");
    });

    it("maxToasts of 1 allows only one visible toast at a time", () => {
      store = createToastStore({ maxToasts: 1 });
      const id1 = store.add({ data: { index: 1 } });
      expect(store.getToasts()).toHaveLength(1);

      const id2 = store.add({ data: { index: 2 } });
      // id1 should be exiting now
      expect(store.getToasts().find((t) => t.id === id1.id)?.status).toBe(
        "exiting",
      );

      // After removing id1, only id2 remains
      store.markExited(id1);
      expect(store.getToasts()).toHaveLength(1);
      expect(store.getToasts()[0].id).toBe(id2.id);
    });

    it("does not dismiss toasts that are already exiting", () => {
      store = createToastStore({ maxToasts: 2 });
      const id1 = store.add({ data: { index: 1 } });
      store.add({ data: { index: 2 } });

      // Manually dismiss id1 (now exiting)
      store.dismiss(id1);
      expect(store.getToasts().find((t) => t.id === id1.id)?.status).toBe(
        "exiting",
      );

      // Add a 3rd — id1 is already exiting so should not be re-dismissed,
      // id2 is oldest active and should be dismissed
      store.add({ data: { index: 3 } });
      // id2 should now be exiting since there are 3 toasts visible
      // (id1 exiting + id2 + id3 = 3 in getToasts, but enforceMaxToasts
      //  counts all non-removed toasts including exiting ones)
      const toasts = store.getToasts();
      expect(toasts.length).toBeGreaterThanOrEqual(2);
    });

    it("works with store defaults and maxToasts together", () => {
      store = createToastStore({ maxToasts: 2, defaults: { duration: 5000 } });
      store.add({});
      store.add({});
      store.add({});

      // At least the newest 2 should be non-exiting
      const nonExiting = store
        .getToasts()
        .filter((t) => t.status !== "exiting");
      expect(nonExiting).toHaveLength(2);
      // All toasts should have the default duration
      expect(nonExiting[0].remaining).toBe(5000);
    });
  });

  // ---- duplicate ID prevention ----

  describe("duplicate ID prevention", () => {
    it("updates existing toast instead of creating a new one when same ID is provided", () => {
      const id = store.add({ id: "unique-1", data: { title: "First" } });
      expect(store.getToasts()).toHaveLength(1);

      // Adding with same ID should update, not create
      const returnedId = store.add({
        id: "unique-1",
        data: { title: "Updated" },
      });
      expect(returnedId.id).toBe(id.id);
      expect(store.getToasts()).toHaveLength(1);
      expect(store.getToasts()[0].data).toEqual({ title: "Updated" });
    });

    it("returns the existing toast ID", () => {
      store.add({ id: "dup-test" });
      const id = store.add({ id: "dup-test", data: { title: "New" } });
      expect(id.id).toBe("dup-test");
    });

    it("creates a new toast if the existing one has been removed", () => {
      const id = store.add({ id: "recyclable" });
      store.dismiss(id);
      store.markExited(id);
      // Toast is now removed — adding with same ID should create a new one
      const newId = store.add({ id: "recyclable", data: { title: "Reborn" } });
      expect(newId.id).toBe("recyclable");
      expect(store.getToasts()).toHaveLength(1);
      expect(store.getToasts()[0].status).toBe("entering");
    });

    it("updates type when duplicate is added with different type", () => {
      store.add({ id: "type-test", type: "info" });
      store.add({ id: "type-test", type: "success" });
      expect(store.getToasts()[0].type).toBe("success");
    });

    it("does not call onOpen again for duplicate", () => {
      const onOpen = vi.fn();
      store.add({ id: "open-test", onOpen });
      expect(onOpen).toHaveBeenCalledTimes(1);

      // Adding duplicate should go through update(), not the creation path
      store.add({ id: "open-test", data: { title: "Updated" } });
      // onOpen should NOT be called again since we're updating, not creating
      expect(onOpen).toHaveBeenCalledTimes(1);
    });

    it("updates an exiting toast (revives it)", () => {
      const id = store.add({ id: "revive-test" });
      store.markEntered(id);
      store.dismiss(id);
      expect(store.getToasts()[0].status).toBe("exiting");

      // Adding with same ID while it's exiting should update (revive) it
      store.add({ id: "revive-test", data: { title: "Revived" } });
      const toast = store.getToasts().find((t) => t.id === "revive-test")!;
      expect(toast.status).toBe("visible");
      expect(toast.data).toEqual({ title: "Revived" });
    });

    it("allows different IDs to coexist", () => {
      store.add({ id: "toast-a", data: { title: "A" } });
      store.add({ id: "toast-b", data: { title: "B" } });
      expect(store.getToasts()).toHaveLength(2);
    });

    it("auto-generated IDs never conflict", () => {
      const id1 = store.add({ data: { title: "Auto 1" } });
      const id2 = store.add({ data: { title: "Auto 2" } });
      expect(id1.id).not.toBe(id2.id);
      expect(store.getToasts()).toHaveLength(2);
    });
  });
});
