import { useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Toaster,
  createToast,
  useToast,
  useToastAnimation,
} from "@headless-toast/react";
import type { ReactToastStore } from "@headless-toast/react";
import { ExamplePage } from "../../components/ExamplePage";
import { extractRouteExampleSource } from "../../lib/exampleSource";
import rawSource from "./max-toasts.tsx?raw";

export const Route = createFileRoute("/examples/max-toasts")({
  component: MaxToastsPage,
});

function LimitedToast() {
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

function MaxToastsPreview() {
  const storeRef = useRef<ReactToastStore<{
    title: string;
    body: string;
  }> | null>(null);
  const countRef = useRef(0);

  if (!storeRef.current) {
    storeRef.current = createToast<{ title: string; body: string }>({
      maxToasts: 3,
    }).toast;
  }

  const toast = storeRef.current;
  const types = ["success", "error", "warning", "info"] as const;

  function addOne() {
    countRef.current += 1;
    const type = types[countRef.current % types.length];
    toast[type](
      {
        title: `Toast #${countRef.current}`,
        body: "Only three visible toasts are allowed.",
      },
      { duration: 0 },
    );
  }

  function burst() {
    for (let index = 0; index < 6; index += 1) {
      addOne();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button type="button" className="doc-button" onClick={addOne}>
          Add toast
        </button>
        <button
          type="button"
          className="doc-button doc-button-secondary"
          onClick={burst}
        >
          Add 6 rapidly
        </button>
      </div>
      <p className="text-sm leading-7 text-[var(--ink-soft)]">
        When the fourth toast arrives, the oldest visible toast exits first.
      </p>
      <Toaster
        store={toast}
        className="pointer-events-none fixed inset-0 z-[9999]"
      >
        <Toaster.List className="fixed right-4 top-4 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
          <LimitedToast />
        </Toaster.List>
      </Toaster>
    </div>
  );
}

const code = extractRouteExampleSource(rawSource);

function MaxToastsPage() {
  return (
    <ExamplePage
      category="State"
      title="Max toasts"
      summary="Cap visible notifications when a surface should never grow into an unreadable wall of messages, even during bursty event streams."
      notes={[
        "maxToasts is configured at store creation time.",
        "Rapid-fire events stay bounded because the oldest visible toast exits before the next one enters.",
        "This page also doubles as a small stress test for your custom toast renderer.",
      ]}
      files={[{ filename: "max-toasts.tsx", language: "tsx", code }]}
      preview={<MaxToastsPreview />}
    />
  );
}
