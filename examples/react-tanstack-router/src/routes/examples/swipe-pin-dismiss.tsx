import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { createFileRoute } from "@tanstack/react-router";
import { useDrag } from "@use-gesture/react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  ToastCtx,
  createToast,
  useStore,
  useToast,
} from "@headless-toast/react";
import type { ReactToastStore } from "@headless-toast/react";
import { ExamplePage } from "../../components/ExamplePage";
import { extractRouteExampleSource } from "../../lib/exampleSource";
import rawSource from "./swipe-pin-dismiss.tsx?raw";

function ViewportLayer({ children }: { children: ReactNode }) {
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(children, document.body);
}

export const Route = createFileRoute("/examples/swipe-pin-dismiss")({
  component: SwipePinDismissPage,
});

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
  const background = useTransform(
    x,
    [-160, 0, 180],
    ["#d1fae5", "rgba(255,255,255,0.98)", "#fee2e2"],
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
      style={{ x, opacity, backgroundColor: background }}
      className="pointer-events-auto relative flex gap-4 rounded-[1.5rem] border border-[var(--line)] p-4 pr-12 shadow-[0_24px_50px_rgba(15,23,42,0.16)] select-none touch-none"
      {...(pinned ? {} : stripGestureHandlers(bind()))}
      onMouseEnter={pauseOnHoverHandlers.onMouseEnter}
      onMouseLeave={pauseOnHoverHandlers.onMouseLeave}
    >
      <div className="min-w-0 flex-1">
        {pinned ? (
          <span className="mb-2 inline-flex rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold tracking-[0.16em] text-emerald-800 uppercase">
            Pinned
          </span>
        ) : null}
        <p className="text-sm font-semibold text-slate-900">
          {toast.data.title}
        </p>
        <p className="mt-1 text-sm text-slate-600">{toast.data.body}</p>
        {!pinned ? (
          <p className="mt-3 text-[11px] font-medium text-slate-400">
            Swipe left to pin • swipe right to dismiss
          </p>
        ) : null}
      </div>
      <button
        type="button"
        className="absolute right-3 top-3 text-xs text-slate-500"
        onClick={() => dismiss("user")}
      >
        Close
      </button>
    </motion.article>
  );
}

function SwipeToaster({
  store,
}: {
  store: ReactToastStore<{ title: string; body: string }>;
}) {
  const toasts = useStore(store).filter((toast) => toast.status !== "exiting");

  return (
    <ViewportLayer>
      <div className="pointer-events-none fixed right-4 top-4 z-[9999] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -18, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 420, damping: 26 }}
              onAnimationComplete={(definition) => {
                if (definition === "exit") {
                  store.markExited(toast.id);
                }
              }}
            >
              <ToastCtx.Provider value={{ toast, store }}>
                <SwipeToast />
              </ToastCtx.Provider>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ViewportLayer>
  );
}

function SwipePinDismissPreview() {
  const storeRef = useRef<ReactToastStore<{
    title: string;
    body: string;
  }> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createToast<{ title: string; body: string }>({
      defaults: { pauseOnHover: true },
    }).toast;
  }

  const toast = storeRef.current;

  return (
    <div className="space-y-4">
      <button
        type="button"
        className="doc-button"
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

const code = extractRouteExampleSource(rawSource);

function SwipePinDismissPage() {
  return (
    <ExamplePage
      category="Advanced"
      title="Swipe to pin or dismiss"
      summary="For richer gesture interactions, combine a gesture library with the headless store and translate the final gesture into either an update() call or a dismiss()."
      notes={[
        "Swiping left calls update({ duration: 0 }) so the toast becomes pinned.",
        "Swiping right dismisses the toast with a custom exit animation.",
        "This pattern is useful when notifications double as lightweight task cards.",
      ]}
      files={[{ filename: "swipe-pin-dismiss.tsx", language: "tsx", code }]}
      preview={<SwipePinDismissPreview />}
    />
  );
}
