import { useRef } from "react";
import {
  Toaster,
  createToast,
  useToast,
  useToastAnimation,
} from "@headless-toast/react";
import type { ReactToastStore } from "@headless-toast/react";
import { ExamplePage } from "#/components/ExamplePage";
import { extractExampleSource } from "#/lib/exampleSource";
import "./toast.css";
import rawSource from "./max-toasts.tsx?raw";
import toastCss from "./toast.css?raw";

function LimitedToast() {
  const { toast, dismiss } = useToast<{ title: string; body: string }>();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className:
      "max-toasts-toast pointer-events-auto relative w-full rounded-3xl border border-(--line) bg-(--surface-strong) p-4 pr-12 shadow-[0_18px_36px_rgba(15,23,42,0.12)]",
  });

  return (
    <article
      ref={ref}
      className={className}
      {...handlers}
      {...attributes}
      data-toast-placement={toast.options.placement ?? "top-right"}
    >
      <p className="text-sm font-semibold text-(--ink)">{toast.data.title}</p>
      <p className="mt-1 text-sm text-(--ink-soft)">{toast.data.body}</p>
      <button
        type="button"
        className="absolute right-3 top-3 text-xs text-(--ink-soft)"
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
      <p className="text-sm leading-7 text-(--ink-soft)">
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

const code = extractExampleSource(rawSource);

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
      files={[
        { filename: "max-toasts.tsx", language: "tsx", code },
        { filename: "toast.css", language: "css", code: toastCss },
      ]}
      preview={<MaxToastsPreview />}
    />
  );
}

export { MaxToastsPage };
