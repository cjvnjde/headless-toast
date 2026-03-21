import { useRef } from "react";
import {
  Toaster,
  createToast,
  useToast,
  useToastAnimation,
} from "@headless-toast/react";
import type { ReactToastStore, ToastPlacement } from "@headless-toast/react";
import { ExamplePage } from "#/components/ExamplePage";
import { extractExampleSource } from "#/lib/exampleSource";
import "./toast.css";
import rawSource from "./placements.tsx?raw";
import toastCss from "./toast.css?raw";

const placements = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
] as const satisfies ToastPlacement[];

function PlacementToast() {
  const { toast, dismiss } = useToast<{ title: string; body: string }>();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className:
      "placements-toast pointer-events-auto relative w-full rounded-3xl border border-(--line) bg-(--surface-strong) p-4 pr-12 text-(--ink) shadow-[0_18px_36px_rgba(15,23,42,0.12)]",
  });

  return (
    <article
      ref={ref}
      className={className}
      {...handlers}
      {...attributes}
      data-toast-placement={toast.options.placement ?? "top-right"}
    >
      <p className="text-xs font-bold tracking-[0.18em] uppercase text-(--accent-strong)">
        {toast.options.placement}
      </p>
      <p className="mt-2 text-sm font-semibold">{toast.data.title}</p>
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

function PlacementsPreview() {
  const storeRef = useRef<ReactToastStore<{
    title: string;
    body: string;
  }> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createToast<{ title: string; body: string }>({
      defaults: { duration: 4000 },
    }).toast;
  }

  const toast = storeRef.current;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {placements.map((placement) => (
          <button
            key={placement}
            type="button"
            className="rounded-2xl border border-(--line) bg-(--chip-bg) px-4 py-3 text-left text-sm font-semibold text-(--ink) hover:-translate-y-0.5"
            onClick={() =>
              toast.info(
                {
                  title: placement,
                  body: `This toast is rendered at ${placement}.`,
                },
                { placement },
              )
            }
          >
            {placement}
          </button>
        ))}
      </div>
      <Toaster
        store={toast}
        className="pointer-events-none fixed inset-0 z-[9999]"
      >
        <Toaster.List className="fixed flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3 p-4 data-[placement=top-left]:left-0 data-[placement=top-left]:top-0 data-[placement=top-center]:left-1/2 data-[placement=top-center]:top-0 data-[placement=top-center]:-translate-x-1/2 data-[placement=top-right]:right-0 data-[placement=top-right]:top-0 data-[placement=bottom-left]:bottom-0 data-[placement=bottom-left]:left-0 data-[placement=bottom-center]:bottom-0 data-[placement=bottom-center]:left-1/2 data-[placement=bottom-center]:-translate-x-1/2 data-[placement=bottom-right]:bottom-0 data-[placement=bottom-right]:right-0">
          <PlacementToast />
        </Toaster.List>
      </Toaster>
    </div>
  );
}

const code = extractExampleSource(rawSource);

function PlacementsPage() {
  return (
    <ExamplePage
      category="Fundamentals"
      title="Placements"
      summary="Change placement at call time and keep the toast item itself completely unchanged. Placement affects only where the list is rendered."
      notes={[
        "Placement belongs to the toast options, not to the toast component.",
        "One toast design can be reused across every supported viewport edge.",
        "This pattern is great when product areas need different toast destinations without forking UI code.",
      ]}
      files={[
        { filename: "placements.tsx", language: "tsx", code },
        { filename: "toast.css", language: "css", code: toastCss },
      ]}
      preview={<PlacementsPreview />}
    />
  );
}

export { PlacementsPage };
