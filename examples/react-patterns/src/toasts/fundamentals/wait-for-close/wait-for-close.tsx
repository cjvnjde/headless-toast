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
import rawSource from "./wait-for-close.tsx?raw";

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
      className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500"
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
      "origin-top-right transition duration-200 ease-out will-change-[translate,scale,opacity] data-[toast-status=entering]:starting:opacity-0 data-[toast-status=entering]:starting:-translate-y-3 data-[toast-status=entering]:starting:scale-95 data-[toast-status=exiting]:opacity-0 data-[toast-status=exiting]:-translate-y-2 data-[toast-status=exiting]:scale-95 data-[toast-status=exiting]:duration-150 data-[toast-status=exiting]:ease-in [&[data-toast-placement^=bottom]]:origin-bottom-right pointer-events-auto relative w-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 pr-12 shadow-xl",
  });

  return (
    <article ref={ref} className={className} {...handlers} {...attributes}>
      <p className="text-xs font-bold tracking-widest uppercase text-indigo-600 dark:text-indigo-300">
        {type === "success" ? "Follow-up step" : "Awaiting close"}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-slate-50">
        {data.title}
      </p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        {data.body}
      </p>

      {options.progress ? (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <AwaitCloseProgressBar />
        </div>
      ) : null}

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
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-indigo-500 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          disabled={isWaiting}
          onClick={() => void startFlow()}
        >
          {isWaiting ? "Waiting for close..." : "Show toast and await close"}
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-lg">
        <p className="text-xs font-bold tracking-widest uppercase text-indigo-600 dark:text-indigo-300">
          Workflow state
        </p>
        <p className="mt-2 text-sm leading-7 text-slate-950 dark:text-slate-50">
          {statusMessage}
        </p>
        <p className="mt-3 text-xs font-medium text-slate-600 dark:text-slate-300">
          Last close reason: {lastReason ?? "—"}
        </p>
      </div>

      <Toaster store={toast} className="pointer-events-none fixed inset-0 z-50">
        <Toaster.List className="fixed right-4 top-4 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
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
      files={[{ filename: "wait-for-close.tsx", language: "tsx", code }]}
      preview={<WaitForClosePreview />}
    />
  );
}

export { WaitForClosePage };
