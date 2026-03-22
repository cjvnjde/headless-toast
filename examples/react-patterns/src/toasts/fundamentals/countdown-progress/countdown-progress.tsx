import { useRef } from "react";
import {
  Toaster,
  createToast,
  useProgress,
  useToastActions,
  useToastAnimation,
  useToastSelector,
} from "@headless-toast/react";
import type { ReactToastState, ReactToastStore } from "@headless-toast/react";
import { ExamplePage } from "#/components/ExamplePage";
import { extractExampleSource } from "#/lib/exampleSource";
import "./toast.css";
import rawSource from "./countdown-progress.tsx?raw";
import toastCss from "./toast.css?raw";

type CountdownToastData = { title: string; body: string };

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
  const options = useToastSelector(
    (toast: ReactToastState<CountdownToastData>) => toast.options,
  );
  const { dismiss, pauseOnHoverHandlers } =
    useToastActions<CountdownToastData>();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className:
      "countdown-progress-toast pointer-events-auto relative w-full overflow-hidden rounded-3xl border border-(--line) bg-(--surface-strong) p-4 pr-12 shadow-[0_18px_36px_rgba(15,23,42,0.12)]",
  });

  return (
    <article
      ref={ref}
      className={className}
      {...handlers}
      {...pauseOnHoverHandlers}
      {...attributes}
      data-toast-placement={options.placement ?? "top-right"}
    >
      <p className="text-sm font-semibold text-(--ink)">{data.title}</p>
      <p className="mt-1 text-sm text-(--ink-soft)">{data.body}</p>
      <button
        type="button"
        className="absolute right-3 top-3 text-xs text-(--ink-soft)"
        onClick={() => dismiss("user")}
      >
        Close
      </button>
      <div className="mt-4 h-1.5 rounded-full bg-black/8 dark:bg-white/8">
        <ProgressBar />
      </div>
    </article>
  );
}

function CountdownProgressPreview() {
  const storeRef = useRef<ReactToastStore<CountdownToastData> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createToast<CountdownToastData>({
      defaults: { placement: "top-right" },
    }).toast;
  }

  const toast = storeRef.current;

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
      notes={[
        "The progress value is already calculated for you by the store.",
        "pauseOnHover keeps the default duration short while still respecting readable content.",
        "This pattern works especially well for uploads, exports, and background jobs.",
      ]}
      files={[
        { filename: "countdown-progress.tsx", language: "tsx", code },
        { filename: "toast.css", language: "css", code: toastCss },
      ]}
      preview={<CountdownProgressPreview />}
    />
  );
}

export { CountdownProgressPage };
