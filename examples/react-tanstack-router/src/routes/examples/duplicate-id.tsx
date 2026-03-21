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
import rawSource from "./duplicate-id.tsx?raw";

export const Route = createFileRoute("/examples/duplicate-id")({
  component: DuplicateIdPage,
});

function IdentityToast() {
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
      <p className="mt-3 text-xs font-medium text-[var(--accent-strong)]">
        id: {toast.id}
      </p>
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

function DuplicateIdPreview() {
  const storeRef = useRef<ReactToastStore<{
    title: string;
    body: string;
  }> | null>(null);
  const counterRef = useRef(0);

  if (!storeRef.current) {
    storeRef.current = createToast<{ title: string; body: string }>().toast;
  }

  const toast = storeRef.current;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="doc-button"
          onClick={() => {
            counterRef.current += 1;
            toast.success(
              {
                title: "unique-job",
                body: `Updated ${counterRef.current} time(s) instead of adding duplicates.`,
              },
              { id: "unique-job", duration: 0 },
            );
          }}
        >
          Update unique-job
        </button>
        <button
          type="button"
          className="doc-button doc-button-secondary"
          onClick={() =>
            toast.info({
              title: "Fresh toast",
              body: "This one gets a new id every click.",
            })
          }
        >
          Add regular toast
        </button>
      </div>
      <Toaster
        store={toast}
        className="pointer-events-none fixed inset-0 z-[9999]"
      >
        <Toaster.List className="fixed right-4 top-4 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
          <IdentityToast />
        </Toaster.List>
      </Toaster>
    </div>
  );
}

const code = extractRouteExampleSource(rawSource);

function DuplicateIdPage() {
  return (
    <ExamplePage
      category="State"
      title="Duplicate id updates"
      summary="Give a toast a stable id when it represents one long-running task, one upload slot, or one notification channel that should update in place."
      notes={[
        "Reusing the id updates the existing toast instead of rendering another copy.",
        "This keeps long-running workflows from flooding the viewport with near-identical notifications.",
        "Stable ids pair especially well with promise flows, uploads, and background jobs.",
      ]}
      files={[{ filename: "duplicate-id.tsx", language: "tsx", code }]}
      preview={<DuplicateIdPreview />}
    />
  );
}
