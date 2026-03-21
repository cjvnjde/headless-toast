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
import rawSource from "./multiple-containers.tsx?raw";
import toastCss from "./toast.css?raw";

function PanelToast() {
  const { toast, dismiss } = useToast<{ title: string; body: string }>();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className:
      "multiple-containers-toast pointer-events-auto relative rounded-2xl border border-(--line) bg-(--surface-strong) p-3 pr-10 shadow-sm",
  });

  return (
    <article
      ref={ref}
      className={className}
      {...handlers}
      {...attributes}
      data-toast-placement={toast.options.placement ?? "top-right"}
    >
      <p className="text-sm font-semibold text-(--ink)">{toast.data.title}</p>
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

function GlobalToast() {
  const { toast, dismiss } = useToast<{ title: string; body: string }>();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className:
      "multiple-containers-toast pointer-events-auto relative rounded-3xl border border-(--line) bg-(--surface-strong) p-4 pr-12 shadow-[0_18px_36px_rgba(15,23,42,0.12)]",
  });

  return (
    <article
      ref={ref}
      className={className}
      {...handlers}
      {...attributes}
      data-toast-placement={toast.options.placement ?? "top-right"}
    >
      <p className="text-sm font-semibold text-(--ink)">{toast.data.title}</p>
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

function MultipleContainersPreview() {
  const storeRef = useRef<ReactToastStore<{
    title: string;
    body: string;
  }> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createToast<{ title: string; body: string }>().toast;
  }

  const toast = storeRef.current;

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
