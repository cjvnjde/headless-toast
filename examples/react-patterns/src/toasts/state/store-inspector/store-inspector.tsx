import { useEffect, useRef, useState } from "react";
import {
  Toaster,
  createToast,
  useStore,
  useToast,
  useToastAnimation,
} from "@headless-toast/react";
import type { ReactToastState, ReactToastStore } from "@headless-toast/react";
import { ExamplePage } from "#/components/ExamplePage";
import { extractExampleSource } from "#/lib/exampleSource";
import rawSource from "./store-inspector.tsx?raw";

const storeA = createToast<{ title: string; body: string }>({
  defaults: { placement: "top-left", duration: 3000, pauseOnHover: true },
}).toast;

const storeB = createToast<{ title: string; body: string }>({
  defaults: { placement: "top-right", duration: 5000, pauseOnHover: true },
}).toast;

type InspectorToastState = ReactToastState<{ title: string; body: string }>;

type ToastTimingAnchor = {
  startedAt: number;
  remainingAtStart: number;
};

function formatRemaining(ms: number) {
  if (ms >= 60_000) {
    const minutes = Math.floor(ms / 60_000);
    const seconds = Math.floor((ms % 60_000) / 1000);

    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }

  if (ms >= 10_000) {
    return `${Math.ceil(ms / 1000)}s`;
  }

  return `${(ms / 1000).toFixed(1)}s`;
}

function getTimingSnapshot(
  toast: InspectorToastState,
  now: number,
  anchor?: ToastTimingAnchor,
) {
  const duration = toast.options.duration ?? 0;

  if (duration === 0) {
    return { label: "persistent", progress: null };
  }

  if (toast.status === "exiting") {
    return { label: "closing", progress: 1 };
  }

  if (toast.status !== "visible") {
    return {
      label: formatRemaining(toast.remaining ?? duration),
      progress: 0,
    };
  }

  const remaining = toast.paused
    ? (toast.remaining ?? duration)
    : anchor
      ? Math.max(anchor.remainingAtStart - (now - anchor.startedAt), 0)
      : (toast.remaining ?? duration);

  return {
    label: formatRemaining(remaining),
    progress: Math.min(Math.max(1 - remaining / duration, 0), 1),
  };
}

function InspectorToast() {
  const { toast, dismiss } = useToast<{ title: string; body: string }>();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className:
      "origin-top-right transition duration-200 ease-out will-change-[translate,scale,opacity] data-[toast-status=entering]:starting:opacity-0 data-[toast-status=entering]:starting:-translate-y-3 data-[toast-status=entering]:starting:scale-95 data-[toast-status=exiting]:opacity-0 data-[toast-status=exiting]:-translate-y-2 data-[toast-status=exiting]:scale-95 data-[toast-status=exiting]:duration-150 data-[toast-status=exiting]:ease-in [&[data-toast-placement^=bottom]]:origin-bottom-right pointer-events-auto relative w-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 pr-12 shadow-xl",
  });

  return (
    <article ref={ref} className={className} {...handlers} {...attributes}>
      <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">
        {toast.data.title}
      </p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        {toast.data.body}
      </p>
      <button
        type="button"
        aria-label="Close toast"
        className="absolute right-3 top-3 inline-flex cursor-pointer h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition duration-150 hover:bg-slate-100 hover:shadow-sm dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
        onClick={() => dismiss("user")}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        >
          <path d="M4 4l8 8" />
          <path d="M12 4 4 12" />
        </svg>
      </button>
    </article>
  );
}

function StateTable({
  store,
  label,
}: {
  store: ReactToastStore<{ title: string; body: string }>;
  label: string;
}) {
  const toasts = useStore(store);
  const [now, setNow] = useState(() => Date.now());
  const anchorsRef = useRef(new Map<string, ToastTimingAnchor>());
  const previousToastsRef = useRef(new Map<string, InspectorToastState>());

  const hasRunningCountdown = toasts.some(
    (toast) =>
      (toast.options.duration ?? 0) > 0 &&
      toast.status === "visible" &&
      !toast.paused,
  );

  useEffect(() => {
    const nextToasts = new Map<string, InspectorToastState>();
    const previousToasts = previousToastsRef.current;
    const anchors = anchorsRef.current;
    const timestamp = Date.now();

    for (const toast of toasts) {
      const previousToast = previousToasts.get(toast.id);
      const duration = toast.options.duration ?? 0;

      if (duration > 0 && toast.status === "visible" && !toast.paused) {
        const shouldResetAnchor =
          !previousToast ||
          previousToast.status !== toast.status ||
          previousToast.paused !== toast.paused ||
          previousToast.remaining !== toast.remaining ||
          previousToast.options.duration !== toast.options.duration;

        if (shouldResetAnchor) {
          anchors.set(toast.id, {
            startedAt: timestamp,
            remainingAtStart: toast.remaining ?? duration,
          });
        }
      } else {
        anchors.delete(toast.id);
      }

      nextToasts.set(toast.id, toast);
    }

    for (const id of anchors.keys()) {
      if (!nextToasts.has(id)) {
        anchors.delete(id);
      }
    }

    previousToastsRef.current = nextToasts;
  }, [toasts]);

  useEffect(() => {
    if (!hasRunningCountdown) {
      return;
    }

    const id = window.setInterval(() => {
      setNow(Date.now());
    }, 100);

    return () => window.clearInterval(id);
  }, [hasRunningCountdown]);

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <h3 className="text-sm font-semibold text-slate-950 dark:text-slate-50">
        {label} — {toasts.length} toast(s)
      </h3>
      {toasts.length === 0 ? (
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          No active toasts.
        </p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-950 dark:text-slate-50">
                <th className="pb-2 pr-4">Type</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2 pr-4">Paused</th>
                <th className="pb-2">Remaining</th>
              </tr>
            </thead>
            <tbody>
              {toasts.map((toast) => {
                const timing = getTimingSnapshot(
                  toast,
                  now,
                  anchorsRef.current.get(toast.id),
                );

                return (
                  <tr
                    key={toast.id}
                    className="border-b border-slate-200/70 dark:border-slate-800/70"
                  >
                    <td className="py-2 pr-4">{toast.type}</td>
                    <td className="py-2 pr-4">{toast.status}</td>
                    <td className="py-2 pr-4">{String(toast.paused)}</td>
                    <td className="py-2 min-w-36">
                      <div className="space-y-1.5">
                        <div>{timing.label}</div>
                        {timing.progress !== null ? (
                          <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                            <div
                              className="h-full rounded-full bg-indigo-500 dark:bg-indigo-400"
                              style={{ width: `${timing.progress * 100}%` }}
                            />
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StoreInspectorPreview() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-indigo-500 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          onClick={() =>
            storeA.info({ title: "Store A", body: "Top-left store." })
          }
        >
          Add to store A
        </button>
        <button
          type="button"
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition duration-150 hover:border-slate-300 hover:bg-slate-100 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
          onClick={() =>
            storeB.success({ title: "Store B", body: "Top-right store." })
          }
        >
          Add to store B
        </button>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <StateTable store={storeA} label="Store A" />
        <StateTable store={storeB} label="Store B" />
      </div>
      <Toaster
        store={storeA}
        className="pointer-events-none fixed inset-0 z-50"
      >
        <Toaster.List className="fixed left-4 top-4 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
          <InspectorToast />
        </Toaster.List>
      </Toaster>
      <Toaster
        store={storeB}
        className="pointer-events-none fixed inset-0 z-50"
      >
        <Toaster.List className="fixed right-4 top-4 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
          <InspectorToast />
        </Toaster.List>
      </Toaster>
    </div>
  );
}

const code = extractExampleSource(rawSource);

function StoreInspectorPage() {
  return (
    <ExamplePage
      category="State"
      title="Store inspector"
      summary="useStore(store) subscribes React to the raw toast array, which makes dashboards, counters, debug views, and alternative render loops straightforward."
      files={[{ filename: "store-inspector.tsx", language: "tsx", code }]}
      preview={<StoreInspectorPreview />}
    />
  );
}

export { StoreInspectorPage };
