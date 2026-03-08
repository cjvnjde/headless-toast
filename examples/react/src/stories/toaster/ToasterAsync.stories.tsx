import type { Meta, StoryObj } from "@storybook/react";
import { Toaster } from "@headless-toast/react";
import { DemoToast } from "../shared/DemoToast";
import { useIsolatedToastContext } from "../shared/useIsolatedToastContext";

const meta: Meta<typeof Toaster> = {
  title: "Components/Toaster/Async",
  component: Toaster,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Async and high-volume toaster examples, including promise lifecycles and stress testing.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Toaster>;

export const PromiseToast: Story = {
  render: function Render() {
    const { store, toast } = useIsolatedToastContext();

    return (
      <div className="story-wrapper">
        <h2>Promise Toast</h2>
        <p className="story-subtitle">
          Bind loading, success, and error states to the lifecycle of a promise.
        </p>
        <div className="story-controls">
          <button
            className="btn-success"
            onClick={() => {
              const promise = new Promise<string>((resolve) =>
                setTimeout(() => resolve("Data loaded!"), 2000),
              );

              toast.promise(promise, {
                loading: { title: "Loading...", body: "Fetching data" },
                success: (result: string) => ({ title: "Done", body: result }),
                error: () => ({
                  title: "Failed",
                  body: "Could not fetch data",
                }),
              });
            }}
          >
            Promise (resolves)
          </button>
          <button
            className="btn-error"
            onClick={() => {
              const promise = new Promise<string>((_, reject) =>
                setTimeout(() => reject(new Error("Network error")), 2000),
              );

              toast.promise(promise, {
                loading: { title: "Loading...", body: "Fetching data" },
                success: () => ({ title: "Done", body: "Success!" }),
                error: (error: unknown) => ({
                  title: "Error",
                  body:
                    error instanceof Error ? error.message : "Unknown error",
                }),
              });
            }}
          >
            Promise (rejects)
          </button>
        </div>
        <Toaster store={store} component={DemoToast} />
      </div>
    );
  },
};

export const StressTest: Story = {
  render: function Render() {
    const { store, toast } = useIsolatedToastContext();
    const types = ["success", "error", "warning", "info"] as const;

    return (
      <div className="story-wrapper">
        <h2>Stress Test</h2>
        <p className="story-subtitle">
          Rapidly add many toasts to test rendering volume and placement
          stacking.
        </p>
        <div className="story-controls">
          <button
            onClick={() => {
              for (let index = 0; index < 10; index += 1) {
                const type = types[index % types.length];
                toast[type](
                  { title: `Toast #${index + 1}`, body: `Type: ${type}` },
                  { duration: 8000 },
                );
              }
            }}
          >
            Add 10 Toasts
          </button>
          <button className="btn-dismiss" onClick={() => toast.dismissAll()}>
            Dismiss All
          </button>
        </div>
        <Toaster store={store} component={DemoToast} />
      </div>
    );
  },
};
