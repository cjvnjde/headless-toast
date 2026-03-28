import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useDrag } from "@use-gesture/react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  mapToastItems,
  createToast,
  useStore,
  useToast,
} from "@headless-toast/react";
import type { ReactToastStore } from "@headless-toast/react";
import { ExamplePage } from "#/components/ExamplePage";
import { extractExampleSource } from "#/lib/exampleSource";
import rawSource from "./swipe-pin-dismiss.tsx?raw";

const toast = createToast<{ title: string; body: string }>({
  defaults: { pauseOnHover: true },
}).toast;

function ViewportLayer({ children }: { children: ReactNode }) {
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(children, document.body);
}

const DISMISS_THRESHOLD = 150;
const PIN_THRESHOLD = 80;

function stripGestureHandlers(handlers: Record<string, unknown>) {
  const {
    onDrag: _onDrag,
    onDragStart: _onDragStart,
    onDragEnd: _onDragEnd,
    onDragOver: _onDragOver,
    onDragEnter: _onDragEnter,
    onDragLeave: _onDragLeave,
    ...rest
  } = handlers;

  return rest;
}

function SwipeToast() {
  const {
    toast,
    dismiss,
    update,
    pause,
    resume,
    pauseOnHoverHandlers,
    markEntered,
  } = useToast<{ title: string; body: string }>();
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-160, 0, 180], [0.8, 1, 0.35]);
  const isDark =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");
  const bgColor = useTransform(
    x,
    [-160, 0, 180],
    isDark
      ? [
          "rgba(52, 211, 153, 0.18)",
          "rgb(15 23 42)",
          "rgba(251, 113, 133, 0.18)",
        ]
      : ["rgb(209 250 229)", "rgb(255 255 255)", "rgb(255 228 230)"],
  );
  const [pinned, setPinned] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (toast.status !== "entering") return;

    const timer = window.setTimeout(() => markEntered(), 280);
    return () => window.clearTimeout(timer);
  }, [toast.id, toast.status, markEntered]);

  const bind = useDrag(
    ({ active, movement: [mx], velocity: [vx], direction: [dx], last }) => {
      if (dismissed || pinned) return;

      if (active) {
        x.set(mx);
        pause();
      }

      if (!last) return;

      if (mx < -PIN_THRESHOLD) {
        setPinned(true);
        update({ duration: 0 });
        animate(x, 0, { type: "spring", stiffness: 600, damping: 24 });
        return;
      }

      const shouldDismiss =
        mx > DISMISS_THRESHOLD || (vx > 0.75 && dx > 0 && mx > 30);
      if (shouldDismiss) {
        setDismissed(true);
        animate(x, 420, { duration: 0.18 });
        window.setTimeout(() => dismiss("swipe"), 180);
        return;
      }

      animate(x, 0, { type: "spring", stiffness: 420, damping: 30 });
      resume();
    },
    { from: () => [x.get(), 0] },
  );

  return (
    <motion.article
      style={{ x, opacity, backgroundColor: bgColor }}
      className="pointer-events-auto relative flex gap-4 rounded-3xl border border-slate-200 bg-white p-4 pr-12 shadow-2xl select-none touch-none dark:border-slate-800 dark:bg-slate-900"
      {...(pinned ? {} : stripGestureHandlers(bind()))}
      onMouseEnter={pauseOnHoverHandlers.onMouseEnter}
      onMouseLeave={pauseOnHoverHandlers.onMouseLeave}
    >
      <div className="min-w-0 flex-1">
        {pinned ? (
          <span className="mb-2 inline-flex rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold uppercase tracking-widest text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200">
            Pinned
          </span>
        ) : null}
        <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">
          {toast.data.title}
        </p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          {toast.data.body}
        </p>
        {!pinned ? (
          <p className="mt-3 text-xs font-medium text-slate-600 dark:text-slate-300">
            Swipe left to pin • swipe right to dismiss
          </p>
        ) : null}
      </div>
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
    </motion.article>
  );
}

function SwipeToaster({
  store,
}: {
  store: ReactToastStore<{ title: string; body: string }>;
}) {
  const toasts = useStore(store).filter((t) => t.status !== "exiting");

  return (
    <ViewportLayer>
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {mapToastItems(store, toasts, (currentToast) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: -18, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 420, damping: 26 }}
              onAnimationComplete={(definition) => {
                if (definition === "exit") {
                  store.markExited(currentToast.id);
                }
              }}
            >
              <SwipeToast />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ViewportLayer>
  );
}

function SwipePinDismissPreview() {
  return (
    <div className="space-y-4">
      <button
        type="button"
        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-indigo-500 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400"
        onClick={() =>
          toast.info(
            {
              title: "Try pinning me",
              body: "Swipe left to pin this toast or right to dismiss it.",
            },
            { duration: 6000 },
          )
        }
      >
        Add swipe toast
      </button>
      <SwipeToaster store={toast} />
    </div>
  );
}

const code = extractExampleSource(rawSource);

function SwipePinDismissPage() {
  return (
    <ExamplePage
      category="Advanced"
      title="Swipe to pin or dismiss"
      summary="For richer gesture interactions, combine a gesture library with the headless store and translate the final gesture into either an update() call or a dismiss()."
      files={[{ filename: "swipe-pin-dismiss.tsx", language: "tsx", code }]}
      preview={<SwipePinDismissPreview />}
    />
  );
}

export { SwipePinDismissPage };
