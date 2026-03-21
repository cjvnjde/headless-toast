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
import rawSource from "./custom-component.tsx?raw";

export const Route = createFileRoute("/examples/custom-component")({
  component: CustomComponentPage,
});

function FancyToast() {
  const { toast, dismiss, pauseOnHoverHandlers } = useToast<{
    title: string;
    body: string;
  }>();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className:
      "pointer-events-auto relative grid w-full grid-cols-[auto_1fr_auto] items-start gap-4 rounded-[1.75rem] border border-[var(--line)] bg-[radial-gradient(circle_at_top_left,rgba(101,216,206,0.18),transparent_40%),var(--surface-strong)] p-4 shadow-[0_18px_36px_rgba(15,23,42,0.14)]",
  });

  const icon =
    toast.type === "success" ? "✓" : toast.type === "error" ? "!" : "i";

  return (
    <article
      ref={ref}
      className={className}
      {...handlers}
      {...pauseOnHoverHandlers}
      {...attributes}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent)]/15 text-lg font-bold text-[var(--accent-strong)]">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-[var(--ink)]">
          {toast.data.title}
        </p>
        <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">
          {toast.data.body}
        </p>
      </div>
      <button
        type="button"
        className="rounded-full border border-[var(--line)] px-2 py-1 text-xs text-[var(--ink-soft)]"
        onClick={() => dismiss("user")}
      >
        Close
      </button>
    </article>
  );
}

function CustomComponentPreview() {
  const storeRef = useRef<ReactToastStore<{
    title: string;
    body: string;
  }> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createToast<{ title: string; body: string }>({
      defaults: { duration: 4200, pauseOnHover: true },
    }).toast;
  }

  const toast = storeRef.current;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="doc-button"
          onClick={() =>
            toast.success({
              title: "Custom render",
              body: "This toast uses fully custom markup and styling.",
            })
          }
        >
          Success
        </button>
        <button
          type="button"
          className="doc-button doc-button-secondary"
          onClick={() =>
            toast.error({
              title: "Different tone",
              body: "The same component can still branch on type.",
            })
          }
        >
          Error
        </button>
      </div>
      <Toaster
        store={toast}
        className="pointer-events-none fixed inset-0 z-[9999]"
      >
        <Toaster.List className="fixed right-4 top-4 flex w-[min(26rem,calc(100vw-2rem))] flex-col gap-3">
          <FancyToast />
        </Toaster.List>
      </Toaster>
    </div>
  );
}

const code = extractRouteExampleSource(rawSource);

function CustomComponentPage() {
  return (
    <ExamplePage
      category="Rendering"
      title="Custom component"
      summary="The toast state machine is headless, so you can replace the entire toast item with your own branded layout while keeping the same store and lifecycle hooks."
      notes={[
        "useToast() gives you the current toast, actions, and option state for whichever toast is being rendered.",
        "useToastAnimation() wires the CSS lifecycle without imposing markup on you.",
        "This is the right pattern when you want your own design system component instead of a library-owned look.",
      ]}
      files={[{ filename: "custom-component.tsx", language: "tsx", code }]}
      preview={<CustomComponentPreview />}
    />
  );
}
