import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useDrag } from "@use-gesture/react";
import { animate, motion, useMotionValue } from "framer-motion";
import { ToastCtx, useStore, useToast } from "@headless-toast/react";
import type { ReactToastStore } from "@headless-toast/react";
import type { ToastPlacement } from "@headless-toast/core";
import { noControlsParameters, withCodeDocs } from "../shared/storybookDocs";
import { useIsolatedToast } from "../shared/useIsolatedToast";
import {
  PlacementZoneOverlay,
  REPOSITIONABLE_TOAST_WIDTH,
  getPlacementFromPosition,
  getPositionStyle,
  getToastStyle,
  stripConflictingHandlers,
} from "./shared";

const meta: Meta = {
  title: "Advanced Integrations/Drag Placement",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Treat placement as state: drag a toast to another zone, then persist the new placement by updating the store.",
      },
    },
  },
};

export default meta;

type Story = StoryObj;

function RepositionableToast({
  onReposition,
  stackIndex,
}: {
  onReposition: (id: string, placement: ToastPlacement) => void;
  stackIndex: number;
}) {
  const {
    toast,
    dismiss,
    pauseOnHoverHandlers,
    markEntered,
    markExited,
    pause,
    resume,
  } = useToast();
  const placement = (toast.options.placement ?? "top-right") as ToastPlacement;
  const pos = getPositionStyle(placement, stackIndex);
  const x = useMotionValue(pos.x);
  const y = useMotionValue(pos.y);
  const scale = useMotionValue(1);
  const [dragging, setDragging] = useState(false);
  const [hoverPlacement, setHoverPlacement] = useState<ToastPlacement | null>(
    null,
  );

  useEffect(() => {
    const nextPos = getPositionStyle(placement, stackIndex);
    animate(x, nextPos.x, { type: "spring", stiffness: 300, damping: 30 });
    animate(y, nextPos.y, { type: "spring", stiffness: 300, damping: 30 });
  }, [placement, stackIndex, x, y]);

  const bind = useDrag(
    ({ active, xy: [screenX, screenY], last }) => {
      if (active) {
        setDragging(true);
        x.set(screenX - REPOSITIONABLE_TOAST_WIDTH / 2);
        y.set(screenY - 40);
        scale.set(1.03);
        pause();
        setHoverPlacement(getPlacementFromPosition(screenX, screenY));
      }

      if (!last) return;

      setDragging(false);
      scale.set(1);
      setHoverPlacement(null);

      const nextPlacement = getPlacementFromPosition(screenX, screenY);
      if (nextPlacement !== placement) onReposition(toast.id, nextPlacement);
      else {
        const resetPos = getPositionStyle(placement, stackIndex);
        animate(x, resetPos.x, { type: "spring", stiffness: 300, damping: 30 });
        animate(y, resetPos.y, { type: "spring", stiffness: 300, damping: 30 });
      }

      resume();
    },
    { from: () => [x.get() + REPOSITIONABLE_TOAST_WIDTH / 2, y.get() + 40] },
  );

  return (
    <>
      {dragging && hoverPlacement ? (
        <PlacementZoneOverlay activeZone={hoverPlacement} />
      ) : null}
      <motion.div
        style={{
          ...getToastStyle(toast.type ?? "info"),
          position: "fixed",
          top: 0,
          left: 0,
          x,
          y,
          scale,
          zIndex: dragging ? 10001 : 10000,
          cursor: dragging ? "grabbing" : "grab",
          boxShadow: dragging
            ? "0 20px 40px rgba(0,0,0,0.2)"
            : "0 4px 12px rgba(0,0,0,0.15)",
          width: REPOSITIONABLE_TOAST_WIDTH,
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={
          toast.status === "exiting"
            ? { opacity: 0, scale: 0.8 }
            : { opacity: 1, scale: 1 }
        }
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onAnimationComplete={() => {
          if (toast.status === "entering") markEntered();
          else if (toast.status === "exiting") markExited();
        }}
        {...stripConflictingHandlers(bind())}
        onMouseEnter={pauseOnHoverHandlers.onMouseEnter}
        onMouseLeave={pauseOnHoverHandlers.onMouseLeave}
      >
        <div style={{ flex: 1, pointerEvents: "none" }}>
          <div
            style={{
              fontSize: 10,
              color: "#6b7280",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 2,
            }}
          >
            {placement}
          </div>
          {toast.data.title ? (
            <strong>{String(toast.data.title)}</strong>
          ) : null}
          {toast.data.body ? (
            <p style={{ margin: "4px 0 0" }}>{String(toast.data.body)}</p>
          ) : null}
        </div>
        <button
          onClick={() => dismiss("user")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 18,
            color: "#9ca3af",
            padding: "0 4px",
            lineHeight: 1,
            pointerEvents: "auto",
          }}
        >
          &times;
        </button>
      </motion.div>
    </>
  );
}

function RepositionToaster({ store }: { store: ReactToastStore }) {
  const toasts = useStore(store);
  const stackCounts = new Map<ToastPlacement, number>();

  return (
    <>
      {toasts.map((toast) => {
        const placement = (toast.options.placement ??
          "top-right") as ToastPlacement;
        const stackIndex = stackCounts.get(placement) ?? 0;
        stackCounts.set(placement, stackIndex + 1);

        return (
          <ToastCtx.Provider value={{ toast, store }} key={toast.id}>
            <RepositionableToast
              stackIndex={stackIndex}
              onReposition={(id, nextPlacement) => {
                store.update(id, { placement: nextPlacement });
              }}
            />
          </ToastCtx.Provider>
        );
      })}
    </>
  );
}

export const DragToReposition: Story = {
  name: "Drag to Reposition",
  parameters: {
    ...noControlsParameters,
    ...withCodeDocs(
      "Update `placement` in the store when a custom drag interaction ends so the toast remains in its new home after the gesture completes.",
      `function RepositionToaster({ store }: { store: ReactToastStore }) {
  const toasts = useStore(store);
  const stackCounts = new Map<ToastPlacement, number>();

  return (
    <>
      {toasts.map((toast) => {
        const placement = (toast.options.placement ?? "top-right") as ToastPlacement;
        const stackIndex = stackCounts.get(placement) ?? 0;
        stackCounts.set(placement, stackIndex + 1);

        return (
          <ToastCtx.Provider key={toast.id} value={{ toast, store }}>
            <RepositionableToast
              stackIndex={stackIndex}
              onReposition={(id, nextPlacement) => {
                store.update(id, { placement: nextPlacement });
              }}
            />
          </ToastCtx.Provider>
        );
      })}
    </>
  );
}`,
      [
        {
          title: "Reposition handler",
          language: "tsx",
          code: `const bind = useDrag(({ xy: [screenX, screenY], last }) => {
  if (!last) return;

  const nextPlacement = getPlacementFromPosition(screenX, screenY);
  if (nextPlacement !== placement) {
    onReposition(currentToast.id, nextPlacement);
  }
});`,
        },
      ],
    ),
  },
  render: function Render() {
    const toast = useIsolatedToast();

    return (
      <div className="story-stage">
        <div className="story-stage-panel">
          <h2>Drag to Reposition</h2>
          <p className="story-subtitle">
            Grab a toast, move it into another zone, and persist the new
            placement with `toast.update()`.
          </p>
          <div className="story-controls">
            <button
              className="btn-info"
              onClick={() =>
                toast.info(
                  {
                    title: "Drag me anywhere!",
                    body: "Drop in a different zone to reposition.",
                  },
                  { placement: "top-right", duration: 0 },
                )
              }
            >
              Top Right
            </button>
            <button
              className="btn-success"
              onClick={() =>
                toast.success(
                  { title: "Another toast", body: "Try a different zone." },
                  { placement: "bottom-left", duration: 0 },
                )
              }
            >
              Bottom Left
            </button>
            <button
              className="btn-warning"
              onClick={() =>
                toast.warning(
                  { title: "Move me!", body: "Drag to any corner." },
                  { placement: "top-left", duration: 0 },
                )
              }
            >
              Top Left
            </button>
            <button className="btn-dismiss" onClick={() => toast.dismissAll()}>
              Dismiss All
            </button>
          </div>
        </div>
        <RepositionToaster store={toast} />
      </div>
    );
  },
};
