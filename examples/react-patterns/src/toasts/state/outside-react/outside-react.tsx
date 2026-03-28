import {
  Toaster,
  createToast,
  useToast,
  useToastAnimation,
} from "@headless-toast/react";
import { ExamplePage } from "#/components/ExamplePage";
import { extractExampleSource } from "#/lib/exampleSource";
import "./toast.css";
import rawSource from "./outside-react.tsx?raw";
import toastCss from "./toast.css?raw";

const externalToastStore = createToast<{ title: string; body: string }>({
  defaults: { placement: "top-right", duration: 4200 },
}).toast;

function triggerExternalSuccess() {
  externalToastStore.success({
    title: "Service layer",
    body: "This toast was triggered by a plain function outside React.",
  });
}

function simulateApiInterceptor() {
  window.setTimeout(() => {
    externalToastStore.error({
      title: "API error",
      body: "The server returned 500 from an interceptor callback.",
    });
  }, 500);
}

function OutsideToast() {
  const { toast, dismiss } = useToast<{ title: string; body: string }>();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className:
      "outside-react-toast pointer-events-auto relative w-full rounded-3xl border border-(--line) bg-(--surface-strong) p-4 pr-12 shadow-[0_18px_36px_rgba(15,23,42,0.12)]",
  });

  return (
    <article ref={ref} className={className} {...handlers} {...attributes}>
      <p className="text-sm font-semibold text-(--ink)">{toast.data.title}</p>
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

function OutsideReactPreview() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="doc-button"
          onClick={triggerExternalSuccess}
        >
          Trigger external call
        </button>
        <button
          type="button"
          className="doc-button doc-button-secondary"
          onClick={simulateApiInterceptor}
        >
          Simulate interceptor error
        </button>
      </div>
      <Toaster
        store={externalToastStore}
        className="pointer-events-none fixed inset-0 z-[9999]"
      >
        <Toaster.List className="fixed right-4 top-4 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
          <OutsideToast />
        </Toaster.List>
      </Toaster>
    </div>
  );
}

const code = extractExampleSource(rawSource);

function OutsideReactPage() {
  return (
    <ExamplePage
      category="State"
      title="Outside React"
      summary="The store is plain JavaScript, so you can keep it in a module or service layer and trigger toasts from interceptors, workers, or utility functions."
      files={[
        { filename: "outside-react.tsx", language: "tsx", code },
        { filename: "toast.css", language: "css", code: toastCss },
      ]}
      preview={<OutsideReactPreview />}
    />
  );
}

export { OutsideReactPage };
