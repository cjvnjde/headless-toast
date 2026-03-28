import {
  Toaster,
  createToast,
  useToast,
  useToastAnimation,
} from "@headless-toast/react";
import { ExamplePage } from "#/components/ExamplePage";
import { extractExampleSource } from "#/lib/exampleSource";
import rawSource from "./multiple-containers.tsx?raw";

const toast = createToast<{ title: string; body: string }>().toast;

function PanelToast() {
  const { toast, dismiss } = useToast<{ title: string; body: string }>();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className:
      "origin-top-right transition duration-200 ease-out will-change-[translate,scale,opacity] data-[toast-status=entering]:starting:opacity-0 data-[toast-status=entering]:starting:-translate-y-3 data-[toast-status=entering]:starting:scale-95 data-[toast-status=exiting]:opacity-0 data-[toast-status=exiting]:-translate-y-2 data-[toast-status=exiting]:scale-95 data-[toast-status=exiting]:duration-150 data-[toast-status=exiting]:ease-in [&[data-toast-placement^=bottom]]:origin-bottom-right pointer-events-auto relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 pr-10 shadow-sm",
  });

  return (
    <article ref={ref} className={className} {...handlers} {...attributes}>
      <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">
        {toast.data.title}
      </p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        {toast.data.body}
      </p>
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

function GlobalToast() {
  const { toast, dismiss } = useToast<{ title: string; body: string }>();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className:
      "origin-top-right transition duration-200 ease-out will-change-[translate,scale,opacity] data-[toast-status=entering]:starting:opacity-0 data-[toast-status=entering]:starting:-translate-y-3 data-[toast-status=entering]:starting:scale-95 data-[toast-status=exiting]:opacity-0 data-[toast-status=exiting]:-translate-y-2 data-[toast-status=exiting]:scale-95 data-[toast-status=exiting]:duration-150 data-[toast-status=exiting]:ease-in [&[data-toast-placement^=bottom]]:origin-bottom-right pointer-events-auto relative rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 pr-12 shadow-xl",
  });

  return (
    <article ref={ref} className={className} {...handlers} {...attributes}>
      <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">
        {toast.data.title}
      </p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        {toast.data.body}
      </p>
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

function MultipleContainersPreview() {
  function add(
    containerId: string,
    tone: "success" | "error" | "warning" | "info",
  ) {
    toast[tone](
      {
        title: tone[0].toUpperCase() + tone.slice(1),
        body: `Scoped to ${containerId}.`,
      },
      { containerId, duration: 3500 },
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        {[
          {
            id: "panel-a",
            title: "Panel A",
            actions: [
              ["success", "Success"],
              ["error", "Error"],
            ] as const,
          },
          {
            id: "panel-b",
            title: "Panel B",
            actions: [
              ["warning", "Warning"],
              ["info", "Info"],
            ] as const,
          },
        ].map((panel) => (
          <section
            key={panel.id}
            className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5"
          >
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
                {panel.title} toast region
              </p>
              <div className="mt-3 min-h-24 space-y-2">
                <Toaster store={toast} containerId={panel.id} inline>
                  <Toaster.List className="flex flex-col gap-2">
                    <PanelToast />
                  </Toaster.List>
                </Toaster>
              </div>
            </div>

            <h3 className="mt-5 text-lg font-semibold text-slate-950 dark:text-slate-50">
              {panel.title}
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Only toasts tagged with {panel.id} render in this local area.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {panel.actions.map(([tone, label]) => (
                <button
                  key={tone}
                  type="button"
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-indigo-500 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                  onClick={() => add(panel.id, tone)}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      <button
        type="button"
        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition duration-150 hover:border-slate-300 hover:bg-slate-100 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
        onClick={() =>
          toast.info({
            title: "Global toast",
            body: "No containerId means the viewport renderer handles it.",
          })
        }
      >
        Trigger global toast
      </button>

      <Toaster store={toast} className="pointer-events-none fixed inset-0 z-50">
        <Toaster.List className="fixed right-4 top-4 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
          <GlobalToast />
        </Toaster.List>
      </Toaster>
    </div>
  );
}

const code = extractExampleSource(rawSource);

function MultipleContainersPage() {
  return (
    <ExamplePage
      category="Inline"
      title="Multiple containers"
      summary="One store can feed several inline regions by using different containerId values, which keeps notification streams local to the UI that owns them."
      files={[{ filename: "multiple-containers.tsx", language: "tsx", code }]}
      preview={<MultipleContainersPreview />}
    />
  );
}

export { MultipleContainersPage };
