import type { Meta, StoryObj } from "@storybook/react";
import { Toaster } from "@headless-toast/react";
import { DemoToaster } from "../shared/DemoToast";
import {
  noControlsParameters,
  withDemoToasterDocs,
  toasterArgTypes,
} from "../shared/storybookDocs";
import { useIsolatedToast } from "../shared/useIsolatedToast";

const placements = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
] as const;

const meta: Meta<typeof Toaster> = {
  title: "Components/Toaster/Basics",
  component: Toaster,
  tags: ["autodocs"],
  argTypes: toasterArgTypes,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "`Toaster` creates the live region and placement context. `Toaster.List` renders one list per supported placement, then your toast component renders once for each toast inside that list.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Toaster>;

export const AllTypes: Story = {
  name: "All Toast Types",
  parameters: {
    ...noControlsParameters,
    ...withDemoToasterDocs(
      "Trigger each built-in helper to see how one toast component can react to `data-toast-type` and keep the rendering contract the same.",
      `import { createToast } from "@headless-toast/react";

const { toast: toastStore } = createToast();

toastStore.success({ title: "Success", body: "Operation completed." });
toastStore.error({ title: "Error", body: "Something went wrong." });
toastStore.warning({ title: "Warning", body: "Check your input." });
toastStore.info({ title: "Info", body: "Here is some information." });
toastStore.loading({ title: "Loading", body: "Please wait..." });`,
    ),
  },
  render: function Render() {
    const toastStore = useIsolatedToast();

    return (
      <div className="story-wrapper">
        <h2>All Toast Types</h2>
        <p className="story-subtitle">
          Trigger the built-in toast variants and inspect how one custom
          renderer can style all of them.
        </p>
        <div className="story-controls">
          <button
            className="btn-success"
            onClick={() =>
              toastStore.success({
                title: "Success",
                body: "Operation completed.",
              })
            }
          >
            Success
          </button>
          <button
            className="btn-error"
            onClick={() =>
              toastStore.error({
                title: "Error",
                body: "Something went wrong.",
              })
            }
          >
            Error
          </button>
          <button
            className="btn-warning"
            onClick={() =>
              toastStore.warning({
                title: "Warning",
                body: "Check your input.",
              })
            }
          >
            Warning
          </button>
          <button
            className="btn-info"
            onClick={() =>
              toastStore.info({
                title: "Info",
                body: "Here is some information.",
              })
            }
          >
            Info
          </button>
          <button
            className="btn-loading"
            onClick={() =>
              toastStore.loading({
                title: "Loading",
                body: "Please wait...",
              })
            }
          >
            Loading
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

export const Placements: Story = {
  parameters: {
    ...noControlsParameters,
    ...withDemoToasterDocs(
      "Send the same toast UI to each placement to verify that placement changes only the list layout, not the toast item component.",
      `import { createToast } from "@headless-toast/react";

const { toast: toastStore } = createToast();

toastStore.info(
  { title: "bottom-center", body: "Toast at bottom-center" },
  { placement: "bottom-center" },
);`,
    ),
  },
  render: function Render() {
    const toastStore = useIsolatedToast();

    return (
      <div className="story-wrapper">
        <h2>Placements</h2>
        <p className="story-subtitle">
          Render the same toast component in any supported placement.
        </p>
        <div className="story-controls">
          {placements.map((placement) => (
            <button
              key={placement}
              onClick={() =>
                toastStore.info(
                  { title: placement, body: `Toast at ${placement}` },
                  { placement },
                )
              }
            >
              {placement
                .split("-")
                .map((part) => part[0].toUpperCase() + part.slice(1))
                .join(" ")}
            </button>
          ))}
        </div>
        <DemoToaster store={toastStore} />
      </div>
    );
  },
};
