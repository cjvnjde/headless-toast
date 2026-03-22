import { useRef, useState } from "react";
import {
  Toaster,
  createToast,
  useProgress,
  useToastActions,
  useToastAnimation,
  useToastSelector,
} from "@headless-toast/react";
import type {
  CloseReason,
  ReactResolvedToastOptions,
  ReactToastStore,
} from "@headless-toast/react";
import { ExamplePage } from "#/components/ExamplePage";
import { extractExampleSource } from "#/lib/exampleSource";
import "./toast.css";
import rawSource from "./wait-for-close.tsx?raw";
import toastCss from "./toast.css?raw";

type AwaitCloseToastData = {
  title: string;
  body: string;
};

function AwaitCloseProgressBar() {
  const progress = useProgress<AwaitCloseToastData>();

  return (
    <div
      className="h-full rounded-full bg-(--accent)"
      style={{ width: `${progress * 100}%` }}
    />
  );
}

function AwaitCloseToast() {
  const data = useToastSelector((toast) => toast.data as AwaitCloseToastData);
  const options = useToastSelector(
    (toast) => toast.options as ReactResolvedToastOptions<AwaitCloseToastData>,
  );
  const type = useToastSelector((toast) => toast.type);
  const { dismiss, pauseOnHoverHandlers } =
    useToastActions<AwaitCloseToastData>();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className:
      "wait-for-close-toast pointer-events-auto relative w-full rounded-3xl border border-(--line) bg-(--surface-strong) p-4 pr-12 shadow-[0_18px_36px_rgba(15,23,42,0.12)]",
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
        className="absolute right-3 top-3 text-xs text-(--ink-soft)"
        onClick={() => dismiss("user")}
      >
        Close now
      </button>
    </article>
  );
}

function WaitForClosePreview() {
  const storeRef = useRef<ReactToastStore<AwaitCloseToastData> | null>(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [lastReason, setLastReason] = useState<CloseReason | null>(null);
  const [statusMessage, setStatusMessage] = useState(
    "Start the flow, then either click Close now or let the toast timeout.",
  );

  if (!storeRef.current) {
    storeRef.current = createToast<AwaitCloseToastData>({
      defaults: { duration: 4200, pauseOnHover: true, placement: "top-right" },
    }).toast;
  }

  const toast = storeRef.current;

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
      notes={[
        "handle.closed resolves after the exit animation and removal, not when dismiss() is first requested.",
        "The resolved close reason tells you whether the toast timed out, was dismissed by the user, or was closed programmatically.",
        "Use this for chained notifications, guided steps, and any workflow that should not advance while the toast is still visible.",
      ]}
      files={[
        { filename: "wait-for-close.tsx", language: "tsx", code },
        { filename: "toast.css", language: "css", code: toastCss },
      ]}
      preview={<WaitForClosePreview />}
    />
  );
}

export { WaitForClosePage };
