import { useState } from "react";
import { tv } from "tailwind-variants";
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
import rawSource from "./undo-window.tsx?raw";

type UndoWindowToastData = {
  title: string;
  body: string;
};

type ArchiveStatus = "active" | "pending" | "archived";

const toast = createToast<UndoWindowToastData>({
  defaults: { placement: "top-right", pauseOnHover: true },
}).toast;

const archiveStatusBadge = tv({
  base: "mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold",
  variants: {
    status: {
      active:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200",
      pending:
        "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200",
      archived:
        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    },
  },
});

function isCommitReason(reason: CloseReason) {
  return reason === "timeout" || reason === "programmatic";
}

function UndoWindowProgressBar() {
  const progress = useProgress();

  return (
    <div
      className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500"
      style={{ width: `${progress * 100}%` }}
    />
  );
}

function UndoWindowToast() {
  const data = useToastSelector(
    (toast: ReactToastState<UndoWindowToastData>) => toast.data,
  );
  const options = useToastSelector(
    (toast: ReactToastState<UndoWindowToastData>) => toast.options,
  );
  const type = useToastSelector((toast) => toast.type);
  const { dismiss } = useToastActions<UndoWindowToastData>();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className:
      "origin-top-right transition duration-200 ease-out will-change-[translate,scale,opacity] data-[toast-status=entering]:starting:opacity-0 data-[toast-status=entering]:starting:-translate-y-3 data-[toast-status=entering]:starting:scale-95 data-[toast-status=exiting]:opacity-0 data-[toast-status=exiting]:-translate-y-2 data-[toast-status=exiting]:scale-95 data-[toast-status=exiting]:duration-150 data-[toast-status=exiting]:ease-in [&[data-toast-placement^=bottom]]:origin-bottom-right pointer-events-auto relative w-full rounded-3xl border border-slate-200 bg-white p-4 pr-12 shadow-xl dark:border-slate-800 dark:bg-slate-900",
  });

  return (
    <article ref={ref} className={className} {...handlers} {...attributes}>
      <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
        {type === "warning" ? "Undo window" : "Workflow update"}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-slate-50">
        {data.title}
      </p>
      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
        {data.body}
      </p>

      {type === "warning" ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-full cursor-pointer border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-950 transition duration-150 hover:bg-slate-100 hover:shadow-md dark:border-slate-800 dark:text-slate-50 dark:hover:bg-slate-800"
            onClick={() => dismiss("user")}
          >
            Undo
          </button>
          <button
            type="button"
            className="rounded-full cursor-pointer bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white transition duration-150 hover:bg-indigo-500 hover:shadow-md dark:bg-indigo-500 dark:hover:bg-indigo-400"
            onClick={() => dismiss("programmatic")}
          >
            Archive now
          </button>
        </div>
      ) : (
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
      )}

      {options.progress ? (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <UndoWindowProgressBar />
        </div>
      ) : null}
    </article>
  );
}

function UndoWindowPreview() {
  const [status, setStatus] = useState<ArchiveStatus>("active");
  const [lastReason, setLastReason] = useState<CloseReason | null>(null);
  const [activity, setActivity] = useState(
    "Archive stays reversible until the toast fully closes.",
  );

  async function startArchiveFlow() {
    if (status === "pending") {
      return;
    }

    setStatus("pending");
    setLastReason(null);
    setActivity(
      "Undo window started. The item will only move after handle.closed resolves.",
    );

    const handle = toast.warning(
      {
        title: "Archive project brief?",
        body: "Undo keeps it in the active list. Archive now or let the timer finish to commit the change.",
      },
      {
        id: "archive-project-brief",
        duration: 5000,
        progress: true,
      },
    );

    const reason = await handle.closed;

    setLastReason(reason);

    if (isCommitReason(reason)) {
      setStatus("archived");
      setActivity(
        `Archived after the toast fully closed with reason "${reason}".`,
      );
      toast.success(
        {
          title: "Archived",
          body: "The item moved only after the undo window was truly over.",
        },
        { duration: 2800 },
      );
      return;
    }

    setStatus("active");
    setActivity(
      `Stayed active because the toast closed with reason "${reason}" before the timeout committed it.`,
    );
    toast.info(
      {
        title: "Archive canceled",
        body: "Undo won because the toast closed before the commit path ran.",
      },
      { duration: 2600 },
    );
  }

  function resetItem() {
    setStatus("active");
    setLastReason(null);
    setActivity("Reset the item so you can replay the undo flow.");
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
              Pending action
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-50">
              project-brief.md
            </p>
            <span className={archiveStatusBadge({ status })}>{status}</span>
          </div>

          {status === "archived" ? (
            <button
              type="button"
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition duration-150 hover:border-slate-300 hover:bg-slate-100 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
              onClick={resetItem}
            >
              Restore item
            </button>
          ) : (
            <button
              type="button"
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-indigo-500 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400"
              disabled={status === "pending"}
              onClick={() => void startArchiveFlow()}
            >
              {status === "pending"
                ? "Undo window open..."
                : "Archive with undo window"}
            </button>
          )}
        </div>

        <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
          {activity}
        </p>
        <p className="mt-3 text-xs font-medium text-slate-600 dark:text-slate-300">
          Last close reason: {lastReason ?? "—"}
        </p>
      </div>

      <Toaster store={toast} className="pointer-events-none fixed inset-0 z-50">
        <Toaster.List className="fixed right-4 top-4 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
          <UndoWindowToast />
        </Toaster.List>
      </Toaster>
    </div>
  );
}

const code = extractExampleSource(rawSource);

function UndoWindowPage() {
  return (
    <ExamplePage
      category="State"
      title="Undo window"
      summary="Await handle.closed and branch on the close reason when destructive work should wait until the toast's undo window is truly over."
      files={[{ filename: "undo-window.tsx", language: "tsx", code }]}
      preview={<UndoWindowPreview />}
    />
  );
}

export { UndoWindowPage };
