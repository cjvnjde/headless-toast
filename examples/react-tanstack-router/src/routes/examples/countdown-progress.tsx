import { useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Toaster,
  createToast,
  useToast,
  useToastAnimation,
} from "@headless-toast/react";
import type { ReactToastStore } from "@headless-toast/react";
import { ExamplePage } from "../../components/ExamplePage";
import { extractRouteExampleSource } from "../../lib/exampleSource";
import rawSource from "./countdown-progress.tsx?raw";

export const Route = createFileRoute("/examples/countdown-progress")({
  component: CountdownProgressPage,
});

function ProgressToast() {
  const { toast, dismiss, pauseOnHoverHandlers } = useToast<{
    title: string;
    body: string;
  }>();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className:
      "pointer-events-auto relative w-full overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 pr-12 shadow-[0_18px_36px_rgba(15,23,42,0.12)]",
  });

  return (
    <article
      ref={ref}
      className={className}
      {...handlers}
      {...pauseOnHoverHandlers}
      {...attributes}
    >
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
      <div className="mt-4 h-1.5 rounded-full bg-black/8 dark:bg-white/8">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),#7ce6db)]"
          style={{ width: `${toast.progress * 100}%` }}
        />
      </div>
    </article>
  );
}

function CountdownProgressPreview() {
  const storeRef = useRef<ReactToastStore<{
    title: string;
    body: string;
  }> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createToast<{ title: string; body: string }>({
      defaults: { placement: "top-right" },
    }).toast;
  }

  const toast = storeRef.current;

  return (
    <div className="space-y-4">
      <p className="text-sm leading-7 text-[var(--ink-soft)]">
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

const code = extractRouteExampleSource(rawSource);

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
      files={[{ filename: "countdown-progress.tsx", language: "tsx", code }]}
      preview={<CountdownProgressPreview />}
    />
  );
}
