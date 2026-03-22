import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useDrag } from "@use-gesture/react";
import { animate, motion, useMotionValue } from "framer-motion";
import {
  ToastCtx,
  createToast,
  useStore,
  useToast,
} from "@headless-toast/react";
import type { ReactToastStore, ToastPlacement } from "@headless-toast/react";
import { ExamplePage } from "#/components/ExamplePage";
import { extractExampleSource } from "#/lib/exampleSource";
import rawSource from "./drag-reposition.tsx?raw";

const placements = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
] as const satisfies ToastPlacement[];

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
  const activeToasts = toasts.filter((toast) => toast.status !== "exiting");

  for (const placement of placements) {
    const group = activeToasts.filter(
      (toast) => (toast.options.placement ?? "top-right") === placement,
    );
    const baseX = resolveBaseX(placement, toastWidth, viewport.width);

    if (placement.startsWith("top")) {
      let currentY = VIEWPORT_PADDING;

      for (const toast of group) {
        positions.set(toast.id, { x: baseX, y: currentY, width: toastWidth });
        currentY += (heights[toast.id] ?? DEFAULT_TOAST_HEIGHT) + STACK_GAP;
      }

      continue;
    }

    let currentY = viewport.height - VIEWPORT_PADDING;

    for (const toast of [...group].reverse()) {
      const height = heights[toast.id] ?? DEFAULT_TOAST_HEIGHT;
      currentY -= height;
      positions.set(toast.id, { x: baseX, y: currentY, width: toastWidth });
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
        <div className="pointer-events-none fixed inset-4 z-[9998] grid grid-cols-3 grid-rows-2 gap-3 select-none">
          {placements.map((zone) => (
            <div
              key={zone}
              className="flex items-center justify-center rounded-3xl border-2 border-dashed text-xs font-semibold uppercase tracking-[0.16em]"
              style={{
                borderColor:
                  zone === activeZone
                    ? "var(--accent)"
                    : "color-mix(in oklab, var(--line) 85%, transparent)",
                color:
                  zone === activeZone
                    ? "var(--accent-strong)"
                    : "var(--ink-soft)",
                background:
                  zone === activeZone
                    ? "color-mix(in oklab, var(--accent) 10%, transparent)"
                    : "transparent",
              }}
            >
              {zone}
            </div>
          ))}
        </div>
      ) : null}

      <motion.article
        ref={ref}
        style={{ x, y, scale, width: targetPosition.width }}
        className="pointer-events-auto fixed left-0 top-0 z-[9999] flex cursor-grab gap-4 rounded-[1.5rem] border border-(--line) bg-(--surface-strong) p-4 pr-12 shadow-[0_24px_50px_rgba(15,23,42,0.18)] select-none touch-none"
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
          <p className="text-xs font-bold tracking-[0.18em] uppercase text-(--accent-strong)">
            {placement}
          </p>
          <p className="mt-2 text-sm font-semibold text-(--ink)">
            {toast.data.title}
          </p>
          <p className="mt-1 text-sm text-(--ink-soft)">{toast.data.body}</p>
          <p className="mt-3 text-[11px] font-medium text-(--ink-soft)">
            Drag and drop into another viewport zone.
          </p>
        </div>
        <button
          type="button"
          className="absolute right-3 top-3 text-xs text-(--ink-soft)"
          onClick={() => dismiss("user")}
        >
          Close
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
    const toastIds = new Set(toasts.map((toast) => toast.id));

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
      <div className="pointer-events-none fixed inset-0 z-[9999] select-none">
        {toasts.map((toast) => {
          const targetPosition = targetPositions.get(toast.id) ??
            lastKnownPositionsRef.current.get(toast.id) ?? {
              x:
                viewport.width -
                resolveToastWidth(viewport.width) -
                VIEWPORT_PADDING,
              y: VIEWPORT_PADDING,
              width: resolveToastWidth(viewport.width),
            };

          return (
            <ToastCtx.Provider
              key={toast.id}
              value={{ toastId: toast.id, store }}
            >
              <RepositionToast
                targetPosition={targetPosition}
                registerHeight={registerHeight}
                onReposition={(id, nextPlacement) =>
                  store.update(id, { placement: nextPlacement })
                }
              />
            </ToastCtx.Provider>
          );
        })}
      </div>
    </ViewportLayer>
  );
}

function DragRepositionPreview() {
  const storeRef = useRef<ReactToastStore<{
    title: string;
    body: string;
  }> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createToast<{ title: string; body: string }>({
      defaults: { duration: 0 },
    }).toast;
  }

  const toast = storeRef.current;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="doc-button"
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
          className="doc-button doc-button-secondary"
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
