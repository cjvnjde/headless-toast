import type { Meta, StoryObj } from "@storybook/react";
import { Toaster } from "@headless-toast/react";
import { DemoToaster } from "../shared/DemoToast";
import {
  noControlsParameters,
  withDemoToasterDocs,
  toasterArgTypes,
} from "../shared/storybookDocs";
import { useIsolatedToast } from "../shared/useIsolatedToast";

const meta: Meta<typeof Toaster> = {
  title: "Components/Toaster/Async",
  component: Toaster,
  tags: ["autodocs"],
  argTypes: toasterArgTypes,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Async stories show how the store maps promise lifecycles into toast updates and how the renderer behaves under higher toast volume.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Toaster>;

export const PromiseToast: Story = {
  parameters: {
    ...noControlsParameters,
    ...withDemoToasterDocs(
      "Bind one toast to a promise so loading, success, and error states update in place instead of stacking separate notifications.",
      `import { createToast } from "@headless-toast/react";

const { toast: toastStore } = createToast();
const promise = fetchData();

toastStore.promise(promise, {
  loading: { title: "Loading...", body: "Fetching data" },
  success: (result) => ({ title: "Done", body: result }),
  error: (error) => ({
    title: "Error",
    body: error instanceof Error ? error.message : "Unknown error",
  }),
});`,
    ),
  },
  render: function Render() {
    const toastStore = useIsolatedToast();

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

              toastStore.promise(promise, {
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

              toastStore.promise(promise, {
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
        <DemoToaster store={toastStore} />
      </div>
    );
  },
};

export const StressTest: Story = {
  parameters: {
    ...noControlsParameters,
    ...withDemoToasterDocs(
      "Fire a burst of notifications to inspect placement stacking, width constraints, and how your renderer holds up when the queue grows quickly.",
      `import { createToast } from "@headless-toast/react";

const { toast: toastStore } = createToast();

for (let index = 0; index < 10; index += 1) {
  const type = ["success", "error", "warning", "info"][index % 4] as const;
  toastStore[type](
    { title: \`Toast #\${index + 1}\`, body: \`Type: \${type}\` },
    { duration: 8000 },
  );
}`,
    ),
  },
  render: function Render() {
    const toastStore = useIsolatedToast();
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
                toastStore[type](
                  { title: `Toast #${index + 1}`, body: `Type: ${type}` },
                  { duration: 8000 },
                );
              }
            }}
          >
            Add 10 Toasts
          </button>
          <button
            className="btn-dismiss"
            onClick={() => toastStore.dismissAll()}
          >
            Dismiss All
          </button>
        </div>
        <DemoToaster store={toastStore} />
      </div>
    );
  },
};
