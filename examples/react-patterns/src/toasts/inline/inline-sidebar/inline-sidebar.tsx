import { useState } from "react";
import {
  Toaster,
  createToast,
  useToast,
  useToastAnimation,
} from "@headless-toast/react";
import { ExamplePage } from "#/components/ExamplePage";
import { extractExampleSource } from "#/lib/exampleSource";
import rawSource from "./inline-sidebar.tsx?raw";

const toast = createToast<{ title: string; body: string }>().toast;

function SidebarToast() {
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

function InlineSidebarPreview() {
  const [projectName, setProjectName] = useState("Headless Toast");

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_24rem]">
      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50">
          Main workspace
        </h3>
        <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
          Trigger a regular viewport toast from the main area or save settings
          in the sidebar to keep feedback local to that panel.
        </p>
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 p-4 text-sm text-slate-600 dark:text-slate-300">
          This area represents the rest of the page. The sidebar on the right
          owns its own inline toast region.
        </div>
        <button
          type="button"
          className="mt-5 inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-indigo-500 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          onClick={() =>
            toast.info({
              title: "Global notice",
              body: "This toast is not scoped to the sidebar container.",
            })
          }
        >
          Show global toast
        </button>
      </section>

      <aside className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 p-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
            Sidebar toast region
          </p>
          <div className="mt-3 min-h-24 space-y-2">
            <Toaster store={toast} containerId="sidebar" inline>
              <Toaster.List className="flex flex-col gap-2">
                <SidebarToast />
              </Toaster.List>
            </Toaster>
          </div>
        </div>

        <h3 className="mt-5 text-lg font-semibold text-slate-950 dark:text-slate-50">
          Settings
        </h3>
        <label className="mt-4 block text-sm text-slate-600 dark:text-slate-300">
          Project name
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 text-slate-950 dark:text-slate-50 outline-none"
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
          />
        </label>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-indigo-500 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            onClick={() =>
              toast.success(
                { title: "Saved", body: `${projectName} was saved.` },
                { containerId: "sidebar", duration: 3000 },
              )
            }
          >
            Save
          </button>
          <button
            type="button"
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition duration-150 hover:border-slate-300 hover:bg-slate-100 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
            onClick={() =>
              toast.error(
                {
                  title: "Save failed",
                  body: "Sidebar-specific feedback stays local.",
                },
                { containerId: "sidebar", duration: 4000 },
              )
            }
          >
            Simulate error
          </button>
        </div>
      </aside>

      <Toaster store={toast} className="pointer-events-none fixed inset-0 z-50">
        <Toaster.List className="fixed right-4 top-4 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
          <GlobalToast />
        </Toaster.List>
      </Toaster>
    </div>
  );
}

const code = extractExampleSource(rawSource);

function InlineSidebarPage() {
  return (
    <ExamplePage
      category="Inline"
      title="Inline sidebar"
      summary="Use containerId plus inline rendering when a local surface should own its own feedback while the rest of the app continues to use global viewport toasts."
      files={[{ filename: "inline-sidebar.tsx", language: "tsx", code }]}
      preview={<InlineSidebarPreview />}
    />
  );
}

export { InlineSidebarPage };
