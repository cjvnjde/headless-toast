import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  ToastCtx,
  createToast,
  useStore,
  useToast,
} from "@headless-toast/react";
import type { ReactToastStore } from "@headless-toast/react";
import { ExamplePage } from "../../components/ExamplePage";
import { extractRouteExampleSource } from "../../lib/exampleSource";
import rawSource from "./framer-motion.tsx?raw";

function ViewportLayer({ children }: { children: ReactNode }) {
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(children, document.body);
}

export const Route = createFileRoute("/examples/framer-motion")({
  component: FramerMotionPage,
});

function MotionToast() {
  const { toast, dismiss, pauseOnHoverHandlers, markEntered } = useToast<{
    title: string;
    body: string;
  }>();

  useEffect(() => {
    if (toast.status !== "entering") return;

    const timer = window.setTimeout(() => markEntered(), 320);
    return () => window.clearTimeout(timer);
  }, [toast.id, toast.status, markEntered]);

  return (
    <article
      className="pointer-events-auto relative flex gap-4 rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface-strong)] p-4 pr-12 shadow-[0_24px_50px_rgba(15,23,42,0.16)]"
      onMouseEnter={pauseOnHoverHandlers.onMouseEnter}
      onMouseLeave={pauseOnHoverHandlers.onMouseLeave}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[var(--ink)]">
          {toast.data.title}
        </p>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">{toast.data.body}</p>
      </div>
      <button
        type="button"
        className="absolute right-3 top-3 text-xs text-[var(--ink-soft)]"
        onClick={() => dismiss("user")}
      >
        Close
      </button>
    </article>
  );
}

function MotionToaster({
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
              initial={{ opacity: 0, y: -24, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 420, damping: 26 }}
              onAnimationComplete={(definition) => {
                if (definition === "exit") {
                  store.markExited(toast.id);
                }
              }}
            >
              <ToastCtx.Provider value={{ toast, store }}>
                <MotionToast />
              </ToastCtx.Provider>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ViewportLayer>
  );
}

function FramerMotionPreview() {
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
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="doc-button"
          onClick={() =>
            toast.success({
              title: "Spring in",
              body: "Framer Motion owns the DOM timing here.",
            })
          }
        >
          Success
        </button>
        <button
          type="button"
          className="doc-button doc-button-secondary"
          onClick={() =>
            toast.error({
              title: "Custom exit",
              body: "markEntered() and markExited() are handled manually.",
            })
          }
        >
          Error
        </button>
      </div>
      <MotionToaster store={toast} />
    </div>
  );
}

const code = extractRouteExampleSource(rawSource);

function FramerMotionPage() {
  return (
    <ExamplePage
      category="Advanced"
      title="Framer Motion"
      summary="When another animation library owns the DOM timing, manually tell the store when enter and exit phases are complete so state stays in sync with the visuals."
      notes={[
        "markEntered() advances a toast out of the entering phase when your motion animation is done.",
        "markExited() finalizes cleanup after the exit animation completes.",
        "This pattern is perfect when your app already standardizes on Framer Motion.",
      ]}
      files={[{ filename: "framer-motion.tsx", language: "tsx", code }]}
      preview={<FramerMotionPreview />}
    />
  );
}
