import type { Meta, StoryObj } from "@storybook/react";
import { DemoToaster } from "../shared/DemoToast";
import { noControlsParameters, withCodeDocs } from "../shared/storybookDocs";
import { useIsolatedToast } from "../shared/useIsolatedToast";

const meta: Meta = {
  title: "Features/Integration",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The toast store is plain JavaScript. You can trigger it from interceptors, async utilities, service modules, or any event source outside the React tree.",
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const OutsideReact: Story = {
  name: "Toast Outside React",
  parameters: {
    ...noControlsParameters,
    ...withCodeDocs(
      "Keep the store in a module or app service layer when non-React code paths need to trigger notifications.",
      `export const notifications = createToast().toast;

apiClient.onError((error) => {
  notifications.error({
    title: "API Error",
    body: error.message,
  });
});`,
    ),
  },
  render: function Render() {
    const toastStore = useIsolatedToast();

    function simulateExternalCall() {
      toastStore.success({
        title: "External Call",
        body: "This was triggered from outside React!",
      });
    }

    function simulateApiInterceptor() {
      setTimeout(() => {
        toastStore.error({
          title: "API Error",
          body: "Request failed with status 500",
        });
      }, 500);
    }

    return (
      <div className="story-wrapper">
        <h2>Toast from Outside React</h2>
        <p className="story-subtitle">
          The store is just JavaScript, so it can be called from interceptors,
          service modules, and async utilities.
        </p>
        <div className="story-controls">
          <button className="btn-success" onClick={simulateExternalCall}>
            Simulate External Call
          </button>
          <button className="btn-error" onClick={simulateApiInterceptor}>
            Simulate API Error (500ms delay)
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
