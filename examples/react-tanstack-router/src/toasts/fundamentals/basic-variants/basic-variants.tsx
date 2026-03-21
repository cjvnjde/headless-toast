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
import rawSource from "./basic-variants.tsx?raw";
import toastCss from "./toast.css?raw";

function VariantToast() {
  const { toast, dismiss, pauseOnHoverHandlers } = useToast<{
    title: string;
    body: string;
  }>();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className:
      "basic-variants-toast pointer-events-auto relative w-full rounded-3xl border border-white/60 bg-white/95 p-4 pr-12 shadow-[0_20px_40px_rgba(15,23,42,0.12)] backdrop-blur dark:border-white/10 dark:bg-slate-950/90",
  });

  const tone =
    toast.type === "success"
      ? "border-emerald-400/70"
      : toast.type === "error"
        ? "border-rose-400/70"
        : toast.type === "warning"
          ? "border-amber-400/70"
          : toast.type === "loading"
            ? "border-violet-400/70"
            : "border-sky-400/70";

  return (
    <article
      ref={ref}
      className={`${className} ${tone}`}
      {...handlers}
      {...pauseOnHoverHandlers}
      {...attributes}
      data-toast-placement={toast.options.placement ?? "top-right"}
    >
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        {toast.data.title}
      </p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        {toast.data.body}
      </p>
      <button
        type="button"
        className="absolute right-3 top-3 rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-300"
        onClick={() => dismiss("user")}
      >
        Close
      </button>
    </article>
  );
}

function BasicVariantsPreview() {
  const storeRef = useRef<ReactToastStore<{
    title: string;
    body: string;
  }> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createToast<{ title: string; body: string }>({
      defaults: { duration: 4500, pauseOnHover: true, placement: "top-right" },
    }).toast;
  }

  const toast = storeRef.current;
  const buttonClass =
    "rounded-full border border-(--line) bg-(--chip-bg) px-4 py-2 text-sm font-semibold text-(--ink) hover:-translate-y-0.5";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className={buttonClass}
          onClick={() =>
            toast.success({
              title: "Saved",
              body: "Changes were written to disk.",
            })
          }
        >
          Success
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={() =>
            toast.error({
              title: "Upload failed",
              body: "The request returned a 500 error.",
            })
          }
        >
          Error
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={() =>
            toast.warning({
              title: "Storage almost full",
              body: "Only 8% free space remains.",
            })
          }
        >
          Warning
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={() =>
            toast.info({
              title: "Background sync",
              body: "A refresh is already running.",
            })
          }
        >
          Info
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={() =>
            toast.loading({
              title: "Deploying",
              body: "A release is being published right now.",
            })
          }
        >
          Loading
        </button>
      </div>
      <Toaster
        store={toast}
        className="pointer-events-none fixed inset-0 z-[9999]"
      >
        <Toaster.List className="fixed right-4 top-4 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
          <VariantToast />
        </Toaster.List>
      </Toaster>
    </div>
  );
}

const code = extractExampleSource(rawSource);

function BasicVariantsPage() {
  return (
    <ExamplePage
      category="Fundamentals"
      title="Basic variants"
      summary="Use one toast item component for the built-in type helpers and branch on currentToast.type only where the UI needs to change."
      notes={[
        "A single renderer can style success, error, warning, info, and loading states.",
        "The store API stays tiny: call toast.success(), toast.error(), and the rest of the lifecycle works the same.",
        "This is the best starting point when you want a minimal, reusable toast component.",
      ]}
      files={[
        { filename: "basic-variants.tsx", language: "tsx", code },
        { filename: "toast.css", language: "css", code: toastCss },
      ]}
      preview={<BasicVariantsPreview />}
    />
  );
}

export { BasicVariantsPage };
