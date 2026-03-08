import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useDrag } from "@use-gesture/react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { ToastCtx, useStore, useToast } from "@headless-toast/react";
import type { ReactToastStore } from "@headless-toast/react";
import { useIsolatedToast } from "../shared/useIsolatedToast";
import {
  getToastStyle,
  stripConflictingHandlers,
  toastSlideRightVariants,
  toastSlideVariants,
  typeColors,
} from "./shared";

const DISMISS_THRESHOLD = 150;
const PIN_THRESHOLD = 80;

const meta: Meta = {
  title: "Advanced Integrations/Swipe Gestures",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Combine `@use-gesture/react` and Framer Motion for richer swipe interactions like dismiss and pinning.",
      },
    },
  },
};

export default meta;

type Story = StoryObj;

function SwipeDismissToast() {
  const { toast, dismiss, pauseOnHoverHandlers, markEntered, pause, resume } =
    useToast();
  const x = useMotionValue(0);
  const opacity = useTransform(x, [0, DISMISS_THRESHOLD], [1, 0.3]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (toast.status !== "entering") return;

    const timer = setTimeout(() => markEntered(), 400);
    return () => clearTimeout(timer);
  }, [toast.id, toast.status, toast]);

  const bind = useDrag(
    ({ active, movement: [mx], velocity: [vx], direction: [dx], last }) => {
      if (dismissed) return;

      if (active) {
        x.set(Math.max(0, mx));
        pause();
      }

      if (!last) return;

      const shouldDismiss =
        mx > DISMISS_THRESHOLD || (vx > 0.8 && dx > 0 && mx > 30);

      if (shouldDismiss) {
        setDismissed(true);
        animate(x, 500, { duration: 0.2 });
        setTimeout(() => dismiss("swipe"), 200);
        return;
      }

      animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
      resume();
    },
    { axis: "x", from: () => [x.get(), 0] },
  );

  return (
    <motion.div
      style={{
        ...getToastStyle(toast.type ?? "info"),
        x,
        opacity,
        cursor: "grab",
      }}
      {...stripConflictingHandlers(bind())}
      onMouseEnter={pauseOnHoverHandlers.onMouseEnter}
      onMouseLeave={pauseOnHoverHandlers.onMouseLeave}
    >
      <div style={{ flex: 1, pointerEvents: "none" }}>
        {toast.data.title ? <strong>{String(toast.data.title)}</strong> : null}
        {toast.data.body ? (
          <p style={{ margin: "4px 0 0" }}>{String(toast.data.body)}</p>
        ) : null}
      </div>
      <div
        style={{
          fontSize: 11,
          color: "#9ca3af",
          position: "absolute",
          bottom: 4,
          right: 8,
          pointerEvents: "none",
        }}
      >
        swipe -&gt;
      </div>
    </motion.div>
  );
}

function SwipeDismissToaster({ store }: { store: ReactToastStore }) {
  const toasts = useStore(store);
  const activeToasts = toasts.filter((toast) => toast.status !== "exiting");

  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        maxWidth: 400,
        pointerEvents: "none",
      }}
    >
      <AnimatePresence mode="popLayout">
        {activeToasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            variants={toastSlideRightVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              layout: { type: "spring", stiffness: 300, damping: 30 },
            }}
            onAnimationComplete={(definition) => {
              if (definition === "exit") store.markExited(toast.id);
            }}
          >
            <ToastCtx.Provider value={{ toast, store }}>
              <SwipeDismissToast />
            </ToastCtx.Provider>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function ReverseSwipePinToast() {
  const {
    toast,
    dismiss,
    update,
    pauseOnHoverHandlers,
    markEntered,
    pause,
    resume,
  } = useToast();
  const x = useMotionValue(0);
  const [pinned, setPinned] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const backgroundColor = useTransform(
    x,
    [-PIN_THRESHOLD, 0, DISMISS_THRESHOLD],
    pinned
      ? ["#dcfce7", "#dcfce7", "#dcfce7"]
      : ["#dbeafe", "#ffffff", "#fee2e2"],
  );

  useEffect(() => {
    if (toast.status !== "entering") return;

    const timer = setTimeout(() => markEntered(), 400);
    return () => clearTimeout(timer);
  }, [toast.id, toast.status, toast]);

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
        animate(x, 0, { type: "spring", stiffness: 600, damping: 20 });
        return;
      }

      const shouldDismiss =
        mx > DISMISS_THRESHOLD || (vx > 0.8 && dx > 0 && mx > 30);

      if (shouldDismiss) {
        setDismissed(true);
        animate(x, 500, { duration: 0.2 });
        setTimeout(() => dismiss("swipe"), 200);
        return;
      }

      animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
      resume();
    },
    { from: () => [x.get(), 0] },
  );

  return (
    <motion.div
      style={{
        ...getToastStyle(toast.type ?? "info"),
        x,
        backgroundColor,
        cursor: pinned ? "default" : "grab",
        borderLeft: pinned
          ? "4px solid #22c55e"
          : `4px solid ${typeColors[toast.type ?? "info"] ?? typeColors.info}`,
      }}
      {...(pinned ? {} : stripConflictingHandlers(bind()))}
      onMouseEnter={pauseOnHoverHandlers.onMouseEnter}
      onMouseLeave={pauseOnHoverHandlers.onMouseLeave}
    >
      <div style={{ flex: 1, pointerEvents: "none" }}>
        {pinned ? (
          <span
            style={{
              display: "inline-block",
              fontSize: 11,
              fontWeight: 600,
              color: "#166534",
              background: "#bbf7d0",
              padding: "1px 6px",
              borderRadius: 4,
              marginBottom: 4,
            }}
          >
            PINNED
          </span>
        ) : null}
        {toast.data.title ? (
          <strong style={{ display: "block" }}>
            {String(toast.data.title)}
          </strong>
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
      {!pinned ? (
        <div
          style={{
            fontSize: 10,
            color: "#9ca3af",
            position: "absolute",
            bottom: 4,
            left: 20,
            pointerEvents: "none",
          }}
        >
          &lt;- pin | dismiss -&gt;
        </div>
      ) : null}
    </motion.div>
  );
}

function ReverseSwipePinToaster({ store }: { store: ReactToastStore }) {
  const toasts = useStore(store);
  const activeToasts = toasts.filter((toast) => toast.status !== "exiting");

  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        maxWidth: 400,
        pointerEvents: "none",
      }}
    >
      <AnimatePresence mode="popLayout">
        {activeToasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            variants={toastSlideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              layout: { type: "spring", stiffness: 300, damping: 30 },
            }}
            onAnimationComplete={(definition) => {
              if (definition === "exit") store.markExited(toast.id);
            }}
          >
            <ToastCtx.Provider value={{ toast, store }}>
              <ReverseSwipePinToast />
            </ToastCtx.Provider>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export const SwipeRightToDismiss: Story = {
  name: "Swipe Right to Dismiss",
  render: function Render() {
    const toast = useIsolatedToast();

    return (
      <div className="story-wrapper">
        <h2>Swipe Right to Dismiss</h2>
        <p className="story-subtitle">
          Add swipe gestures and spring-based motion without changing the core
          store.
        </p>
        <div className="story-controls">
          <button
            className="btn-info"
            onClick={() =>
              toast.info(
                {
                  title: "Drag me right!",
                  body: "Swipe past the threshold to dismiss.",
                },
                { duration: 0, pauseOnHover: true },
              )
            }
          >
            Add Swipeable Toast
          </button>
          <button
            className="btn-success"
            onClick={() =>
              toast.success(
                { title: "New message", body: "You have a notification." },
                { duration: 8000, pauseOnHover: true },
              )
            }
          >
            Auto-close Toast
          </button>
          <button className="btn-dismiss" onClick={() => toast.dismissAll()}>
            Dismiss All
          </button>
        </div>
        <SwipeDismissToaster store={toast} />
      </div>
    );
  },
};

export const SwipeToPinOrDismiss: Story = {
  name: "Swipe to Pin or Dismiss",
  render: function Render() {
    const toast = useIsolatedToast();

    return (
      <div className="story-wrapper">
        <h2>Swipe to Pin or Dismiss</h2>
        <p className="story-subtitle">
          Swipe left to pin a toast in place or right to dismiss it.
        </p>
        <div className="story-controls">
          <button
            className="btn-info"
            onClick={() =>
              toast.info(
                {
                  title: "Try pinning me!",
                  body: "Swipe left to pin, right to dismiss.",
                },
                { duration: 6000, pauseOnHover: true },
              )
            }
          >
            Add Toast (6s autoclose)
          </button>
          <button
            className="btn-warning"
            onClick={() =>
              toast.warning(
                { title: "Important!", body: "Pin me to keep me around." },
                { duration: 4000, pauseOnHover: true },
              )
            }
          >
            Add Warning Toast
          </button>
          <button className="btn-dismiss" onClick={() => toast.dismissAll()}>
            Dismiss All
          </button>
        </div>
        <ReverseSwipePinToaster store={toast} />
      </div>
    );
  },
};
