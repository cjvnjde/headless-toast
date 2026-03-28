import {
  Toaster,
  createToast,
  useToast,
  useToastAnimation,
} from "@headless-toast/react";
import { ExamplePage } from "#/components/ExamplePage";
import { extractExampleSource } from "#/lib/exampleSource";
import "./toast.css";
import rawSource from "./basic-variants.tsx?raw";
import toastCss from "./toast.css?raw";

const toast = createToast<{ title: string; body: string }>({
  defaults: { duration: 4500, pauseOnHover: true, placement: "top-right" },
}).toast;

function VariantToast() {
  const { toast, dismiss } = useToast<{
    title: string;
    body: string;
  }>();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className:
      "basic-variants-toast pointer-events-auto relative w-full rounded-3xl border border-(--line) bg-(--surface-strong) p-4 pr-12 shadow-[0_20px_40px_rgba(15,23,42,0.12)]",
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
      {...attributes}
    >
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
    </article>
  );
}

function BasicVariantsPreview() {
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
      files={[
        { filename: "basic-variants.tsx", language: "tsx", code },
        { filename: "toast.css", language: "css", code: toastCss },
      ]}
      preview={<BasicVariantsPreview />}
    />
  );
}

export { BasicVariantsPage };
