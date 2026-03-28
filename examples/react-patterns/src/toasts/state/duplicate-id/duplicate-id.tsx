import { useRef } from "react";
import {
  Toaster,
  createToast,
  useToast,
  useToastAnimation,
} from "@headless-toast/react";
import { ExamplePage } from "#/components/ExamplePage";
import { extractExampleSource } from "#/lib/exampleSource";
import "./toast.css";
import rawSource from "./duplicate-id.tsx?raw";
import toastCss from "./toast.css?raw";

const toast = createToast<{ title: string; body: string }>().toast;

function IdentityToast() {
  const { toast, dismiss } = useToast<{ title: string; body: string }>();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className:
      "duplicate-id-toast pointer-events-auto relative w-full rounded-3xl border border-(--line) bg-(--surface-strong) p-4 pr-12 shadow-[0_18px_36px_rgba(15,23,42,0.12)]",
  });

  return (
    <article ref={ref} className={className} {...handlers} {...attributes}>
      <p className="text-sm font-semibold text-(--ink)">{toast.data.title}</p>
      <p className="mt-1 text-sm text-(--ink-soft)">{toast.data.body}</p>
      <p className="mt-3 text-xs font-medium text-(--accent-strong)">
        id: {toast.id}
      </p>
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

function DuplicateIdPreview() {
  const counterRef = useRef(0);

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

const code = extractExampleSource(rawSource);

function DuplicateIdPage() {
  return (
    <ExamplePage
      category="State"
      title="Duplicate id updates"
      summary="Give a toast a stable id when it represents one long-running task, one upload slot, or one notification channel that should update in place."
      files={[
        { filename: "duplicate-id.tsx", language: "tsx", code },
        { filename: "toast.css", language: "css", code: toastCss },
      ]}
      preview={<DuplicateIdPreview />}
    />
  );
}

export { DuplicateIdPage };
