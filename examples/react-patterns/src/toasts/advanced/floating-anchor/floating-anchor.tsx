import { useEffect, useRef } from "react";
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
      className="pointer-events-auto relative flex min-w-[18rem] gap-4 rounded-[1.5rem] border border-(--line) bg-(--surface-strong) p-4 pr-12 shadow-[0_24px_50px_rgba(15,23,42,0.18)]"
      onMouseEnter={pauseOnHoverHandlers.onMouseEnter}
      onMouseLeave={pauseOnHoverHandlers.onMouseLeave}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-(--ink)">{toast.data.title}</p>
        <p className="mt-1 text-sm text-(--ink-soft)">{toast.data.body}</p>
      </div>
      <button
        type="button"
        className="absolute right-3 top-3 text-xs text-(--ink-soft)"
        onClick={() => dismiss("user")}
      >
        Close
      </button>
    </article>
  );
}

function AnchoredToaster({
  store,
  referenceRef,
}: {
  store: ReactToastStore<{ title: string; body: string }>;
  referenceRef: React.RefObject<HTMLElement | null>;
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
        className="z-[9999] flex max-w-sm flex-col gap-3"
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
  const count = useStore(toast).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="doc-button"
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
          className="doc-button doc-button-secondary"
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
          className="relative rounded-full border border-(--line) bg-(--chip-bg) px-4 py-2 font-semibold text-(--ink)"
        >
          Bell
          {count > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
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
      notes={[
        "The toast store still manages state; Floating UI only handles positioning.",
        "This is useful for inbox badges, notification bells, or contextual action menus.",
        "Anchored stacks feel more local and task-specific than global viewport toasts.",
      ]}
      files={[{ filename: "floating-anchor.tsx", language: "tsx", code }]}
      preview={<FloatingAnchorPreview />}
    />
  );
}

export { FloatingAnchorPage };
