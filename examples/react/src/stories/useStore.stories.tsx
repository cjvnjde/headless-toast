import { useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createToast } from "@headless-toast/react";
import type { ReactToastStore } from "@headless-toast/react";
import { useStore } from "@headless-toast/react";
import { DemoToaster } from "./shared/DemoToast";
import { noControlsParameters, withCodeDocs } from "./shared/storybookDocs";
import { useIsolatedToast } from "./shared/useIsolatedToast";

const meta: Meta = {
  title: "Hooks/useStore",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    controls: {
      disable: true,
    },
    docs: {
      description: {
        component:
          "`useStore(store)` subscribes React to the current array of toast states. Use it when you want dashboards, counters, alternate layouts, or custom render loops outside the default `Toaster.List` flow.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const ReactiveState: Story = {
  name: "Reactive State Inspector",
  parameters: {
    ...noControlsParameters,
    ...withCodeDocs(
      "Subscribe to the raw toast array and render your own inspector, analytics panel, or badge UI from it.",
      `function ToastDebugPanel({ store }: { store: ReactToastStore }) {
  const toasts = useStore(store);

  return (
    <ul>
      {toasts.map((toast) => (
        <li key={toast.id}>
          {toast.type} - {toast.status} - {toast.remaining}ms remaining
        </li>
      ))}
    </ul>
  );
}`,
    ),
  },
  render: function Render() {
    const toastStore = useIsolatedToast();

    return (
      <div className="story-wrapper">
        <h2>Reactive State Inspector</h2>
        <p className="story-subtitle">
          The table below shows the live toast state array returned by
          <code> useStore()</code>. Add toasts and watch the state update in
          real time.
        </p>
        <div className="story-controls">
          <button
            className="btn-success"
            onClick={() =>
              toastStore.success({ title: "Success", body: "Done!" })
            }
          >
            Add Success
          </button>
          <button
            className="btn-error"
            onClick={() =>
              toastStore.error({ title: "Error", body: "Failed!" })
            }
          >
            Add Error
          </button>
          <button
            className="btn-dismiss"
            onClick={() => toastStore.dismissAll()}
          >
            Dismiss All
          </button>
        </div>
        <StateInspector store={toastStore} />
        <DemoToaster store={toastStore} />
      </div>
    );
  },
};

function StateInspector({ store }: { store: ReactToastStore }) {
  const toasts = useStore(store);

  return (
    <div style={{ margin: "16px 0", fontFamily: "monospace", fontSize: 12 }}>
      <h4 style={{ margin: "0 0 8px", fontSize: 13, fontFamily: "sans-serif" }}>
        useStore() &rarr; {toasts.length} toast(s)
      </h4>
      {toasts.length === 0 ? (
        <div style={{ color: "#9ca3af" }}>
          No toasts. Click a button above to add one.
        </div>
      ) : (
        <table
          style={{ borderCollapse: "collapse", width: "100%", maxWidth: 600 }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
              <th style={{ textAlign: "left", padding: "4px 8px" }}>ID</th>
              <th style={{ textAlign: "left", padding: "4px 8px" }}>Type</th>
              <th style={{ textAlign: "left", padding: "4px 8px" }}>Status</th>
              <th style={{ textAlign: "left", padding: "4px 8px" }}>Paused</th>
              <th style={{ textAlign: "left", padding: "4px 8px" }}>
                Remaining
              </th>
            </tr>
          </thead>
          <tbody>
            {toasts.map((toast) => (
              <tr key={toast.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "4px 8px" }}>
                  {toast.id.slice(0, 8)}...
                </td>
                <td style={{ padding: "4px 8px" }}>{toast.type}</td>
                <td style={{ padding: "4px 8px" }}>{toast.status}</td>
                <td style={{ padding: "4px 8px" }}>{String(toast.paused)}</td>
                <td style={{ padding: "4px 8px" }}>{toast.remaining}ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export const MultipleStores: Story = {
  name: "Multiple Independent Stores",
  parameters: {
    ...noControlsParameters,
    ...withCodeDocs(
      "Create multiple stores when different parts of the product should have fully isolated toast streams and defaults.",
      `const storeA = createToast({ defaults: { placement: "top-left" } }).toast;
const storeB = createToast({ defaults: { placement: "top-right" } }).toast;`,
    ),
  },
  render: function Render() {
    const toastStoreA = useIsolatedToast();
    const toastStoreBRef = useRef<ReactToastStore | null>(null);

    if (!toastStoreBRef.current) {
      toastStoreBRef.current = createToast().toast;
    }

    const toastStoreB = toastStoreBRef.current;

    return (
      <div className="story-wrapper">
        <h2>Multiple Independent Stores</h2>
        <p className="story-subtitle">
          Each store is fully isolated. Toasts added to one store never appear
          in the other. Store A renders top-left, Store B renders top-right.
        </p>
        <div className="story-section">
          <h3>Store A (top-left)</h3>
          <div className="story-controls">
            <button
              className="btn-info"
              onClick={() =>
                toastStoreA.info(
                  { title: "Store A", body: "Belongs to store A." },
                  { placement: "top-left", duration: 0 },
                )
              }
            >
              Add to Store A
            </button>
            <button
              className="btn-dismiss"
              onClick={() => toastStoreA.dismissAll()}
            >
              Dismiss Store A
            </button>
          </div>
        </div>
        <div className="story-section">
          <h3>Store B (top-right)</h3>
          <div className="story-controls">
            <button
              className="btn-success"
              onClick={() =>
                toastStoreB.success(
                  { title: "Store B", body: "Belongs to store B." },
                  { placement: "top-right", duration: 0 },
                )
              }
            >
              Add to Store B
            </button>
            <button
              className="btn-dismiss"
              onClick={() => toastStoreB.dismissAll()}
            >
              Dismiss Store B
            </button>
          </div>
        </div>
        <DemoToaster store={toastStoreA} />
        <DemoToaster store={toastStoreB} />
      </div>
    );
  },
};
