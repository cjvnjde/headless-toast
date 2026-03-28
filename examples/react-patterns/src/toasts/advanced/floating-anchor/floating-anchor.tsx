import { useEffect, useRef, type RefObject } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
} from "@floating-ui/react";
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
import rawSource from "./floating-anchor.tsx?raw";

const toast = createToast<{ title: string; body: string }>({
  defaults: { pauseOnHover: true },
}).toast;

function ViewportLayer({ children }: { children: ReactNode }) {
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(children, document.body);
}

function AnchoredToast() {
  const { toast, dismiss, pauseOnHoverHandlers, markEntered } = useToast<{
    title: string;
    body: string;
  }>();

  useEffect(() => {
    if (toast.status !== "entering") return;

    const timer = window.setTimeout(() => markEntered(), 260);
    return () => window.clearTimeout(timer);
  }, [toast.id, toast.status, markEntered]);

  return (
    <article
      className="pointer-events-auto relative flex min-w-72 gap-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 pr-12 shadow-2xl"
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

function AnchoredToaster({
  store,
  referenceRef,
}: {
  store: ReactToastStore<{ title: string; body: string }>;
  referenceRef: RefObject<HTMLElement | null>;
}) {
  const toasts = useStore(store).filter((t) => t.status !== "exiting");
  const { refs, floatingStyles } = useFloating({
    elements: { reference: referenceRef.current },
    placement: "bottom-end",
    middleware: [offset(10), flip(), shift({ padding: 16 })],
    whileElementsMounted: autoUpdate,
  });

  if (toasts.length === 0) return null;

  return (
    <ViewportLayer>
      <div
        ref={refs.setFloating}
        style={floatingStyles}
        className="z-50 flex max-w-sm flex-col gap-3"
      >
        <AnimatePresence mode="popLayout">
          {mapToastItems(store, toasts, (currentToast) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              onAnimationComplete={(definition) => {
                if (definition === "exit") {
                  store.markExited(currentToast.id);
                }
              }}
            >
              <AnchoredToast />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ViewportLayer>
  );
}

function FloatingAnchorPreview() {
  const bellRef = useRef<HTMLButtonElement>(null);
  const count = useStore(toast).filter((t) => t.status !== "exiting").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-indigo-500 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          onClick={() =>
            toast.success({
              title: "Saved",
              body: "Anchored stacks can follow buttons or badges.",
            })
          }
        >
          Trigger success
        </button>
        <button
          type="button"
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition duration-150 hover:border-slate-300 hover:bg-slate-100 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
          onClick={() =>
            toast.error({
              title: "Error",
              body: "This toast is positioned by Floating UI.",
            })
          }
        >
          Trigger error
        </button>
        <button
          ref={bellRef}
          type="button"
          className="relative cursor-pointer rounded-full border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-950 shadow-sm transition duration-150 hover:border-slate-300 hover:bg-slate-100 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50 dark:hover:border-slate-700 dark:hover:bg-slate-800"
        >
          Bell
          {count > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white">
              {count}
            </span>
          ) : null}
        </button>
      </div>
      <AnchoredToaster store={toast} referenceRef={bellRef} />
    </div>
  );
}

const code = extractExampleSource(rawSource);

function FloatingAnchorPage() {
  return (
    <ExamplePage
      category="Advanced"
      title="Floating anchor"
      summary="Use Floating UI when toasts should follow a trigger, icon, badge, or surface instead of one of the built-in viewport placements."
      files={[{ filename: "floating-anchor.tsx", language: "tsx", code }]}
      preview={<FloatingAnchorPreview />}
    />
  );
}

export { FloatingAnchorPage };
