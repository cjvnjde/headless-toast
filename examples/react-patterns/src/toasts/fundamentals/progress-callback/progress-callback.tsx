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
import "./toast.css";
import rawSource from "./progress-callback.tsx?raw";
import toastCss from "./toast.css?raw";

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
      <div className="flex items-center justify-between text-xs font-medium text-(--ink-soft)">
        <span>Progress callback</span>
        <span ref={valueRef}>0%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-black/8 dark:bg-white/10">
        <div
          ref={fillRef}
          className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),#7ce6db)]"
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
      "progress-callback-toast pointer-events-auto relative w-full overflow-hidden rounded-3xl border border-(--line) bg-(--surface-strong) p-4 pr-12 shadow-[0_18px_36px_rgba(15,23,42,0.12)]",
  });

  return (
    <article ref={ref} className={className} {...handlers} {...attributes}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-(--ink)">{data.title}</p>
          <p className="mt-1 text-sm text-(--ink-soft)">{data.body}</p>
        </div>
        <span className="rounded-full bg-black/5 px-2 py-1 text-[11px] font-medium text-(--ink-soft) dark:bg-white/8">
          renders: {renderCountRef.current}
        </span>
      </div>

      <button
        type="button"
        className="absolute right-3 top-3 text-xs text-(--ink-soft)"
        onClick={() => dismiss("user")}
      >
        Close
      </button>

      <DomProgressBar />
    </article>
  );
}

function ProgressCallbackPreview() {
  return (
    <div className="space-y-4">
      <p className="text-sm leading-7 text-(--ink-soft)">
        The progress bar width and percentage text are updated directly on the
        DOM through useProgressEffect().
      </p>
      <button
        type="button"
        className="doc-button"
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
      <Toaster
        store={toast}
        className="pointer-events-none fixed inset-0 z-[9999]"
      >
        <Toaster.List className="fixed right-4 top-4 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
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
      notes={[
        "The callback receives every progress tick, just like a normal progress render path.",
        "This demo updates both the fill width and the visible percentage label directly on DOM nodes.",
        "The render counter should stay stable while the progress animation keeps moving.",
      ]}
      files={[
        { filename: "progress-callback.tsx", language: "tsx", code },
        { filename: "toast.css", language: "css", code: toastCss },
      ]}
      preview={<ProgressCallbackPreview />}
    />
  );
}

export { ProgressCallbackPage };
