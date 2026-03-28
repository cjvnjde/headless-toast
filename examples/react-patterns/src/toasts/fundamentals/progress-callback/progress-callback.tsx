import { useRef } from "react";
import {
  Toaster,
  createToast,
  useProgressEffect,
  useToastActions,
  useToastAnimation,
  useToastSelector,
} from "@headless-toast/react";
import type { ReactToastState } from "@headless-toast/react";
import { ExamplePage } from "#/components/ExamplePage";
import { extractExampleSource } from "#/lib/exampleSource";
import rawSource from "./progress-callback.tsx?raw";

type ProgressCallbackToastData = {
  title: string;
  body: string;
};

const toast = createToast<ProgressCallbackToastData>({
  defaults: { placement: "top-right", pauseOnHover: true },
}).toast;

function DomProgressBar() {
  const fillRef = useRef<HTMLDivElement | null>(null);
  const valueRef = useRef<HTMLSpanElement | null>(null);

  useProgressEffect((progress) => {
    const percent = Math.round(progress * 100);

    if (fillRef.current) {
      fillRef.current.style.width = `${progress * 100}%`;
    }

    if (valueRef.current) {
      valueRef.current.textContent = `${percent}%`;
    }
  });

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
        <span>Progress callback</span>
        <span ref={valueRef}>0%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          ref={fillRef}
          className="h-full rounded-full bg-linear-to-r from-indigo-500 to-cyan-400 dark:from-indigo-400 dark:to-cyan-300"
          style={{ width: "0%" }}
        />
      </div>
    </div>
  );
}

function ProgressCallbackToast() {
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;

  const data = useToastSelector(
    (toast: ReactToastState<ProgressCallbackToastData>) => toast.data,
  );
  const { dismiss } = useToastActions<ProgressCallbackToastData>();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className:
      "origin-top-right transition duration-200 ease-out will-change-[translate,scale,opacity] data-[toast-status=entering]:starting:opacity-0 data-[toast-status=entering]:starting:-translate-y-3 data-[toast-status=entering]:starting:scale-95 data-[toast-status=exiting]:opacity-0 data-[toast-status=exiting]:-translate-y-2 data-[toast-status=exiting]:scale-95 data-[toast-status=exiting]:duration-150 data-[toast-status=exiting]:ease-in [&[data-toast-placement^=bottom]]:origin-bottom-right pointer-events-auto relative w-full overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 pr-12 shadow-xl dark:border-slate-800 dark:bg-slate-900",
  });

  return (
    <article ref={ref} className={className} {...handlers} {...attributes}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">
            {data.title}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {data.body}
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          renders: {renderCountRef.current}
        </span>
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

      <DomProgressBar />
    </article>
  );
}

function ProgressCallbackPreview() {
  return (
    <div className="space-y-4">
      <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
        The progress bar width and percentage text are updated directly on the
        DOM through useProgressEffect().
      </p>
      <button
        type="button"
        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-indigo-500 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400"
        onClick={() =>
          toast.info(
            {
              title: "Export running",
              body: "React stays out of the progress ticks while the DOM updates directly.",
            },
            { duration: 5200, progress: true, pauseOnHover: true },
          )
        }
      >
        Start callback-driven progress toast
      </button>
      <Toaster store={toast} className="pointer-events-none fixed inset-0 z-50">
        <Toaster.List className="fixed right-4 top-4 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
          <ProgressCallbackToast />
        </Toaster.List>
      </Toaster>
    </div>
  );
}

const code = extractExampleSource(rawSource);

function ProgressCallbackPage() {
  return (
    <ExamplePage
      category="Fundamentals"
      title="Progress callback"
      summary="Use useProgressEffect() when progress should drive DOM updates or side effects without re-rendering the toast body on every tick."
      files={[{ filename: "progress-callback.tsx", language: "tsx", code }]}
      preview={<ProgressCallbackPreview />}
    />
  );
}

export { ProgressCallbackPage };
