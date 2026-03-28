import {
  Toaster,
  createToast,
  useToast,
  useToastAnimation,
} from "@headless-toast/react";
import { ExamplePage } from "#/components/ExamplePage";
import { extractExampleSource } from "#/lib/exampleSource";
import "./toast.css";
import rawSource from "./promise-lifecycle.tsx?raw";
import toastCss from "./toast.css?raw";

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
      "promise-lifecycle-toast pointer-events-auto relative w-full rounded-3xl border border-(--line) bg-(--surface-strong) p-4 pr-12 shadow-[0_18px_36px_rgba(15,23,42,0.12)]",
  });

  return (
    <article ref={ref} className={className} {...handlers} {...attributes}>
      <p className="text-xs font-bold tracking-[0.18em] uppercase text-(--accent-strong)">
        {toast.type}
      </p>
      <p className="mt-2 text-sm font-semibold text-(--ink)">
        {toast.data.title}
      </p>
      <p className="mt-1 text-sm text-(--ink-soft)">{toast.data.body}</p>
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
        <button type="button" className="doc-button" onClick={resolvePromise}>
          Promise resolves
        </button>
        <button
          type="button"
          className="doc-button doc-button-secondary"
          onClick={rejectPromise}
        >
          Promise rejects
        </button>
      </div>
      <Toaster
        store={toast}
        className="pointer-events-none fixed inset-0 z-[9999]"
      >
        <Toaster.List className="fixed right-4 top-4 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
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
      files={[
        { filename: "promise-lifecycle.tsx", language: "tsx", code },
        { filename: "toast.css", language: "css", code: toastCss },
      ]}
      preview={<PromiseLifecyclePreview />}
    />
  );
}

export { PromiseLifecyclePage };
