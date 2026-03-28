import {
  AnimationWrapper,
  Toaster,
  createToast,
  useToast,
} from "@headless-toast/react";
import { ExamplePage } from "#/components/ExamplePage";
import { extractExampleSource } from "#/lib/exampleSource";
import rawSource from "./animation-wrapper.tsx?raw";

const toast = createToast<{ title: string; body: string }>({
  defaults: { duration: 4000, pauseOnHover: true },
}).toast;

function WrappedToast() {
  const { toast, dismiss } = useToast<{
    title: string;
    body: string;
  }>();

  return (
    <AnimationWrapper className="origin-top-right transition duration-200 ease-out will-change-[translate,scale,opacity] data-[toast-status=entering]:starting:opacity-0 data-[toast-status=entering]:starting:-translate-y-3 data-[toast-status=entering]:starting:scale-95 data-[toast-status=exiting]:opacity-0 data-[toast-status=exiting]:-translate-y-2 data-[toast-status=exiting]:scale-95 data-[toast-status=exiting]:duration-150 data-[toast-status=exiting]:ease-in [&[data-toast-placement^=bottom]]:origin-bottom-right pointer-events-auto relative rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 pr-12 shadow-xl">
      <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">
        {toast.data.title}
      </p>
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
    </AnimationWrapper>
  );
}

function AnimationWrapperPreview() {
  return (
    <div className="space-y-4">
      <button
        type="button"
        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-indigo-500 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400"
        onClick={() =>
          toast.success({
            title: "Wrapped animation",
            body: "AnimationWrapper handles the outer lifecycle element for you.",
          })
        }
      >
        Show wrapper example
      </button>
      <Toaster store={toast} className="pointer-events-none fixed inset-0 z-50">
        <Toaster.List className="fixed right-4 top-4 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
          <WrappedToast />
        </Toaster.List>
      </Toaster>
    </div>
  );
}

const code = extractExampleSource(rawSource);

function AnimationWrapperPage() {
  return (
    <ExamplePage
      category="Rendering"
      title="AnimationWrapper"
      summary="AnimationWrapper is the convenience version of useToastAnimation(). Use it when you only need one animated outer element and want to keep the component body small."
      files={[{ filename: "animation-wrapper.tsx", language: "tsx", code }]}
      preview={<AnimationWrapperPreview />}
    />
  );
}

export { AnimationWrapperPage };
