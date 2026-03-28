import { tv } from "tailwind-variants";
import {
  Toaster,
  createToast,
  useToast,
  useToastAnimation,
} from "@headless-toast/react";
import { ExamplePage } from "#/components/ExamplePage";
import { extractExampleSource } from "#/lib/exampleSource";
import rawSource from "./persistent-toast.tsx?raw";

const toast = createToast<{ title: string; body: string }>({
  defaults: { placement: "top-right" },
}).toast;

const persistentToastCard = tv({
  variants: {
    tone: {
      success:
        "border border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-400/30 dark:bg-emerald-950 dark:text-emerald-50",
      error:
        "border border-rose-200 bg-rose-50 text-rose-950 dark:border-rose-400/30 dark:bg-rose-950 dark:text-rose-50",
      warning:
        "border border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-300/30 dark:bg-amber-950 dark:text-amber-50",
      info: "border border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-400/30 dark:bg-sky-950 dark:text-sky-50",
      loading:
        "border border-violet-200 bg-violet-50 text-violet-950 dark:border-violet-400/30 dark:bg-violet-950 dark:text-violet-50",
      custom:
        "border border-slate-200 bg-white text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50",
    },
  },
  defaultVariants: {
    tone: "warning",
  },
});

function PersistentToast() {
  const { toast, dismiss } = useToast<{ title: string; body: string }>();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className:
      "origin-top-right transition duration-200 ease-out will-change-[translate,scale,opacity] data-[toast-status=entering]:starting:opacity-0 data-[toast-status=entering]:starting:-translate-y-3 data-[toast-status=entering]:starting:scale-95 data-[toast-status=exiting]:opacity-0 data-[toast-status=exiting]:-translate-y-2 data-[toast-status=exiting]:scale-95 data-[toast-status=exiting]:duration-150 data-[toast-status=exiting]:ease-in [&[data-toast-placement^=bottom]]:origin-bottom-right pointer-events-auto relative w-full rounded-3xl p-4 pr-12 shadow-xl",
  });

  return (
    <article
      ref={ref}
      className={persistentToastCard({ tone: toast.type, className })}
      {...handlers}
      {...attributes}
    >
      <p className="text-sm font-semibold">{toast.data.title}</p>
      <p className="mt-1 text-sm opacity-80">{toast.data.body}</p>
      {toast.options.dismissible !== false ? (
        <button
          type="button"
          aria-label="Close toast"
          className="absolute right-3 top-3 inline-flex cursor-pointer h-8 w-8 items-center justify-center rounded-full border border-current/20 text-current transition duration-150 hover:bg-black/5 hover:shadow-sm dark:hover:bg-white/10"
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
      ) : null}
    </article>
  );
}

function PersistentToastPreview() {
  const id = "sync-warning";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-indigo-500 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          onClick={() =>
            toast.warning(
              {
                title: "Manual action required",
                body: "This toast stays visible until you resolve the problem.",
              },
              { id, dismissible: false, duration: 0 },
            )
          }
        >
          Show persistent toast
        </button>
        <button
          type="button"
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition duration-150 hover:border-slate-300 hover:bg-slate-100 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
          onClick={() =>
            toast.success(
              {
                title: "Issue resolved",
                body: "The same toast id was updated and can now auto-close.",
              },
              { id, dismissible: true, duration: 3200 },
            )
          }
        >
          Resolve it
        </button>
      </div>
      <Toaster store={toast} className="pointer-events-none fixed inset-0 z-50">
        <Toaster.List className="fixed right-4 top-4 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
          <PersistentToast />
        </Toaster.List>
      </Toaster>
    </div>
  );
}

const code = extractExampleSource(rawSource);

function PersistentToastPage() {
  return (
    <ExamplePage
      category="Fundamentals"
      title="Persistent toast"
      summary="Turn off the close affordance and set duration to 0 when the notification represents a state that should stay on screen until your app explicitly changes it."
      files={[{ filename: "persistent-toast.tsx", language: "tsx", code }]}
      preview={<PersistentToastPreview />}
    />
  );
}

export { PersistentToastPage };
