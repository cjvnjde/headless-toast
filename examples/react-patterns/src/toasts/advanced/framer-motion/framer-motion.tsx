import { useEffect } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  mapToastItems,
  createToast,
  useStore,
  useToast,
} from "@headless-toast/react";
import type { ReactToastStore } from "@headless-toast/react";
import { ExamplePage } from "#/components/ExamplePage";
import { extractExampleSource } from "#/lib/exampleSource";
import rawSource from "./framer-motion.tsx?raw";

const toast = createToast<{ title: string; body: string }>({
  defaults: { pauseOnHover: true },
}).toast;

function ViewportLayer({ children }: { children: ReactNode }) {
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(children, document.body);
}

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
      className="pointer-events-auto relative flex gap-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 pr-12 shadow-2xl"
      onMouseEnter={pauseOnHoverHandlers.onMouseEnter}
      onMouseLeave={pauseOnHoverHandlers.onMouseLeave}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">
          {toast.data.title}
        </p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          {toast.data.body}
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
    </article>
  );
}

function MotionToaster({
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
              initial={{ opacity: 0, y: -24, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 420, damping: 26 }}
              onAnimationComplete={(definition) => {
                if (definition === "exit") {
                  store.markExited(currentToast.id);
                }
              }}
            >
              <MotionToast />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ViewportLayer>
  );
}

function FramerMotionPreview() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-indigo-500 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400"
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
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition duration-150 hover:border-slate-300 hover:bg-slate-100 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
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

const code = extractExampleSource(rawSource);

function FramerMotionPage() {
  return (
    <ExamplePage
      category="Advanced"
      title="Framer Motion"
      summary="When another animation library owns the DOM timing, manually tell the store when enter and exit phases are complete so state stays in sync with the visuals."
      files={[{ filename: "framer-motion.tsx", language: "tsx", code }]}
      preview={<FramerMotionPreview />}
    />
  );
}

export { FramerMotionPage };
