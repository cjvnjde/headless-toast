import {
  Toaster,
  createToast,
  useStore,
  useToast,
  useToastAnimation,
} from "@headless-toast/react";
import type { ReactToastStore } from "@headless-toast/react";
import { ExamplePage } from "#/components/ExamplePage";
import { extractExampleSource } from "#/lib/exampleSource";
import "./toast.css";
import rawSource from "./store-inspector.tsx?raw";
import toastCss from "./toast.css?raw";

const storeA = createToast<{ title: string; body: string }>({
  defaults: { placement: "top-left", duration: 0 },
}).toast;

const storeB = createToast<{ title: string; body: string }>({
  defaults: { placement: "top-right", duration: 0 },
}).toast;

function InspectorToast() {
  const { toast, dismiss } = useToast<{ title: string; body: string }>();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className:
      "store-inspector-toast pointer-events-auto relative w-full rounded-3xl border border-(--line) bg-(--surface-strong) p-4 pr-12 shadow-[0_18px_36px_rgba(15,23,42,0.12)]",
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

function StateTable({
  store,
  label,
}: {
  store: ReactToastStore<{ title: string; body: string }>;
  label: string;
}) {
  const toasts = useStore(store);

  return (
    <div className="rounded-3xl border border-(--line) bg-(--chip-bg) p-4">
      <h3 className="text-sm font-semibold text-(--ink)">
        {label} — {toasts.length} toast(s)
      </h3>
      {toasts.length === 0 ? (
        <p className="mt-2 text-sm text-(--ink-soft)">No active toasts.</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-xs text-(--ink-soft)">
            <thead>
              <tr className="border-b border-(--line) text-(--ink)">
                <th className="pb-2 pr-4">Type</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2 pr-4">Paused</th>
                <th className="pb-2">Remaining</th>
              </tr>
            </thead>
            <tbody>
              {toasts.map((toast) => (
                <tr key={toast.id} className="border-b border-(--line)/70">
                  <td className="py-2 pr-4">{toast.type}</td>
                  <td className="py-2 pr-4">{toast.status}</td>
                  <td className="py-2 pr-4">{String(toast.paused)}</td>
                  <td className="py-2">{toast.remaining}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StoreInspectorPreview() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="doc-button"
          onClick={() =>
            storeA.info({ title: "Store A", body: "Top-left store." })
          }
        >
          Add to store A
        </button>
        <button
          type="button"
          className="doc-button doc-button-secondary"
          onClick={() =>
            storeB.success({ title: "Store B", body: "Top-right store." })
          }
        >
          Add to store B
        </button>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <StateTable store={storeA} label="Store A" />
        <StateTable store={storeB} label="Store B" />
      </div>
      <Toaster
        store={storeA}
        className="pointer-events-none fixed inset-0 z-[9999]"
      >
        <Toaster.List className="fixed left-4 top-4 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
          <InspectorToast />
        </Toaster.List>
      </Toaster>
      <Toaster
        store={storeB}
        className="pointer-events-none fixed inset-0 z-[9999]"
      >
        <Toaster.List className="fixed right-4 top-4 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
          <InspectorToast />
        </Toaster.List>
      </Toaster>
    </div>
  );
}

const code = extractExampleSource(rawSource);

function StoreInspectorPage() {
  return (
    <ExamplePage
      category="State"
      title="Store inspector"
      summary="useStore(store) subscribes React to the raw toast array, which makes dashboards, counters, debug views, and alternative render loops straightforward."
      files={[
        { filename: "store-inspector.tsx", language: "tsx", code },
        { filename: "toast.css", language: "css", code: toastCss },
      ]}
      preview={<StoreInspectorPreview />}
    />
  );
}

export { StoreInspectorPage };
