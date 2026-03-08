import type { Meta, StoryObj } from "@storybook/react";
import { Toaster } from "@headless-toast/react";
import { DemoToast } from "../shared/DemoToast";
import { useIsolatedToast } from "../shared/useIsolatedToast";

const meta: Meta = {
  title: "Features/Integration",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Integration-focused examples showing how the store can be used from non-React code paths.",
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const OutsideReact: Story = {
  name: "Toast Outside React",
  render: function Render() {
    const toast = useIsolatedToast();

    function simulateExternalCall() {
      toast.success({
        title: "External Call",
        body: "This was triggered from outside React!",
      });
    }

    function simulateApiInterceptor() {
      setTimeout(() => {
        toast.error({
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
          <button className="btn-dismiss" onClick={() => toast.dismissAll()}>
            Dismiss All
          </button>
        </div>
        <Toaster store={toast} component={DemoToast} />
      </div>
    );
  },
};
