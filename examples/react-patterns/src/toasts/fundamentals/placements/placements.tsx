import {
  Toaster,
  createToast,
  useToast,
  useToastAnimation,
} from "@headless-toast/react";
import type { ToastPlacement } from "@headless-toast/react";
import { ExamplePage } from "#/components/ExamplePage";
import { extractExampleSource } from "#/lib/exampleSource";
import rawSource from "./placements.tsx?raw";

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
      "origin-top-right transition duration-200 ease-out will-change-[translate,scale,opacity] data-[toast-status=entering]:starting:opacity-0 data-[toast-status=entering]:starting:-translate-y-3 data-[toast-status=entering]:starting:scale-95 data-[toast-status=exiting]:opacity-0 data-[toast-status=exiting]:-translate-y-2 data-[toast-status=exiting]:scale-95 data-[toast-status=exiting]:duration-150 data-[toast-status=exiting]:ease-in [&[data-toast-placement^=bottom]]:origin-bottom-right pointer-events-auto relative w-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 pr-12 text-slate-950 dark:text-slate-50 shadow-xl",
  });

  return (
    <article ref={ref} className={className} {...handlers} {...attributes}>
      <p className="text-xs font-bold tracking-widest uppercase text-indigo-600 dark:text-indigo-300">
        {toast.options.placement}
      </p>
      <p className="mt-2 text-sm font-semibold">{toast.data.title}</p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        {toast.data.body}
      </p>
      <button
        type="button"
        aria-label="Close toast"
        className="absolute right-3 top-3 inline-flex cursor-pointer h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition duration-150 hover:bg-slate-100 hover:shadow-sm dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
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
            className="cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-950 shadow-sm transition duration-150 hover:border-slate-300 hover:bg-slate-100 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50 dark:hover:border-slate-700 dark:hover:bg-slate-800 "
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
      <Toaster store={toast} className="pointer-events-none fixed inset-0 z-50">
        <Toaster.List className="fixed flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 p-4 data-[placement=top-left]:left-0 data-[placement=top-left]:top-0 data-[placement=top-center]:left-1/2 data-[placement=top-center]:top-0 data-[placement=top-center]:-translate-x-1/2 data-[placement=top-right]:right-0 data-[placement=top-right]:top-0 data-[placement=bottom-left]:bottom-0 data-[placement=bottom-left]:left-0 data-[placement=bottom-center]:bottom-0 data-[placement=bottom-center]:left-1/2 data-[placement=bottom-center]:-translate-x-1/2 data-[placement=bottom-right]:bottom-0 data-[placement=bottom-right]:right-0">
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
      files={[{ filename: "placements.tsx", language: "tsx", code }]}
      preview={<PlacementsPreview />}
    />
  );
}

export { PlacementsPage };
