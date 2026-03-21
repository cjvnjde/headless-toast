import { useRef } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { createFileRoute } from "@tanstack/react-router";
import {
  ToastCtx,
  createToast,
  useStore,
  useToast,
  useToastAnimation,
} from "@headless-toast/react";
import type { ReactToastStore } from "@headless-toast/react";
import { ExamplePage } from "../../components/ExamplePage";
import { extractRouteExampleSource } from "../../lib/exampleSource";
import rawSource from "./scrollable-tray.tsx?raw";

function ViewportLayer({ children }: { children: ReactNode }) {
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(children, document.body);
}

export const Route = createFileRoute("/examples/scrollable-tray")({
  component: ScrollableTrayPage,
});

function TrayToast() {
  const { toast, dismiss } = useToast<{ title: string; body: string }>();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className:
      "pointer-events-auto relative rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 pr-12 shadow-[0_18px_36px_rgba(15,23,42,0.12)]",
  });

  return (
    <article ref={ref} className={className} {...handlers} {...attributes}>
      <p className="text-sm font-semibold text-[var(--ink)]">
        {toast.data.title}
      </p>
      <p className="mt-1 text-sm text-[var(--ink-soft)]">{toast.data.body}</p>
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

function ScrollableToaster({
  store,
}: {
  store: ReactToastStore<{ title: string; body: string }>;
}) {
  const toasts = useStore(store);

  return (
    <ViewportLayer>
      <div className="fixed right-4 top-4 z-[9999] max-h-[calc(100vh-2rem)] w-[min(24rem,calc(100vw-2rem))] overflow-y-auto pr-2">
        <div className="flex flex-col gap-3">
          {toasts.map((toast) => (
            <ToastCtx.Provider key={toast.id} value={{ toast, store }}>
              <TrayToast />
            </ToastCtx.Provider>
          ))}
        </div>
      </div>
    </ViewportLayer>
  );
}

function ScrollableTrayPreview() {
  const storeRef = useRef<ReactToastStore<{
    title: string;
    body: string;
  }> | null>(null);
  const countRef = useRef(0);

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
          onClick={() => {
            for (let index = 0; index < 12; index += 1) {
              countRef.current += 1;
              toast.info(
                {
                  title: `Toast #${countRef.current}`,
                  body: "Scroll the tray to inspect older items.",
                },
                { duration: 0 },
              );
            }
          }}
        >
          Add 12 toasts
        </button>
      </div>
      <ScrollableToaster store={toast} />
    </div>
  );
}

const code = extractRouteExampleSource(rawSource);

function ScrollableTrayPage() {
  return (
    <ExamplePage
      category="State"
      title="Scrollable tray"
      summary="If a surface legitimately needs many simultaneous notifications, render them in a scrollable tray instead of overlapping or clipping them."
      notes={[
        "Like the stacked deck, this is purely a custom render loop powered by useStore().",
        "Scrollable trays work well for ops dashboards, inboxes, and notification centers.",
        "The core store keeps lifecycle timing and actions intact while you own the layout.",
      ]}
      files={[{ filename: "scrollable-tray.tsx", language: "tsx", code }]}
      preview={<ScrollableTrayPreview />}
    />
  );
}
