import {
  Toaster,
  createToast,
  useToast,
  useToastAnimation,
} from "@headless-toast/react";
import { ExamplePage } from "#/components/ExamplePage";
import { extractExampleSource } from "#/lib/exampleSource";
import "./toast.css";
import rawSource from "./multiple-containers.tsx?raw";
import toastCss from "./toast.css?raw";

const toast = createToast<{ title: string; body: string }>().toast;

function PanelToast() {
  const { toast, dismiss } = useToast<{ title: string; body: string }>();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className:
      "multiple-containers-toast pointer-events-auto relative rounded-2xl border border-(--line) bg-(--surface-strong) p-3 pr-10 shadow-sm",
  });

  return (
    <article ref={ref} className={className} {...handlers} {...attributes}>
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

function GlobalToast() {
  const { toast, dismiss } = useToast<{ title: string; body: string }>();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className:
      "multiple-containers-toast pointer-events-auto relative rounded-3xl border border-(--line) bg-(--surface-strong) p-4 pr-12 shadow-[0_18px_36px_rgba(15,23,42,0.12)]",
  });

  return (
    <article ref={ref} className={className} {...handlers} {...attributes}>
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

function MultipleContainersPreview() {
  function add(
    containerId: string,
    tone: "success" | "error" | "warning" | "info",
  ) {
    toast[tone](
      {
        title: tone[0].toUpperCase() + tone.slice(1),
        body: `Scoped to ${containerId}.`,
      },
      { containerId, duration: 3500 },
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        {[
          {
            id: "panel-a",
            title: "Panel A",
            actions: [
              ["success", "Success"],
              ["error", "Error"],
            ] as const,
          },
          {
            id: "panel-b",
            title: "Panel B",
            actions: [
              ["warning", "Warning"],
              ["info", "Info"],
            ] as const,
          },
        ].map((panel) => (
          <section
            key={panel.id}
            className="rounded-[1.5rem] border border-(--line) bg-(--surface-strong) p-5"
          >
            <div className="rounded-[1rem] border border-dashed border-(--line-strong) bg-(--surface-muted) p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--accent-strong)">
                {panel.title} toast region
              </p>
              <div className="mt-3 min-h-24 space-y-2">
                <Toaster store={toast} containerId={panel.id} inline>
                  <Toaster.List className="flex flex-col gap-2">
                    <PanelToast />
                  </Toaster.List>
                </Toaster>
              </div>
            </div>

            <h3 className="mt-5 text-lg font-semibold text-(--ink)">
              {panel.title}
            </h3>
            <p className="mt-2 text-sm leading-7 text-(--ink-soft)">
              Only toasts tagged with {panel.id} render in this local area.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {panel.actions.map(([tone, label]) => (
                <button
                  key={tone}
                  type="button"
                  className="doc-button"
                  onClick={() => add(panel.id, tone)}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      <button
        type="button"
        className="doc-button doc-button-secondary"
        onClick={() =>
          toast.info({
            title: "Global toast",
            body: "No containerId means the viewport renderer handles it.",
          })
        }
      >
        Trigger global toast
      </button>

      <Toaster
        store={toast}
        className="pointer-events-none fixed inset-0 z-[9999]"
      >
        <Toaster.List className="fixed right-4 top-4 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
          <GlobalToast />
        </Toaster.List>
      </Toaster>
    </div>
  );
}

const code = extractExampleSource(rawSource);

function MultipleContainersPage() {
  return (
    <ExamplePage
      category="Inline"
      title="Multiple containers"
      summary="One store can feed several inline regions by using different containerId values, which keeps notification streams local to the UI that owns them."
      files={[
        { filename: "multiple-containers.tsx", language: "tsx", code },
        { filename: "toast.css", language: "css", code: toastCss },
      ]}
      preview={<MultipleContainersPreview />}
    />
  );
}

export { MultipleContainersPage };
