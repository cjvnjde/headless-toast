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
import rawSource from "./drag-to-dismiss.tsx?raw";

const toast = createToast<{ title: string; body: string }>().toast;

function ViewportLayer({ children }: { children: ReactNode }) {
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(children, document.body);
}

const DISMISS_THRESHOLD = 110;

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

function DraggableToast() {
  const {
    toast,
    dismiss,
    pause,
    resume,
    pauseOnHoverHandlers,
    markEntered,
    markExited,
  } = useToast<{ title: string; body: string }>();
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-180, 0, 180], [0.45, 1, 0.45]);
  const rotate = useTransform(x, [-180, 180], [-4, 4]);
  const [dismissDirection, setDismissDirection] = useState<1 | -1 | null>(null);

  useEffect(() => {
    if (toast.status !== "entering") return;

    const timer = window.setTimeout(() => markEntered(), 220);
    return () => window.clearTimeout(timer);
  }, [toast.id, toast.status, markEntered]);

  useEffect(() => {
    if (toast.status !== "exiting" || dismissDirection !== null) return;

    const controls = animate(x, 0, {
      type: "spring",
      stiffness: 420,
      damping: 32,
    });
    return () => controls.stop();
  }, [dismissDirection, toast.status, x]);

  const bind = useDrag(
    ({ active, movement: [mx], last, direction: [dx], velocity: [vx] }) => {
      if (dismissDirection !== null) return;

      if (active) {
        pause();
        x.set(mx);
      }

      if (!last) return;

      const shouldDismiss =
        Math.abs(mx) > DISMISS_THRESHOLD ||
        (Math.abs(mx) > 36 && Math.abs(vx) > 0.55);
      if (shouldDismiss) {
        const direction = (mx === 0 ? dx : Math.sign(mx)) >= 0 ? 1 : -1;
        setDismissDirection(direction);
        const targetX = direction * (window.innerWidth * 0.35 + 180);
        animate(x, targetX, { duration: 0.18, ease: "easeOut" });
        window.setTimeout(() => dismiss("swipe"), 180);
        return;
      }

      resume();
      animate(x, 0, { type: "spring", stiffness: 420, damping: 32 });
    },
    { from: () => [x.get(), 0] },
  );

  return (
    <motion.article
      style={{ x, opacity, rotate }}
      className="pointer-events-auto relative select-none touch-none rounded-3xl border border-(--line) bg-(--surface-strong) p-4 pr-12 shadow-[0_18px_36px_rgba(15,23,42,0.12)]"
      initial={{ opacity: 0, scale: 0.94, y: -12 }}
      animate={
        toast.status === "exiting"
          ? { opacity: 0 }
          : { opacity: 1, scale: 1, y: 0 }
      }
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
      onAnimationComplete={() => {
        if (toast.status === "exiting") {
          markExited();
        }
      }}
      {...stripGestureHandlers(bind())}
      onMouseEnter={pauseOnHoverHandlers.onMouseEnter}
      onMouseLeave={pauseOnHoverHandlers.onMouseLeave}
    >
      <p className="text-sm font-semibold text-(--ink)">{toast.data.title}</p>
      <p className="mt-1 text-sm text-(--ink-soft)">{toast.data.body}</p>
      <p className="mt-3 text-[11px] font-medium text-(--ink-soft)">
        Drag left or right, then release to dismiss from that final position.
      </p>
      <button
        type="button"
        aria-label="Close toast"
        className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-(--line) text-(--ink-soft) hover:bg-black/4 dark:hover:bg-white/6"
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

function DragDismissToaster({
  store,
}: {
  store: ReactToastStore<{ title: string; body: string }>;
}) {
  const toasts = useStore(store);

  return (
    <ViewportLayer>
      <div className="pointer-events-none fixed right-4 top-4 z-[9999] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
        <AnimatePresence initial={false} mode="popLayout">
          {mapToastItems(store, toasts, () => (
            <motion.div layout="position">
              <DraggableToast />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ViewportLayer>
  );
}

function DragToDismissPreview() {
  return (
    <div className="space-y-4">
      <button
        type="button"
        className="doc-button"
        onClick={() =>
          toast.info(
            {
              title: "Drag me",
              body: "Release after dragging and the toast exits from the last dragged position.",
            },
            { duration: 0, pauseOnHover: true },
          )
        }
      >
        Show draggable toast
      </button>
      <DragDismissToaster store={toast} />
    </div>
  );
}

const code = extractExampleSource(rawSource);

function DragToDismissPage() {
  return (
    <ExamplePage
      category="Advanced"
      title="Drag to dismiss"
      summary="A custom drag interaction can keep the toast exactly where the user releases it, then dismiss from that final position instead of snapping back first."
      files={[{ filename: "drag-to-dismiss.tsx", language: "tsx", code }]}
      preview={<DragToDismissPreview />}
    />
  );
}

export { DragToDismissPage };
