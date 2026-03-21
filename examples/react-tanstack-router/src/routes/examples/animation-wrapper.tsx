import { useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AnimationWrapper,
  Toaster,
  createToast,
  useToast,
} from "@headless-toast/react";
import type { ReactToastStore } from "@headless-toast/react";
import { ExamplePage } from "../../components/ExamplePage";
import { extractRouteExampleSource } from "../../lib/exampleSource";
import rawSource from "./animation-wrapper.tsx?raw";

export const Route = createFileRoute("/examples/animation-wrapper")({
  component: AnimationWrapperPage,
});

function WrappedToast() {
  const { toast, dismiss, pauseOnHoverHandlers } = useToast<{
    title: string;
    body: string;
  }>();

  return (
    <AnimationWrapper className="pointer-events-auto relative rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 pr-12 shadow-[0_18px_36px_rgba(15,23,42,0.12)]">
      <div {...pauseOnHoverHandlers}>
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
      </div>
    </AnimationWrapper>
  );
}

function AnimationWrapperPreview() {
  const storeRef = useRef<ReactToastStore<{
    title: string;
    body: string;
  }> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createToast<{ title: string; body: string }>({
      defaults: { duration: 4000, pauseOnHover: true },
    }).toast;
  }

  const toast = storeRef.current;

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

const code = extractRouteExampleSource(rawSource);

function AnimationWrapperPage() {
  return (
    <ExamplePage
      category="Rendering"
      title="AnimationWrapper"
      summary="AnimationWrapper is the convenience version of useToastAnimation(). Use it when you only need one animated outer element and want to keep the component body small."
      notes={[
        "You still own all the inner markup and styling.",
        "The wrapper emits the same data attributes as useToastAnimation().",
        "This is a good fit for compact components where a single outer shell is enough.",
      ]}
      files={[{ filename: "animation-wrapper.tsx", language: "tsx", code }]}
      preview={<AnimationWrapperPreview />}
    />
  );
}
