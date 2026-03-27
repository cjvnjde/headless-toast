import { useState } from "react";
import {
  Toaster,
  createToast,
  useToast,
  useToastAnimation,
} from "@headless-toast/react";
import { ExamplePage } from "#/components/ExamplePage";
import { extractExampleSource } from "#/lib/exampleSource";
import "./toast.css";
import rawSource from "./inline-sidebar.tsx?raw";
import toastCss from "./toast.css?raw";

const toast = createToast<{ title: string; body: string }>().toast;

function SidebarToast() {
  const { toast, dismiss } = useToast<{ title: string; body: string }>();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className:
      "inline-sidebar-toast pointer-events-auto relative rounded-2xl border border-(--line) bg-(--surface-strong) p-3 pr-10 shadow-sm",
  });

  return (
    <article ref={ref} className={className} {...handlers} {...attributes}>
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
      "inline-sidebar-toast pointer-events-auto relative rounded-3xl border border-(--line) bg-(--surface-strong) p-4 pr-12 shadow-[0_18px_36px_rgba(15,23,42,0.12)]",
  });

  return (
    <article ref={ref} className={className} {...handlers} {...attributes}>
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

function InlineSidebarPreview() {
  const [projectName, setProjectName] = useState("Headless Toast");

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_24rem]">
      <section className="rounded-[1.5rem] border border-(--line) bg-(--surface-strong) p-5">
        <h3 className="text-lg font-semibold text-(--ink)">Main workspace</h3>
        <p className="mt-2 text-sm leading-7 text-(--ink-soft)">
          Trigger a regular viewport toast from the main area or save settings
          in the sidebar to keep feedback local to that panel.
        </p>
        <div className="mt-5 rounded-[1.25rem] border border-dashed border-(--line-strong) bg-(--surface-muted) p-4 text-sm text-(--ink-soft)">
          This area represents the rest of the page. The sidebar on the right
          owns its own inline toast region.
        </div>
        <button
          type="button"
          className="doc-button mt-5"
          onClick={() =>
            toast.info({
              title: "Global notice",
              body: "This toast is not scoped to the sidebar container.",
            })
          }
        >
          Show global toast
        </button>
      </section>

      <aside className="rounded-[1.5rem] border border-(--line) bg-(--surface-strong) p-5">
        <div className="rounded-[1rem] border border-dashed border-(--line-strong) bg-(--surface-muted) p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--accent-strong)">
            Sidebar toast region
          </p>
          <div className="mt-3 min-h-24 space-y-2">
            <Toaster store={toast} containerId="sidebar" inline>
              <Toaster.List className="flex flex-col gap-2">
                <SidebarToast />
              </Toaster.List>
            </Toaster>
          </div>
        </div>

        <h3 className="mt-5 text-lg font-semibold text-(--ink)">Settings</h3>
        <label className="mt-4 block text-sm text-(--ink-soft)">
          Project name
          <input
            className="mt-2 w-full rounded-2xl border border-(--line) bg-transparent px-3 py-2 text-(--ink) outline-none"
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
          />
        </label>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="doc-button"
            onClick={() =>
              toast.success(
                { title: "Saved", body: `${projectName} was saved.` },
                { containerId: "sidebar", duration: 3000 },
              )
            }
          >
            Save
          </button>
          <button
            type="button"
            className="doc-button doc-button-secondary"
            onClick={() =>
              toast.error(
                {
                  title: "Save failed",
                  body: "Sidebar-specific feedback stays local.",
                },
                { containerId: "sidebar", duration: 4000 },
              )
            }
          >
            Simulate error
          </button>
        </div>
      </aside>

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

function InlineSidebarPage() {
  return (
    <ExamplePage
      category="Inline"
      title="Inline sidebar"
      summary="Use containerId plus inline rendering when a local surface should own its own feedback while the rest of the app continues to use global viewport toasts."
      files={[
        { filename: "inline-sidebar.tsx", language: "tsx", code },
        { filename: "toast.css", language: "css", code: toastCss },
      ]}
      preview={<InlineSidebarPreview />}
    />
  );
}

export { InlineSidebarPage };
