import { createFileRoute } from "@tanstack/react-router";
import {
  Toaster,
  createToast,
  useToast,
  useToastAnimation,
} from "@headless-toast/react";
import { ExamplePage } from "../../components/ExamplePage";
import { extractRouteExampleSource } from "../../lib/exampleSource";
import rawSource from "./outside-react.tsx?raw";

export const Route = createFileRoute("/examples/outside-react")({
  component: OutsideReactPage,
});

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
      "pointer-events-auto relative w-full rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 pr-12 shadow-[0_18px_36px_rgba(15,23,42,0.12)]",
  });

  return (
    <article ref={ref} className={className} {...handlers} {...attributes}>
      <p className="text-sm font-semibold text-[var(--ink)]">
        {toast.data.title}
      </p>
      <p className="mt-1 text-sm text-[var(--ink-soft)]">{toast.data.body}</p>
      <button
        type="button"
        className="absolute right-3 top-3 text-xs text-[var(--ink-soft)]"
        onClick={() => dismiss("user")}
      >
        Close
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

const code = extractRouteExampleSource(rawSource);

function OutsideReactPage() {
  return (
    <ExamplePage
      category="State"
      title="Outside React"
      summary="The store is plain JavaScript, so you can keep it in a module or service layer and trigger toasts from interceptors, workers, or utility functions."
      notes={[
        "Only the renderer needs React. Triggering a toast does not.",
        "This keeps toast orchestration close to the code that knows what happened.",
        "A shared notifications module is useful for API clients, auth flows, and background tasks.",
      ]}
      files={[{ filename: "outside-react.tsx", language: "tsx", code }]}
      preview={<OutsideReactPreview />}
    />
  );
}
