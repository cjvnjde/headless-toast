import {
  Toaster,
  createToast,
  useToast,
  useToastAnimation,
} from "@headless-toast/react";
import { ExamplePage } from "#/components/ExamplePage";
import { extractExampleSource } from "#/lib/exampleSource";
import "./toast.css";
import rawSource from "./persistent-toast.tsx?raw";
import toastCss from "./toast.css?raw";

const toast = createToast<{ title: string; body: string }>({
  defaults: { placement: "top-right" },
}).toast;

function PersistentToast() {
  const { toast, dismiss } = useToast<{ title: string; body: string }>();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className:
      "persistent-toast-toast pointer-events-auto relative w-full rounded-3xl p-4 pr-12 shadow-[0_18px_36px_rgba(15,23,42,0.12)]",
  });

  const tone =
    toast.type === "success"
      ? "border border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-400/20 dark:bg-emerald-950 dark:text-emerald-50"
      : "border border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-300/20 dark:bg-amber-950 dark:text-amber-50";

  return (
    <article
      ref={ref}
      className={`${className} ${tone}`}
      {...handlers}
      {...attributes}
    >
      <p className="text-sm font-semibold">{toast.data.title}</p>
      <p className="mt-1 text-sm opacity-80">{toast.data.body}</p>
      {toast.options.dismissible !== false ? (
        <button
          type="button"
          className="absolute right-3 top-3 text-xs opacity-70"
          onClick={() => dismiss("user")}
        >
          Close
        </button>
      ) : null}
    </article>
  );
}

function PersistentToastPreview() {
  const id = "sync-warning";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="doc-button"
          onClick={() =>
            toast.warning(
              {
                title: "Manual action required",
                body: "This toast stays visible until you resolve the problem.",
              },
              { id, dismissible: false, duration: 0 },
            )
          }
        >
          Show persistent toast
        </button>
        <button
          type="button"
          className="doc-button doc-button-secondary"
          onClick={() =>
            toast.success(
              {
                title: "Issue resolved",
                body: "The same toast id was updated and can now auto-close.",
              },
              { id, dismissible: true, duration: 3200 },
            )
          }
        >
          Resolve it
        </button>
      </div>
      <Toaster
        store={toast}
        className="pointer-events-none fixed inset-0 z-[9999]"
      >
        <Toaster.List className="fixed right-4 top-4 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
          <PersistentToast />
        </Toaster.List>
      </Toaster>
    </div>
  );
}

const code = extractExampleSource(rawSource);

function PersistentToastPage() {
  return (
    <ExamplePage
      category="Fundamentals"
      title="Persistent toast"
      summary="Turn off the close affordance and set duration to 0 when the notification represents a state that should stay on screen until your app explicitly changes it."
      files={[
        { filename: "persistent-toast.tsx", language: "tsx", code },
        { filename: "toast.css", language: "css", code: toastCss },
      ]}
      preview={<PersistentToastPreview />}
    />
  );
}

export { PersistentToastPage };
