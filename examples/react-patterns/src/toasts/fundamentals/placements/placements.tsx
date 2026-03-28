import {
  Toaster,
  createToast,
  useToast,
  useToastAnimation,
} from "@headless-toast/react";
import type { ToastPlacement } from "@headless-toast/react";
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

const toast = createToast<{ title: string; body: string }>({
  defaults: { duration: 4000 },
}).toast;

function PlacementToast() {
  const { toast, dismiss } = useToast<{ title: string; body: string }>();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className:
      "placements-toast pointer-events-auto relative w-full rounded-3xl border border-(--line) bg-(--surface-strong) p-4 pr-12 text-(--ink) shadow-[0_18px_36px_rgba(15,23,42,0.12)]",
  });

  return (
    <article ref={ref} className={className} {...handlers} {...attributes}>
      <p className="text-xs font-bold tracking-[0.18em] uppercase text-(--accent-strong)">
        {toast.options.placement}
      </p>
      <p className="mt-2 text-sm font-semibold">{toast.data.title}</p>
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

function PlacementsPreview() {
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
      files={[
        { filename: "placements.tsx", language: "tsx", code },
        { filename: "toast.css", language: "css", code: toastCss },
      ]}
      preview={<PlacementsPreview />}
    />
  );
}

export { PlacementsPage };
