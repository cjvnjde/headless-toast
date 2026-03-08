import { useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Toaster } from "@headless-toast/react";
import { createToast } from "@headless-toast/react";
import type { ReactToastStore } from "@headless-toast/react";
import { useStore } from "@headless-toast/react";
import { DemoToast } from "./shared/DemoToast";
import { useIsolatedToast } from "./shared/useIsolatedToast";

const meta: Meta = {
  title: "Hooks/useStore",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "`useStore` is a React hook that subscribes to a `ToastStore` using " +
          "`useSyncExternalStore`. It returns the current array of `ToastState` objects, " +
          "updating reactively whenever the store changes.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// ---- Stories ----

/**
 * Demonstrates reactive state updates. The table below the Toaster shows
 * the live toast state array returned by `useStore()`.
 */
export const ReactiveState: Story = {
  name: "Reactive State Inspector",
  render: function Render() {
    const toast = useIsolatedToast();

    return (
      <div className="story-wrapper">
        <h2>Reactive State Inspector</h2>
        <p className="story-subtitle">
          The table below shows the live toast state array returned by{" "}
          <code>useStore()</code>. Add toasts and watch the state update in real
          time.
        </p>
        <div className="story-controls">
          <button
            className="btn-success"
            onClick={() => toast.success({ title: "Success", body: "Done!" })}
          >
            Add Success
          </button>
          <button
            className="btn-error"
            onClick={() => toast.error({ title: "Error", body: "Failed!" })}
          >
            Add Error
          </button>
          <button className="btn-dismiss" onClick={() => toast.dismissAll()}>
            Dismiss All
          </button>
        </div>
        <StateInspector store={toast} />
        <Toaster store={toast} component={DemoToast} />
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
            {toasts.map((t) => (
              <tr key={t.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "4px 8px" }}>{t.id.slice(0, 8)}...</td>
                <td style={{ padding: "4px 8px" }}>{t.type}</td>
                <td style={{ padding: "4px 8px" }}>{t.status}</td>
                <td style={{ padding: "4px 8px" }}>{String(t.paused)}</td>
                <td style={{ padding: "4px 8px" }}>{t.remaining}ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/**
 * Shows that multiple stores are independent — toasts added to one
 * store don't appear in the other.
 */
export const MultipleStores: Story = {
  name: "Multiple Independent Stores",
  render: function Render() {
    const toast1 = useIsolatedToast();
    const toast2Ref = useRef<ReactToastStore | null>(null);
    if (!toast2Ref.current) {
      toast2Ref.current = createToast().toast;
    }
    const toast2 = toast2Ref.current;

    return (
      <div className="story-wrapper">
        <h2>Multiple Independent Stores</h2>
        <p className="story-subtitle">
          Each store is fully isolated. Toasts added to one store never appear
          in the other. Store 1 renders top-left, Store 2 renders top-right.
        </p>
        <div className="story-section">
          <h3>Store 1 (top-left)</h3>
          <div className="story-controls">
            <button
              className="btn-info"
              onClick={() =>
                toast1.info(
                  { title: "Store 1", body: "Belongs to store 1." },
                  { placement: "top-left", duration: 0 },
                )
              }
            >
              Add to Store 1
            </button>
            <button className="btn-dismiss" onClick={() => toast1.dismissAll()}>
              Dismiss Store 1
            </button>
          </div>
        </div>
        <div className="story-section">
          <h3>Store 2 (top-right)</h3>
          <div className="story-controls">
            <button
              className="btn-success"
              onClick={() =>
                toast2.success(
                  { title: "Store 2", body: "Belongs to store 2." },
                  { placement: "top-right", duration: 0 },
                )
              }
            >
              Add to Store 2
            </button>
            <button className="btn-dismiss" onClick={() => toast2.dismissAll()}>
              Dismiss Store 2
            </button>
          </div>
        </div>
        <Toaster
          store={toast1}
          component={DemoToast}
          placements={["top-left"]}
        />
        <Toaster
          store={toast2}
          component={DemoToast}
          placements={["top-right"]}
        />
      </div>
    );
  },
};
