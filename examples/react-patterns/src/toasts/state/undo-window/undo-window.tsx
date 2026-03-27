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
import rawSource from "./undo-window.tsx?raw";
import toastCss from "./toast.css?raw";

type UndoWindowToastData = {
  title: string;
  body: string;
};

type ArchiveStatus = "active" | "pending" | "archived";

const toast = createToast<UndoWindowToastData>({
  defaults: { placement: "top-right", pauseOnHover: true },
}).toast;

function isCommitReason(reason: CloseReason) {
  return reason === "timeout" || reason === "programmatic";
}

function UndoWindowProgressBar() {
  const progress = useProgress();

  return (
    <div
      className="h-full rounded-full bg-(--accent)"
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
      "undo-window-toast pointer-events-auto relative w-full rounded-3xl border border-(--line) bg-(--surface-strong) p-4 pr-12 shadow-[0_18px_36px_rgba(15,23,42,0.12)]",
  });

  return (
    <article ref={ref} className={className} {...handlers} {...attributes}>
      <p className="text-xs font-bold tracking-[0.18em] uppercase text-(--accent-strong)">
        {type === "warning" ? "Undo window" : "Workflow update"}
      </p>
      <p className="mt-2 text-sm font-semibold text-(--ink)">{data.title}</p>
      <p className="mt-1 text-sm leading-6 text-(--ink-soft)">{data.body}</p>

      {type === "warning" ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-full border border-(--line) px-3 py-1.5 text-sm font-medium text-(--ink) hover:bg-black/4 dark:hover:bg-white/6"
            onClick={() => dismiss("user")}
          >
            Undo
          </button>
          <button
            type="button"
            className="rounded-full bg-(--accent) px-3 py-1.5 text-sm font-semibold text-white hover:brightness-105"
            onClick={() => dismiss("programmatic")}
          >
            Archive now
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="absolute right-3 top-3 text-xs text-(--ink-soft)"
          onClick={() => dismiss("user")}
        >
          Close
        </button>
      )}

      {options.progress ? (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-black/8 dark:bg-white/10">
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

  const statusBadgeClassName =
    status === "active"
      ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300"
      : status === "pending"
        ? "bg-amber-500/14 text-amber-700 dark:text-amber-300"
        : "bg-slate-500/14 text-slate-700 dark:text-slate-200";

  return (
    <div className="space-y-4">
      <div className="rounded-[1.5rem] border border-(--line) bg-(--surface-strong) p-5 shadow-[0_14px_28px_rgba(15,23,42,0.08)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] uppercase text-(--accent-strong)">
              Pending action
            </p>
            <p className="mt-2 text-lg font-semibold text-(--ink)">
              project-brief.md
            </p>
            <span
              className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClassName}`}
            >
              {status}
            </span>
          </div>

          {status === "archived" ? (
            <button
              type="button"
              className="doc-button doc-button-secondary"
              onClick={resetItem}
            >
              Restore item
            </button>
          ) : (
            <button
              type="button"
              className="doc-button disabled:cursor-not-allowed disabled:opacity-60"
              disabled={status === "pending"}
              onClick={() => void startArchiveFlow()}
            >
              {status === "pending"
                ? "Undo window open..."
                : "Archive with undo window"}
            </button>
          )}
        </div>

        <p className="mt-4 text-sm leading-7 text-(--ink-soft)">{activity}</p>
        <p className="mt-3 text-xs font-medium text-(--ink-soft)">
          Last close reason: {lastReason ?? "—"}
        </p>
      </div>

      <Toaster
        store={toast}
        className="pointer-events-none fixed inset-0 z-[9999]"
      >
        <Toaster.List className="fixed right-4 top-4 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
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
      notes={[
        "The preview keeps the item pending until the toast fully exits, not just until a button is clicked.",
        "User closes the toast through Undo, programmatic closes it through Archive now, and timeout commits automatically.",
        "This pattern works well for soft-delete, archive, and delayed-send workflows.",
      ]}
      files={[
        { filename: "undo-window.tsx", language: "tsx", code },
        { filename: "toast.css", language: "css", code: toastCss },
      ]}
      preview={<UndoWindowPreview />}
    />
  );
}

export { UndoWindowPage };
