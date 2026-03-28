import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { tv } from "tailwind-variants";
import { useDrag } from "@use-gesture/react";
import { animate, motion, useMotionValue } from "framer-motion";
import {
  mapToastItems,
  createToast,
  useStore,
  useToast,
} from "@headless-toast/react";
import type { ReactToastStore, ToastPlacement } from "@headless-toast/react";
import { ExamplePage } from "#/components/ExamplePage";
import { extractExampleSource } from "#/lib/exampleSource";
import rawSource from "./drag-reposition.tsx?raw";

const toast = createToast<{ title: string; body: string }>({
  defaults: { duration: 0 },
}).toast;

const placements = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
] as const satisfies ToastPlacement[];

const placementDropZone = tv({
  base: "flex items-center justify-center rounded-3xl border-2 border-dashed text-xs font-semibold uppercase tracking-widest",
  variants: {
    active: {
      true: "border-indigo-400 bg-indigo-50 text-indigo-600 dark:border-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-300",
      false:
        "border-slate-300/70 text-slate-500 dark:border-slate-700/70 dark:text-slate-400",
    },
  },
});

const VIEWPORT_PADDING = 16;
const STACK_GAP = 12;
const MAX_TOAST_WIDTH = 352;
const DEFAULT_TOAST_HEIGHT = 112;

type ViewportSize = {
  width: number;
  height: number;
};

type ToastPosition = {
  x: number;
  y: number;
  width: number;
};

function ViewportLayer({ children }: { children: ReactNode }) {
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(children, document.body);
}

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

function getViewportSize(): ViewportSize {
  if (typeof window === "undefined") {
    return { width: 1280, height: 720 };
  }

  return { width: window.innerWidth, height: window.innerHeight };
}

function useViewportSize() {
  const [viewport, setViewport] = useState<ViewportSize>(getViewportSize);

  useEffect(() => {
    const onResize = () => setViewport(getViewportSize());

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return viewport;
}

function zoneFromPosition(x: number, y: number): ToastPlacement {
  const row = y < window.innerHeight / 2 ? "top" : "bottom";
  const col =
    x < window.innerWidth / 3
      ? "left"
      : x > (window.innerWidth * 2) / 3
        ? "right"
        : "center";

  return `${row}-${col}`;
}

function resolveToastWidth(viewportWidth: number) {
  return Math.min(
    MAX_TOAST_WIDTH,
    Math.max(viewportWidth - VIEWPORT_PADDING * 2, 0),
  );
}

function resolveBaseX(
  placement: ToastPlacement,
  toastWidth: number,
  viewportWidth: number,
) {
  if (placement.endsWith("left")) {
    return VIEWPORT_PADDING;
  }

  if (placement.endsWith("center")) {
    return Math.max((viewportWidth - toastWidth) / 2, VIEWPORT_PADDING);
  }

  return Math.max(
    viewportWidth - toastWidth - VIEWPORT_PADDING,
    VIEWPORT_PADDING,
  );
}

function computeTargetPositions(
  toasts: Array<{
    id: string;
    options: { placement?: ToastPlacement };
    status: string;
  }>,
  heights: Record<string, number>,
  viewport: ViewportSize,
) {
  const positions = new Map<string, ToastPosition>();
  const toastWidth = resolveToastWidth(viewport.width);
  const activeToasts = toasts.filter((t) => t.status !== "exiting");

  for (const placement of placements) {
    const group = activeToasts.filter(
      (t) => (t.options.placement ?? "top-right") === placement,
    );
    const baseX = resolveBaseX(placement, toastWidth, viewport.width);

    if (placement.startsWith("top")) {
      let currentY = VIEWPORT_PADDING;

      for (const t of group) {
        positions.set(t.id, { x: baseX, y: currentY, width: toastWidth });
        currentY += (heights[t.id] ?? DEFAULT_TOAST_HEIGHT) + STACK_GAP;
      }

      continue;
    }

    let currentY = viewport.height - VIEWPORT_PADDING;

    for (const t of [...group].reverse()) {
      const height = heights[t.id] ?? DEFAULT_TOAST_HEIGHT;
      currentY -= height;
      positions.set(t.id, { x: baseX, y: currentY, width: toastWidth });
      currentY -= STACK_GAP;
    }
  }

  return positions;
}

function RepositionToast({
  targetPosition,
  registerHeight,
  onReposition,
}: {
  targetPosition: ToastPosition;
  registerHeight: (id: string, height: number) => void;
  onReposition: (id: string, placement: ToastPlacement) => void;
}) {
  const {
    toast,
    dismiss,
    pause,
    resume,
    pauseOnHoverHandlers,
    markEntered,
    markExited,
  } = useToast<{ title: string; body: string }>();
  const placement = toast.options.placement ?? "top-right";
  const ref = useRef<HTMLElement | null>(null);
  const draggingRef = useRef(false);
  const dragOriginRef = useRef({ x: targetPosition.x, y: targetPosition.y });
  const x = useMotionValue(targetPosition.x);
  const y = useMotionValue(targetPosition.y);
  const scale = useMotionValue(1);
  const [activeZone, setActiveZone] = useState<ToastPlacement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const measure = () => {
      registerHeight(toast.id, element.getBoundingClientRect().height);
    };

    measure();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(measure);
    observer.observe(element);

    return () => observer.disconnect();
  }, [registerHeight, targetPosition.width, toast.id]);

  useEffect(() => {
    if (toast.status !== "entering") {
      return;
    }

    const timer = window.setTimeout(() => markEntered(), 220);
    return () => window.clearTimeout(timer);
  }, [markEntered, toast.id, toast.status]);

  useEffect(() => {
    if (draggingRef.current || toast.status === "exiting") {
      return;
    }

    const controlsX = animate(x, targetPosition.x, {
      type: "spring",
      stiffness: 420,
      damping: 34,
    });
    const controlsY = animate(y, targetPosition.y, {
      type: "spring",
      stiffness: 420,
      damping: 34,
    });

    return () => {
      controlsX.stop();
      controlsY.stop();
    };
  }, [targetPosition.x, targetPosition.y, toast.status, x, y]);

  const bind = useDrag(
    ({ first, active, last, xy: [screenX, screenY], movement: [mx, my] }) => {
      if (first) {
        pause();
        draggingRef.current = true;
        dragOriginRef.current = { x: x.get(), y: y.get() };
        scale.set(1.02);
      }

      if (active) {
        x.set(dragOriginRef.current.x + mx);
        y.set(dragOriginRef.current.y + my);
        setActiveZone(zoneFromPosition(screenX, screenY));
      }

      if (!last) {
        return;
      }

      draggingRef.current = false;
      scale.set(1);
      setActiveZone(null);
      resume();

      const nextPlacement = zoneFromPosition(screenX, screenY);

      if (nextPlacement !== placement) {
        onReposition(toast.id, nextPlacement);
        return;
      }

      animate(x, targetPosition.x, {
        type: "spring",
        stiffness: 420,
        damping: 34,
      });
      animate(y, targetPosition.y, {
        type: "spring",
        stiffness: 420,
        damping: 34,
      });
    },
  );

  return (
    <>
      {activeZone ? (
        <div className="pointer-events-none fixed inset-4 z-40 grid grid-cols-3 grid-rows-2 gap-3 select-none">
          {placements.map((zone) => (
            <div
              key={zone}
              className={placementDropZone({ active: zone === activeZone })}
            >
              {zone}
            </div>
          ))}
        </div>
      ) : null}

      <motion.article
        ref={ref}
        style={{ x, y, scale, width: targetPosition.width }}
        className="pointer-events-auto fixed left-0 top-0 z-50 flex cursor-grab gap-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 pr-12 shadow-2xl select-none touch-none"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={
          toast.status === "exiting"
            ? { opacity: 0, scale: 0.94 }
            : { opacity: 1, scale: 1 }
        }
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
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold tracking-widest uppercase text-indigo-600 dark:text-indigo-300">
            {placement}
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-slate-50">
            {toast.data.title}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {toast.data.body}
          </p>
          <p className="mt-3 text-xs font-medium text-slate-600 dark:text-slate-300">
            Drag and drop into another viewport zone.
          </p>
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
    </>
  );
}

function RepositionToaster({
  store,
}: {
  store: ReactToastStore<{ title: string; body: string }>;
}) {
  const toasts = useStore(store);
  const viewport = useViewportSize();
  const [heights, setHeights] = useState<Record<string, number>>({});
  const lastKnownPositionsRef = useRef(new Map<string, ToastPosition>());

  const targetPositions = useMemo(
    () => computeTargetPositions(toasts, heights, viewport),
    [heights, toasts, viewport],
  );

  useEffect(() => {
    targetPositions.forEach((position, id) => {
      lastKnownPositionsRef.current.set(id, position);
    });
  }, [targetPositions]);

  useEffect(() => {
    const toastIds = new Set(toasts.map((t) => t.id));

    setHeights((current) => {
      const next = Object.fromEntries(
        Object.entries(current).filter(([id]) => toastIds.has(id)),
      );

      return Object.keys(next).length === Object.keys(current).length
        ? current
        : next;
    });
  }, [toasts]);

  const registerHeight = useCallback((id: string, height: number) => {
    setHeights((current) => {
      if (current[id] === height) {
        return current;
      }

      return { ...current, [id]: height };
    });
  }, []);

  return (
    <ViewportLayer>
      <div className="pointer-events-none fixed inset-0 z-50 select-none">
        {mapToastItems(store, toasts, (currentToast) => {
          const targetPosition = targetPositions.get(currentToast.id) ??
            lastKnownPositionsRef.current.get(currentToast.id) ?? {
              x:
                viewport.width -
                resolveToastWidth(viewport.width) -
                VIEWPORT_PADDING,
              y: VIEWPORT_PADDING,
              width: resolveToastWidth(viewport.width),
            };

          return (
            <RepositionToast
              targetPosition={targetPosition}
              registerHeight={registerHeight}
              onReposition={(id, nextPlacement) =>
                store.update(id, { placement: nextPlacement })
              }
            />
          );
        })}
      </div>
    </ViewportLayer>
  );
}

function DragRepositionPreview() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-indigo-500 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          onClick={() =>
            toast.info(
              {
                title: "Drag me anywhere",
                body: "Drop inside another zone to change placement.",
              },
              { placement: "top-right", duration: 0 },
            )
          }
        >
          Add top-right toast
        </button>
        <button
          type="button"
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition duration-150 hover:border-slate-300 hover:bg-slate-100 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
          onClick={() =>
            toast.warning(
              {
                title: "Move me too",
                body: "Other toasts smoothly shift when stacks change.",
              },
              { placement: "bottom-left", duration: 0 },
            )
          }
        >
          Add bottom-left toast
        </button>
      </div>
      <RepositionToaster store={toast} />
    </div>
  );
}

const code = extractExampleSource(rawSource);

function DragRepositionPage() {
  return (
    <ExamplePage
      category="Advanced"
      title="Drag to reposition"
      summary="Treat placement as live state: drag a toast into another viewport zone, then persist the new placement with store.update()."
      files={[{ filename: "drag-reposition.tsx", language: "tsx", code }]}
      preview={<DragRepositionPreview />}
    />
  );
}

export { DragRepositionPage };
