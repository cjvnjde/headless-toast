import type { Meta, StoryObj } from "@storybook/react";
import { Toaster } from "@headless-toast/react";
import { DemoToast } from "../shared/DemoToast";
import { useIsolatedToast } from "../shared/useIsolatedToast";

const meta: Meta<typeof Toaster> = {
  title: "Components/Toaster/Behavior",
  component: Toaster,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Interaction-focused toaster examples: progress bars, dismissibility, and pause-on-hover timing.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Toaster>;

export const WithProgress: Story = {
  name: "With Progress Bar",
  render: function Render() {
    const toast = useIsolatedToast();

    return (
      <div className="story-wrapper">
        <h2>Progress Bar</h2>
        <p className="story-subtitle">
          Auto-close progress can be exposed directly in your custom toast UI.
        </p>
        <div className="story-controls">
          <button
            className="btn-success"
            onClick={() =>
              toast.success(
                { title: "Downloading", body: "Your file is being prepared." },
                { progress: true, duration: 5000 },
              )
            }
          >
            Add Toast with Progress
          </button>
        </div>
        <Toaster store={toast} component={DemoToast} />
      </div>
    );
  },
};

export const NonDismissible: Story = {
  name: "Non-Dismissible",
  render: function Render() {
    const toast = useIsolatedToast();

    return (
      <div className="story-wrapper">
        <h2>Non-Dismissible</h2>
        <p className="story-subtitle">
          Disable the close button while still letting the timer handle cleanup.
        </p>
        <div className="story-controls">
          <button
            className="btn-info"
            onClick={() =>
              toast.info(
                {
                  title: "Persistent",
                  body: "This toast cannot be manually dismissed.",
                },
                { dismissible: false, duration: 5000 },
              )
            }
          >
            Non-Dismissible Toast
          </button>
        </div>
        <Toaster store={toast} component={DemoToast} />
      </div>
    );
  },
};

export const PauseOnHover: Story = {
  name: "Pause on Hover",
  render: function Render() {
    const toast = useIsolatedToast();

    return (
      <div className="story-wrapper">
        <h2>Pause on Hover</h2>
        <p className="story-subtitle">
          Hover the toast to pause the countdown, then move away to resume.
        </p>
        <div className="story-controls">
          <button
            className="btn-info"
            onClick={() =>
              toast.info(
                {
                  title: "Hover me",
                  body: "Auto-close pauses while you hover.",
                },
                { pauseOnHover: true, duration: 3000, progress: true },
              )
            }
          >
            Add Pausable Toast
          </button>
        </div>
        <Toaster store={toast} component={DemoToast} />
      </div>
    );
  },
};
