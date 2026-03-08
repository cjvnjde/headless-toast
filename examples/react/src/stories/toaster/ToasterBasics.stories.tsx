import type { Meta, StoryObj } from "@storybook/react";
import { Toaster } from "@headless-toast/react";
import { DemoToast } from "../shared/DemoToast";
import { useIsolatedToast } from "../shared/useIsolatedToast";

const meta: Meta<typeof Toaster> = {
  title: "Components/Toaster/Basics",
  component: Toaster,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Core toaster basics: render a toast component, choose placements, and verify the headless adapter API in small focused examples.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Toaster>;

export const AllTypes: Story = {
  name: "All Toast Types",
  render: function Render() {
    const toast = useIsolatedToast();

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
              toast.success({ title: "Success", body: "Operation completed." })
            }
          >
            Success
          </button>
          <button
            className="btn-error"
            onClick={() =>
              toast.error({ title: "Error", body: "Something went wrong." })
            }
          >
            Error
          </button>
          <button
            className="btn-warning"
            onClick={() =>
              toast.warning({ title: "Warning", body: "Check your input." })
            }
          >
            Warning
          </button>
          <button
            className="btn-info"
            onClick={() =>
              toast.info({ title: "Info", body: "Here is some information." })
            }
          >
            Info
          </button>
          <button
            className="btn-loading"
            onClick={() =>
              toast.loading({ title: "Loading", body: "Please wait..." })
            }
          >
            Loading
          </button>
          <button className="btn-dismiss" onClick={() => toast.dismissAll()}>
            Dismiss All
          </button>
        </div>
        <Toaster store={toast} component={DemoToast} />
      </div>
    );
  },
};

export const Placements: Story = {
  render: function Render() {
    const toast = useIsolatedToast();

    return (
      <div className="story-wrapper">
        <h2>Placements</h2>
        <p className="story-subtitle">
          Render the same toast component in any supported placement.
        </p>
        <div className="story-controls">
          {(
            [
              "top-left",
              "top-center",
              "top-right",
              "bottom-left",
              "bottom-center",
              "bottom-right",
            ] as const
          ).map((placement) => (
            <button
              key={placement}
              onClick={() =>
                toast.info(
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
        <Toaster store={toast} component={DemoToast} />
      </div>
    );
  },
};
