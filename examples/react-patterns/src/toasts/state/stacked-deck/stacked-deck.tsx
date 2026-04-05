import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  computeStackedDeckLayout,
  mapToastItems,
  createToast,
  useStore,
  useToast,
  useToastAnimation,
} from "@headless-toast/react";
import type { ReactToastStore } from "@headless-toast/react";
import { ExamplePage } from "#/components/ExamplePage";
import { extractExampleSource } from "#/lib/exampleSource";
import rawSource from "./stacked-deck.tsx?raw";

const toast = createToast<{ title: string; body: string }>({
  defaults: { duration: 0 },
}).toast;

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
      "origin-top-right transition duration-200 ease-out will-change-[translate,scale,opacity] data-[toast-status=entering]:starting:opacity-0 data-[toast-status=entering]:starting:-translate-y-3 data-[toast-status=entering]:starting:scale-95 data-[toast-status=exiting]:opacity-0 data-[toast-status=exiting]:-translate-y-2 data-[toast-status=exiting]:scale-95 data-[toast-status=exiting]:duration-150 data-[toast-status=exiting]:ease-in [&[data-toast-placement^=bottom]]:origin-bottom-right pointer-events-auto relative h-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 pr-12 shadow-xl",
  });

  return (
    <article ref={ref} className={className} {...handlers} {...attributes}>
      <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">
        {toast.data.title}
      </p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        {toast.data.body}
      </p>
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

function DeckToaster({
  store,
}: {
  store: ReactToastStore<{ title: string; body: string }>;
}) {
  const toasts = useStore(store);
  const [expanded, setExpanded] = useState(false);
  const deck = computeStackedDeckLayout(toasts, {
    expanded,
    itemHeight: TOAST_HEIGHT,
    collapsedGap: COLLAPSED_GAP,
    expandedGap: EXPANDED_GAP,
    maxVisible: MAX_VISIBLE,
  });

  return (
    <ViewportLayer>
      <div
        className="fixed right-4 top-4 z-50 w-[calc(100vw-2rem)] max-w-sm"
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        <div
          className="relative transition-[height] duration-300"
          style={{ height: deck.height }}
        >
          {mapToastItems(store, deck.toasts, (currentToast) => (
            <div
              className="absolute inset-x-0 top-0 h-24 transition duration-300"
              style={{
                transform: `translateY(${currentToast.offset}px) scale(${currentToast.scale})`,
                opacity: currentToast.opacity,
                zIndex: currentToast.zIndex,
              }}
            >
              <DeckToast />
            </div>
          ))}
        </div>
        {!expanded && deck.totalCount > 1 ? (
          <p className="mt-3 text-center text-xs font-medium text-slate-600 dark:text-slate-300">
            {deck.totalCount} notifications — hover to expand
          </p>
        ) : null}
      </div>
    </ViewportLayer>
  );
}

function StackedDeckPreview() {
  const countRef = useRef(0);
  const types = ["success", "error", "warning", "info"] as const;

  function addOne() {
    countRef.current += 1;
    const type = types[countRef.current % types.length];
    toast[type](
      {
        title: `Toast #${countRef.current}`,
        body: `This stack uses computeStackedDeckLayout() under the hood.`,
      },
      { duration: 0 },
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-indigo-500 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          onClick={addOne}
        >
          Add toast
        </button>
        <button
          type="button"
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition duration-150 hover:border-slate-300 hover:bg-slate-100 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
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
      summary="When a product surface can accumulate many notifications, computeStackedDeckLayout() turns raw store state into a headless deck layout instead of making every app reimplement the stacking math."
      files={[{ filename: "stacked-deck.tsx", language: "tsx", code }]}
      preview={<StackedDeckPreview />}
    />
  );
}

export { StackedDeckPage };
