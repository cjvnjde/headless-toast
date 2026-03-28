import { useRef } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  mapToastItems,
  createToast,
  useStore,
  useToast,
  useToastAnimation,
} from "@headless-toast/react";
import type { ReactToastStore } from "@headless-toast/react";
import { ExamplePage } from "#/components/ExamplePage";
import { extractExampleSource } from "#/lib/exampleSource";
import rawSource from "./scrollable-tray.tsx?raw";

const toast = createToast<{ title: string; body: string }>({
  defaults: { duration: 0 },
}).toast;

function ViewportLayer({ children }: { children: ReactNode }) {
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(children, document.body);
}

function TrayToast() {
  const { toast, dismiss } = useToast<{ title: string; body: string }>();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className:
      "origin-top-right transition duration-200 ease-out will-change-[translate,scale,opacity] data-[toast-status=entering]:starting:opacity-0 data-[toast-status=entering]:starting:-translate-y-3 data-[toast-status=entering]:starting:scale-95 data-[toast-status=exiting]:opacity-0 data-[toast-status=exiting]:-translate-y-2 data-[toast-status=exiting]:scale-95 data-[toast-status=exiting]:duration-150 data-[toast-status=exiting]:ease-in [&[data-toast-placement^=bottom]]:origin-bottom-right pointer-events-auto relative rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 pr-12 shadow-xl",
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

function ScrollableToaster({
  store,
}: {
  store: ReactToastStore<{ title: string; body: string }>;
}) {
  const toasts = useStore(store);

  return (
    <ViewportLayer>
      <div className="fixed right-4 top-4 z-50 max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-sm overflow-y-auto pr-2">
        <div className="flex flex-col gap-3">
          {mapToastItems(store, toasts, () => (
            <TrayToast />
          ))}
        </div>
      </div>
    </ViewportLayer>
  );
}

function ScrollableTrayPreview() {
  const countRef = useRef(0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-indigo-500 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400"
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

const code = extractExampleSource(rawSource);

function ScrollableTrayPage() {
  return (
    <ExamplePage
      category="State"
      title="Scrollable tray"
      summary="If a surface legitimately needs many simultaneous notifications, render them in a scrollable tray instead of overlapping or clipping them."
      files={[{ filename: "scrollable-tray.tsx", language: "tsx", code }]}
      preview={<ScrollableTrayPreview />}
    />
  );
}

export { ScrollableTrayPage };
