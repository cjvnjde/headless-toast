import { useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AnimatePresence, motion } from "framer-motion";
import { ToastCtx, useStore, useToast } from "@headless-toast/react";
import type { ReactToastStore } from "@headless-toast/react";
import { useIsolatedToast } from "../shared/useIsolatedToast";
import { getToastStyle, toastSlideVariants } from "./shared";

const meta: Meta = {
  title: "Advanced Integrations/Framer Motion",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Use Framer Motion instead of CSS transitions while still notifying the toast store about lifecycle milestones.",
      },
    },
  },
};

export default meta;

type Story = StoryObj;

function FramerMotionToast() {
  const { toast, dismiss, pauseOnHoverHandlers, markEntered } = useToast();

  useEffect(() => {
    if (toast.status !== "entering") return;

    const timer = setTimeout(() => markEntered(), 400);
    return () => clearTimeout(timer);
  }, [toast.id, toast.status, toast]);

  return (
    <div
      style={getToastStyle(toast.type ?? "info")}
      onMouseEnter={pauseOnHoverHandlers.onMouseEnter}
      onMouseLeave={pauseOnHoverHandlers.onMouseLeave}
    >
      <div style={{ flex: 1 }}>
        {toast.data.title ? <strong>{String(toast.data.title)}</strong> : null}
        {toast.data.body ? (
          <p style={{ margin: "4px 0 0" }}>{String(toast.data.body)}</p>
        ) : null}
      </div>
      {toast.options.dismissible !== false && (
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
          }}
        >
          &times;
        </button>
      )}
    </div>
  );
}

function FramerMotionToaster({ store }: { store: ReactToastStore }) {
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
              mass: 0.8,
              layout: { type: "spring", stiffness: 300, damping: 30 },
            }}
            onAnimationComplete={(definition) => {
              if (definition === "exit") store.markExited(toast.id);
            }}
          >
            <ToastCtx.Provider value={{ toast, store }}>
              <FramerMotionToast />
            </ToastCtx.Provider>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export const FramerMotionAnimations: Story = {
  name: "Framer Motion Animations",
  render: function Render() {
    const toast = useIsolatedToast();

    return (
      <div className="story-wrapper">
        <h2>Framer Motion Animations</h2>
        <p className="story-subtitle">
          Replace the default animation flow with physics-based transitions and
          manually report `markEntered()` and `markExited()`.
        </p>
        <div className="story-controls">
          <button
            className="btn-success"
            onClick={() =>
              toast.success(
                {
                  title: "Spring In!",
                  body: "Framer Motion spring animation.",
                },
                { duration: 5000, pauseOnHover: true },
              )
            }
          >
            Success
          </button>
          <button
            className="btn-error"
            onClick={() =>
              toast.error(
                { title: "Error Toast", body: "Same physics, different data." },
                { duration: 5000, pauseOnHover: true },
              )
            }
          >
            Error
          </button>
          <button
            className="btn-info"
            onClick={() =>
              toast.info(
                { title: "Info Toast", body: "Smooth layout transitions too." },
                { duration: 5000, pauseOnHover: true },
              )
            }
          >
            Info
          </button>
          <button className="btn-dismiss" onClick={() => toast.dismissAll()}>
            Dismiss All
          </button>
        </div>
        <FramerMotionToaster store={toast} />
      </div>
    );
  },
};
