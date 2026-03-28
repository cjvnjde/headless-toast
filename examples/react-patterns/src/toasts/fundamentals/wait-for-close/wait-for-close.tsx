import { useState } from "react";
import {
  Toaster,
  createToast,
  useProgress,
  useToastActions,
  useToastAnimation,
  useToastSelector,
} from "@headless-toast/react";
import type { CloseReason, ReactToastState } from "@headless-toast/react";
import { ExamplePage } from "#/components/ExamplePage";
import { extractExampleSource } from "#/lib/exampleSource";
import "./toast.css";
import rawSource from "./wait-for-close.tsx?raw";
import toastCss from "./toast.css?raw";

type AwaitCloseToastData = {
  title: string;
  body: string;
};

const toast = createToast<AwaitCloseToastData>({
  defaults: { duration: 4200, pauseOnHover: true, placement: "top-right" },
}).toast;

function AwaitCloseProgressBar() {
  const progress = useProgress();

  return (
    <div
      className="h-full rounded-full bg-(--accent)"
      style={{ width: `${progress * 100}%` }}
    />
  );
}

function AwaitCloseToast() {
  const data = useToastSelector(
    (toast: ReactToastState<AwaitCloseToastData>) => toast.data,
  );
  const options = useToastSelector(
    (toast: ReactToastState<AwaitCloseToastData>) => toast.options,
  );
  const type = useToastSelector((toast) => toast.type);
  const { dismiss } = useToastActions<AwaitCloseToastData>();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className:
      "wait-for-close-toast pointer-events-auto relative w-full rounded-3xl border border-(--line) bg-(--surface-strong) p-4 pr-12 shadow-[0_18px_36px_rgba(15,23,42,0.12)]",
  });

  return (
    <article ref={ref} className={className} {...handlers} {...attributes}>
      <p className="text-xs font-bold tracking-[0.18em] uppercase text-(--accent-strong)">
        {type === "success" ? "Follow-up step" : "Awaiting close"}
      </p>
      <p className="mt-2 text-sm font-semibold text-(--ink)">{data.title}</p>
      <p className="mt-1 text-sm text-(--ink-soft)">{data.body}</p>

      {options.progress ? (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-black/8 dark:bg-white/10">
          <AwaitCloseProgressBar />
        </div>
      ) : null}

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
    </article>
  );
}

function WaitForClosePreview() {
  const [isWaiting, setIsWaiting] = useState(false);
  const [lastReason, setLastReason] = useState<CloseReason | null>(null);
  const [statusMessage, setStatusMessage] = useState(
    "Start the flow, then either click the close icon or let the toast timeout.",
  );

  async function startFlow() {
    if (isWaiting) {
      return;
    }

    setIsWaiting(true);
    setLastReason(null);
    setStatusMessage(
      "Waiting for handle.closed to resolve after the exit finishes...",
    );

    const handle = toast.info(
      {
        title: "Review complete",
        body: "Follow-up work stays paused until this toast fully leaves the store.",
      },
      { progress: true },
    );

    const reason = await handle.closed;

    setLastReason(reason);
    setStatusMessage(
      `Resolved after full removal with close reason "${reason}".`,
    );
    setIsWaiting(false);

    toast.success(
      {
        title: "Next step unlocked",
        body: `The follow-up toast appeared only after the previous one closed via "${reason}".`,
      },
      { duration: 2800 },
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="doc-button disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isWaiting}
          onClick={() => void startFlow()}
        >
          {isWaiting ? "Waiting for close..." : "Show toast and await close"}
        </button>
      </div>

      <div className="rounded-[1.5rem] border border-(--line) bg-(--surface-strong) p-4 shadow-[0_14px_28px_rgba(15,23,42,0.08)]">
        <p className="text-xs font-bold tracking-[0.18em] uppercase text-(--accent-strong)">
          Workflow state
        </p>
        <p className="mt-2 text-sm leading-7 text-(--ink)">{statusMessage}</p>
        <p className="mt-3 text-xs font-medium text-(--ink-soft)">
          Last close reason: {lastReason ?? "—"}
        </p>
      </div>

      <Toaster
        store={toast}
        className="pointer-events-none fixed inset-0 z-[9999]"
      >
        <Toaster.List className="fixed right-4 top-4 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
          <AwaitCloseToast />
        </Toaster.List>
      </Toaster>
    </div>
  );
}

const code = extractExampleSource(rawSource);

function WaitForClosePage() {
  return (
    <ExamplePage
      category="Fundamentals"
      title="Wait for close"
      summary="Every toast handle exposes a closed promise, so follow-up work can wait until the toast has fully exited and been removed."
      files={[
        { filename: "wait-for-close.tsx", language: "tsx", code },
        { filename: "toast.css", language: "css", code: toastCss },
      ]}
      preview={<WaitForClosePreview />}
    />
  );
}

export { WaitForClosePage };
