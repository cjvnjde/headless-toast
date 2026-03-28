import { useRef, type ReactNode } from "react";
import {
  Toaster,
  createToast,
  useProgress,
  useToast,
  useToastAnimation,
} from "@headless-toast/react";
import { ExamplePage } from "#/components/ExamplePage";
import { extractExampleSource } from "#/lib/exampleSource";
import rawSource from "./pause-on-hover.tsx?raw";

type HoverToastData = { title: string };

/* ── stores ─────────────────────────────────────────────── */

const allStore = createToast<HoverToastData>({
  defaults: { duration: 6000, progress: true, pauseOnHover: true },
}).toast;

const individualStore = createToast<HoverToastData>({
  defaults: { duration: 6000, progress: true, pauseOnHover: "individual" },
}).toast;

/* ── shared toast component ─────────────────────────────── */

function ProgressBar() {
  const progress = useProgress();

  return (
    <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
      <div
        className="h-full rounded-full bg-indigo-500 transition-none dark:bg-indigo-400"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}

function HoverToast() {
  const { toast, dismiss } = useToast<HoverToastData>();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className:
      "transition duration-200 ease-out data-[toast-status=entering]:starting:opacity-0 data-[toast-status=entering]:starting:scale-95 data-[toast-status=exiting]:opacity-0 data-[toast-status=exiting]:scale-95 data-[toast-status=exiting]:duration-150 data-[toast-status=exiting]:ease-in pointer-events-auto relative w-full rounded-2xl border border-slate-200 bg-white p-3.5 pr-10 shadow-lg dark:border-slate-800 dark:bg-slate-900",
  });

  return (
    <article ref={ref} className={className} {...handlers} {...attributes}>
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-slate-950 dark:text-slate-50">
          {toast.data.title}
        </p>
        {toast.paused && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
            paused
          </span>
        )}
      </div>
      <ProgressBar />
      <button
        type="button"
        aria-label="Close toast"
        className="absolute right-2.5 top-2.5 inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
        onClick={() => dismiss("user")}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="h-3 w-3"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M4 4l8 8" />
          <path d="M12 4 4 12" />
        </svg>
      </button>
    </article>
  );
}

/* ── panel wrapper ──────────────────────────────────────── */

function ModePanel({
  title,
  badge,
  badgeColor,
  description,
  onAdd,
  children,
}: {
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  onAdd: () => void;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-slate-950 dark:text-slate-50">
            {title}
          </h3>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}
          >
            {badge}
          </span>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
      <button
        type="button"
        className="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400"
        onClick={onAdd}
      >
        Add toast
      </button>
      {children}
    </div>
  );
}

/* ── preview ────────────────────────────────────────────── */

function PauseOnHoverPreview() {
  const allSeq = useRef(0);
  const individualSeq = useRef(0);

  return (
    <div className="space-y-4">
      <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
        Spawn a few toasts in each column, then hover to compare. Watch the
        progress bars and "paused" badges. The 24 px gap between toasts makes
        the difference easy to spot.
      </p>

      <div className="grid gap-5 md:grid-cols-2">
        {/* ── All ───────────────────────────────────────── */}
        <ModePanel
          title="All"
          badge="pauseOnHover: true"
          badgeColor="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
          description="Hovering anywhere inside the toast list — including the gaps between toasts — pauses every toast at once."
          onAdd={() =>
            allStore.info({
              title: `Notification ${++allSeq.current}`,
            })
          }
        >
          <Toaster store={allStore} inline>
            <Toaster.List className="flex min-h-16 flex-col gap-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-3 dark:border-slate-700 dark:bg-slate-950/40">
              <HoverToast />
            </Toaster.List>
          </Toaster>
        </ModePanel>

        {/* ── Individual ────────────────────────────────── */}
        <ModePanel
          title="Individual"
          badge='pauseOnHover: "individual"'
          badgeColor="bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
          description="Only the toast directly under the cursor pauses; the rest keep counting down."
          onAdd={() =>
            individualStore.info({
              title: `Notification ${++individualSeq.current}`,
            })
          }
        >
          <Toaster store={individualStore} inline>
            <Toaster.List className="flex min-h-16 flex-col gap-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-3 dark:border-slate-700 dark:bg-slate-950/40">
              <HoverToast />
            </Toaster.List>
          </Toaster>
        </ModePanel>
      </div>
    </div>
  );
}

const code = extractExampleSource(rawSource);

function PauseOnHoverPage() {
  return (
    <ExamplePage
      category="Fundamentals"
      title="Pause on hover"
      summary="Two ways to freeze toast countdowns on hover: pause everything when the list is hovered, or pause only the toast under the cursor."
      files={[{ filename: "pause-on-hover.tsx", language: "tsx", code }]}
      preview={<PauseOnHoverPreview />}
    />
  );
}

export { PauseOnHoverPage };
