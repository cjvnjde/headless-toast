import {
  Toaster,
  createToast,
  useToast,
  useToastAnimation,
} from "@headless-toast/react";
import { ExamplePage } from "#/components/ExamplePage";
import { extractExampleSource } from "#/lib/exampleSource";
import rawSource from "./promise-lifecycle.tsx?raw";

const toast = createToast<{ title: string; body: string }>({
  defaults: { placement: "top-right", pauseOnHover: true },
}).toast;

function PromiseToast() {
  const { toast, dismiss } = useToast<{
    title: string;
    body: string;
  }>();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className:
      "origin-top-right transition duration-200 ease-out will-change-[translate,scale,opacity] data-[toast-status=entering]:starting:opacity-0 data-[toast-status=entering]:starting:-translate-y-3 data-[toast-status=entering]:starting:scale-95 data-[toast-status=exiting]:opacity-0 data-[toast-status=exiting]:-translate-y-2 data-[toast-status=exiting]:scale-95 data-[toast-status=exiting]:duration-150 data-[toast-status=exiting]:ease-in [&[data-toast-placement^=bottom]]:origin-bottom-right pointer-events-auto relative w-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 pr-12 shadow-xl",
  });

  return (
    <article ref={ref} className={className} {...handlers} {...attributes}>
      <p className="text-xs font-bold tracking-widest uppercase text-indigo-600 dark:text-indigo-300">
        {toast.type}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-slate-50">
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

function PromiseLifecyclePreview() {
  function resolvePromise() {
    const promise = new Promise<string>((resolve) => {
      window.setTimeout(
        () => resolve("Everything finished successfully."),
        1800,
      );
    });

    void toast.promise(promise, {
      loading: {
        title: "Uploading",
        body: "Please wait while files are sent.",
      },
      success: (result) => ({ title: "Upload complete", body: result }),
      error: (error) => ({
        title: "Upload failed",
        body: error instanceof Error ? error.message : "Unknown error",
      }),
    });
  }

  function rejectPromise() {
    const promise = new Promise<string>((_, reject) => {
      window.setTimeout(
        () => reject(new Error("The network request timed out.")),
        1800,
      );
    });

    void toast.promise(promise, {
      loading: {
        title: "Uploading",
        body: "Please wait while files are sent.",
      },
      success: (result) => ({ title: "Upload complete", body: result }),
      error: (error) => ({
        title: "Upload failed",
        body: error instanceof Error ? error.message : "Unknown error",
      }),
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-indigo-500 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          onClick={resolvePromise}
        >
          Promise resolves
        </button>
        <button
          type="button"
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition duration-150 hover:border-slate-300 hover:bg-slate-100 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
          onClick={rejectPromise}
        >
          Promise rejects
        </button>
      </div>
      <Toaster store={toast} className="pointer-events-none fixed inset-0 z-50">
        <Toaster.List className="fixed right-4 top-4 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
          <PromiseToast />
        </Toaster.List>
      </Toaster>
    </div>
  );
}

const code = extractExampleSource(rawSource);

function PromiseLifecyclePage() {
  return (
    <ExamplePage
      category="Fundamentals"
      title="Promise lifecycle"
      summary="Use one toast id for a whole async flow so loading, success, and error states update in place instead of stacking three separate notifications."
      files={[{ filename: "promise-lifecycle.tsx", language: "tsx", code }]}
      preview={<PromiseLifecyclePreview />}
    />
  );
}

export { PromiseLifecyclePage };
