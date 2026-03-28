import {
  Toaster,
  createToast,
  useProgress,
  useToastActions,
  useToastAnimation,
  useToastSelector,
} from "@headless-toast/react";
import type { ReactToastState } from "@headless-toast/react";
import { ExamplePage } from "#/components/ExamplePage";
import { extractExampleSource } from "#/lib/exampleSource";
import "./toast.css";
import rawSource from "./countdown-progress.tsx?raw";
import toastCss from "./toast.css?raw";

type CountdownToastData = { title: string; body: string };

const toast = createToast<CountdownToastData>({
  defaults: { placement: "top-right" },
}).toast;

function ProgressBar() {
  const progress = useProgress();

  return (
    <div
      className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),#7ce6db)]"
      style={{ width: `${progress * 100}%` }}
    />
  );
}

function ProgressToast() {
  const data = useToastSelector(
    (toast: ReactToastState<CountdownToastData>) => toast.data,
  );
  const { dismiss } = useToastActions<CountdownToastData>();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className:
      "countdown-progress-toast pointer-events-auto relative w-full overflow-hidden rounded-3xl border border-(--line) bg-(--surface-strong) p-4 pr-12 shadow-[0_18px_36px_rgba(15,23,42,0.12)]",
  });

  return (
    <article ref={ref} className={className} {...handlers} {...attributes}>
      <p className="text-sm font-semibold text-(--ink)">{data.title}</p>
      <p className="mt-1 text-sm text-(--ink-soft)">{data.body}</p>
      <button
        type="button"
        aria-label="Close toast"
        className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-(--line) text-(--ink-soft) hover:bg-black/4 dark:hover:bg-white/6"
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
      <div className="mt-4 h-1.5 rounded-full bg-black/8 dark:bg-white/8">
        <ProgressBar />
      </div>
    </article>
  );
}

function CountdownProgressPreview() {
  return (
    <div className="space-y-4">
      <p className="text-sm leading-7 text-(--ink-soft)">
        Hover the toast to pause its countdown, then move away to resume.
      </p>
      <button
        type="button"
        className="doc-button"
        onClick={() =>
          toast.info(
            {
              title: "Export running",
              body: "The timer pauses while you read this.",
            },
            { duration: 5500, progress: true, pauseOnHover: true },
          )
        }
      >
        Start countdown toast
      </button>
      <Toaster
        store={toast}
        className="pointer-events-none fixed inset-0 z-[9999]"
      >
        <Toaster.List className="fixed right-4 top-4 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
          <ProgressToast />
        </Toaster.List>
      </Toaster>
    </div>
  );
}

const code = extractExampleSource(rawSource);

function CountdownProgressPage() {
  return (
    <ExamplePage
      category="Fundamentals"
      title="Countdown progress"
      summary="Expose remaining lifetime with toast.progress and pair it with pauseOnHover so long messages stay readable without permanently increasing duration."
      files={[
        { filename: "countdown-progress.tsx", language: "tsx", code },
        { filename: "toast.css", language: "css", code: toastCss },
      ]}
      preview={<CountdownProgressPreview />}
    />
  );
}

export { CountdownProgressPage };
