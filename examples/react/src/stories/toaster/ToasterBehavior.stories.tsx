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
  title: "Components/Toaster/Behavior",
  component: Toaster,
  tags: ["autodocs"],
  argTypes: toasterArgTypes,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "These stories focus on runtime behavior layered on top of the basic toaster render pipeline: progress feedback, dismissibility, and timeout pausing.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Toaster>;

export const WithProgress: Story = {
  name: "With Progress Bar",
  parameters: {
    ...noControlsParameters,
    ...withDemoToasterDocs(
      "Expose the remaining lifetime of an auto-closing toast with `progress: true` and render your own progress UI from the current toast state.",
      `import { createToast } from "@headless-toast/react";

const { toast: toastStore } = createToast();

toastStore.success(
  { title: "Downloading", body: "Your file is being prepared." },
  { progress: true, duration: 5000 },
);`,
    ),
  },
  render: function Render() {
    const toastStore = useIsolatedToast();

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
              toastStore.success(
                { title: "Downloading", body: "Your file is being prepared." },
                { progress: true, duration: 5000 },
              )
            }
          >
            Add Toast with Progress
          </button>
        </div>
        <DemoToaster store={toastStore} />
      </div>
    );
  },
};

export const NonDismissible: Story = {
  name: "Non-Dismissible",
  parameters: {
    ...noControlsParameters,
    ...withDemoToasterDocs(
      "Turn off the close button by setting `dismissible: false` while still letting the store manage the rest of the toast lifecycle.",
      `import { createToast } from "@headless-toast/react";

const { toast: toastStore } = createToast();

toastStore.info(
  {
    title: "Persistent",
    body: "This toast cannot be manually dismissed.",
  },
  { dismissible: false, duration: 5000 },
);`,
    ),
  },
  render: function Render() {
    const toastStore = useIsolatedToast();

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
              toastStore.info(
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
        <DemoToaster store={toastStore} />
      </div>
    );
  },
};

export const PauseOnHover: Story = {
  name: "Pause on Hover",
  parameters: {
    ...noControlsParameters,
    ...withDemoToasterDocs(
      "Pause the timeout while the user hovers the toast so longer messages remain readable without increasing your default duration.",
      `import { createToast } from "@headless-toast/react";

const { toast: toastStore } = createToast();

toastStore.info(
  {
    title: "Hover me",
    body: "Auto-close pauses while you hover.",
  },
  { pauseOnHover: true, duration: 3000, progress: true },
);`,
    ),
  },
  render: function Render() {
    const toastStore = useIsolatedToast();

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
              toastStore.info(
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
        <DemoToaster store={toastStore} />
      </div>
    );
  },
};
