import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  ToastCtx,
  createToast,
  useStore,
  useToast,
  useToastAnimation,
} from "@headless-toast/react";
import type { ReactToastStore } from "@headless-toast/react";
import { ExamplePage } from "#/components/ExamplePage";
import { extractExampleSource } from "#/lib/exampleSource";
import "./toast.css";
import rawSource from "./stacked-deck.tsx?raw";
import toastCss from "./toast.css?raw";

function ViewportLayer({ children }: { children: ReactNode }) {
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(children, document.body);
}

const TOAST_HEIGHT = 96;
const COLLAPSED_GAP = 16;
const EXPANDED_GAP = 12;
const MAX_VISIBLE = 5;

function DeckToast() {
  const { toast, dismiss } = useToast<{ title: string; body: string }>();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className:
      "stacked-deck-toast pointer-events-auto relative h-full rounded-3xl border border-(--line) bg-(--surface-strong) p-4 pr-12 shadow-[0_20px_40px_rgba(15,23,42,0.14)]",
  });

  return (
    <article
      ref={ref}
      className={className}
      {...handlers}
      {...attributes}
      data-toast-placement={toast.options.placement ?? "top-right"}
    >
      <p className="text-sm font-semibold text-(--ink)">{toast.data.title}</p>
      <p className="mt-1 text-sm text-(--ink-soft)">{toast.data.body}</p>
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

function DeckToaster({
  store,
}: {
  store: ReactToastStore<{ title: string; body: string }>;
}) {
  const toasts = useStore(store);
  const [expanded, setExpanded] = useState(false);
  const reversed = [...toasts].reverse();
  const visibleCount = Math.min(reversed.length, MAX_VISIBLE);
  const collapsedHeight =
    reversed.length === 0
      ? 0
      : TOAST_HEIGHT + (visibleCount - 1) * COLLAPSED_GAP;
  const expandedHeight =
    reversed.length * TOAST_HEIGHT +
    Math.max(0, reversed.length - 1) * EXPANDED_GAP;

  return (
    <ViewportLayer>
      <div
        className="fixed right-4 top-4 z-[9999] w-[min(24rem,calc(100vw-2rem))]"
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        <div
          className="relative transition-[height] duration-300"
          style={{ height: expanded ? expandedHeight : collapsedHeight }}
        >
          {reversed.map((toast, index) => {
            const hidden = !expanded && index >= MAX_VISIBLE;
            const y = expanded
              ? index * (TOAST_HEIGHT + EXPANDED_GAP)
              : index * COLLAPSED_GAP;
            const scale = expanded ? 1 : Math.max(1 - index * 0.03, 0.9);
            const opacity = hidden
              ? 0
              : expanded
                ? 1
                : Math.max(1 - index * 0.18, 0.28);

            return (
              <div
                key={toast.id}
                className="absolute inset-x-0 top-0 h-24 transition duration-300"
                style={{
                  transform: `translateY(${y}px) scale(${scale})`,
                  opacity,
                  zIndex: reversed.length - index,
                }}
              >
                <ToastCtx.Provider value={{ toast, store }}>
                  <DeckToast />
                </ToastCtx.Provider>
              </div>
            );
          })}
        </div>
        {!expanded && reversed.length > 1 ? (
          <p className="mt-3 text-center text-xs font-medium text-(--ink-soft)">
            {reversed.length} notifications — hover to expand
          </p>
        ) : null}
      </div>
    </ViewportLayer>
  );
}

function StackedDeckPreview() {
  const storeRef = useRef<ReactToastStore<{
    title: string;
    body: string;
  }> | null>(null);
  const countRef = useRef(0);
  const types = ["success", "error", "warning", "info"] as const;

  if (!storeRef.current) {
    storeRef.current = createToast<{ title: string; body: string }>({
      defaults: { duration: 0 },
    }).toast;
  }

  const toast = storeRef.current;

  function addOne() {
    countRef.current += 1;
    const type = types[countRef.current % types.length];
    toast[type](
      {
        title: `Toast #${countRef.current}`,
        body: `This stack uses useStore() and a custom layout.`,
      },
      { duration: 0 },
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button type="button" className="doc-button" onClick={addOne}>
          Add toast
        </button>
        <button
          type="button"
          className="doc-button doc-button-secondary"
          onClick={() => {
            for (let index = 0; index < 5; index += 1) addOne();
          }}
        >
          Add 5
        </button>
      </div>
      <DeckToaster store={toast} />
    </div>
  );
}

const code = extractExampleSource(rawSource);

function StackedDeckPage() {
  return (
    <ExamplePage
      category="State"
      title="Stacked deck"
      summary="When a product surface can accumulate many notifications, useStore() lets you collapse them into a hover-expandable deck instead of a tall linear list."
      notes={[
        "This layout never touches the core store — it is purely a React render strategy.",
        "Collapsed stacks help dashboards and admin tools where notifications can arrive quickly.",
        "Hover-to-expand keeps detail available without overwhelming the viewport.",
      ]}
      files={[
        { filename: "stacked-deck.tsx", language: "tsx", code },
        { filename: "toast.css", language: "css", code: toastCss },
      ]}
      preview={<StackedDeckPreview />}
    />
  );
}

export { StackedDeckPage };
