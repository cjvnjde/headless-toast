import {
  AnimationWrapper,
  Toaster,
  createToast,
  useToast,
} from "@headless-toast/react";
import { ExamplePage } from "#/components/ExamplePage";
import { extractExampleSource } from "#/lib/exampleSource";
import "./toast.css";
import rawSource from "./animation-wrapper.tsx?raw";
import toastCss from "./toast.css?raw";

const toast = createToast<{ title: string; body: string }>({
  defaults: { duration: 4000, pauseOnHover: true },
}).toast;

function WrappedToast() {
  const { toast, dismiss } = useToast<{
    title: string;
    body: string;
  }>();

  return (
    <AnimationWrapper className="animation-wrapper-toast pointer-events-auto relative rounded-3xl border border-(--line) bg-(--surface-strong) p-4 pr-12 shadow-[0_18px_36px_rgba(15,23,42,0.12)]">
      <p className="text-sm font-semibold text-(--ink)">{toast.data.title}</p>
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
    </AnimationWrapper>
  );
}

function AnimationWrapperPreview() {
  return (
    <div className="space-y-4">
      <button
        type="button"
        className="doc-button"
        onClick={() =>
          toast.success({
            title: "Wrapped animation",
            body: "AnimationWrapper handles the outer lifecycle element for you.",
          })
        }
      >
        Show wrapper example
      </button>
      <Toaster
        store={toast}
        className="pointer-events-none fixed inset-0 z-[9999]"
      >
        <Toaster.List className="fixed right-4 top-4 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
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
      files={[
        { filename: "animation-wrapper.tsx", language: "tsx", code },
        { filename: "toast.css", language: "css", code: toastCss },
      ]}
      preview={<AnimationWrapperPreview />}
    />
  );
}

export { AnimationWrapperPage };
