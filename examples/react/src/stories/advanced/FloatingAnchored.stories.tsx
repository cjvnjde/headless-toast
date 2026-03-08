import { useEffect, useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
} from "@floating-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { ToastCtx, useStore, useToast } from "@headless-toast/react";
import type { ReactToastStore } from "@headless-toast/react";
import { useIsolatedToast } from "../shared/useIsolatedToast";
import { toastBaseStyle, toastFloatVariants, typeColors } from "./shared";

const meta: Meta = {
  title: "Advanced Integrations/Floating UI",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Anchor toast stacks to arbitrary reference elements with Floating UI instead of viewport placements.",
      },
    },
  },
};

export default meta;

type Story = StoryObj;

function FloatingToast() {
  const { toast, dismiss, pauseOnHoverHandlers, markEntered } = useToast();

  useEffect(() => {
    if (toast.status !== "entering") return;

    const timer = setTimeout(() => markEntered(), 300);
    return () => clearTimeout(timer);
  }, [toast.id, toast.status, toast]);

  return (
    <div
      style={{
        ...toastBaseStyle,
        borderLeft: `4px solid ${typeColors[toast.type ?? "info"]}`,
        minWidth: 250,
      }}
      onMouseEnter={pauseOnHoverHandlers.onMouseEnter}
      onMouseLeave={pauseOnHoverHandlers.onMouseLeave}
    >
      <div style={{ flex: 1 }}>
        {toast.data.title ? <strong>{String(toast.data.title)}</strong> : null}
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
        }}
      >
        &times;
      </button>
    </div>
  );
}

function FloatingToastContainer({
  store,
  referenceRef,
}: {
  store: ReactToastStore;
  referenceRef: React.RefObject<HTMLElement | null>;
}) {
  const toasts = useStore(store);
  const activeToasts = toasts.filter((toast) => toast.status !== "exiting");
  const { refs, floatingStyles } = useFloating({
    elements: { reference: referenceRef.current },
    placement: "bottom-end",
    middleware: [offset(8), flip(), shift({ padding: 16 })],
    whileElementsMounted: autoUpdate,
  });

  if (activeToasts.length === 0) return null;

  return (
    <div
      ref={refs.setFloating}
      style={{
        ...floatingStyles,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        maxWidth: 360,
      }}
    >
      <AnimatePresence mode="popLayout">
        {activeToasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            variants={toastFloatVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onAnimationComplete={(definition) => {
              if (definition === "exit") store.markExited(toast.id);
            }}
          >
            <ToastCtx.Provider value={{ toast, store }}>
              <FloatingToast />
            </ToastCtx.Provider>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export const FloatingUIAnchored: Story = {
  name: "Floating UI Anchored",
  render: function Render() {
    const toast = useIsolatedToast();
    const bellRef = useRef<HTMLButtonElement>(null);
    const toasts = useStore(toast);

    return (
      <div className="story-wrapper">
        <h2>Floating UI Anchored Toast</h2>
        <p className="story-subtitle">
          Attach toast groups to a button, badge, or menu trigger instead of the
          viewport edge.
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <div className="story-controls" style={{ marginBottom: 0 }}>
            <button
              className="btn-success"
              onClick={() =>
                toast.success(
                  { title: "Saved!", body: "Your changes were saved." },
                  { duration: 5000, pauseOnHover: true },
                )
              }
            >
              Trigger Success
            </button>
            <button
              className="btn-error"
              onClick={() =>
                toast.error(
                  { title: "Error", body: "Something went wrong." },
                  { duration: 5000, pauseOnHover: true },
                )
              }
            >
              Trigger Error
            </button>
          </div>
          <div style={{ flex: 1 }} />
          <button
            ref={bellRef}
            style={{
              position: "relative",
              background: "none",
              border: "1px solid #d1d5db",
              borderRadius: 8,
              padding: "8px 12px",
              cursor: "pointer",
              fontSize: 20,
              fontFamily: "inherit",
            }}
          >
            Bell
            {toasts.length > 0 ? (
              <span
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  background: "#ef4444",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  borderRadius: "50%",
                  width: 18,
                  height: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {toasts.length}
              </span>
            ) : null}
          </button>
        </div>
        <FloatingToastContainer store={toast} referenceRef={bellRef} />
      </div>
    );
  },
};
