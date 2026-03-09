import type { Meta, StoryObj } from "@storybook/react";
import { Toaster } from "@headless-toast/react";
import { useToast } from "@headless-toast/react";
import { AnimationWrapper } from "@headless-toast/react";
import { useIsolatedToast } from "./shared/useIsolatedToast";

// ---- Toast using AnimationWrapper ----

function WrapperToast() {
  const { toast, dismiss, pauseOnHoverHandlers } = useToast();

  return (
    <AnimationWrapper className="demo-toast">
      <div {...pauseOnHoverHandlers}>
        {toast.data.title ? <strong>{String(toast.data.title)}</strong> : null}
        {toast.data.body ? <p>{String(toast.data.body)}</p> : null}
        {toast.options.dismissible !== false && (
          <button
            className="toast-close"
            onClick={() => dismiss("user")}
            aria-label="Close"
          >
            &times;
          </button>
        )}
      </div>
    </AnimationWrapper>
  );
}

const meta: Meta<typeof AnimationWrapper> = {
  title: "Components/AnimationWrapper",
  component: AnimationWrapper,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "`<AnimationWrapper />` wraps a single toast element and wires animation lifecycle events to the store. " +
          "It emits data attributes like `data-toast-status` and `data-toast-type`, while `className` stays fully user-controlled. " +
          "It listens for `animationend`/`transitionend` to advance the state machine. " +
          "Must be used inside a toast component rendered by `<Toaster>` (reads from context).",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AnimationWrapper>;

// ---- Stories ----

/**
 * AnimationWrapper used inside a Toaster — demonstrates the simplified API.
 */
export const BasicUsage: Story = {
  name: "Basic Usage",
  render: function Render() {
    const toast = useIsolatedToast();

    return (
      <div className="story-wrapper">
        <h2>AnimationWrapper &mdash; Basic Usage</h2>
        <p className="story-subtitle">
          <code>&lt;AnimationWrapper /&gt;</code> handles animation lifecycle
          events automatically while leaving all selectors up to you. Add your
          own <code>className</code> and style against data attributes like
          <code> data-toast-status</code>.
        </p>
        <div className="story-controls">
          <button
            className="btn-success"
            onClick={() =>
              toast.success({
                title: "Animated",
                body: "Using AnimationWrapper component.",
              })
            }
          >
            Add Toast
          </button>
          <button
            className="btn-error"
            onClick={() =>
              toast.error({
                title: "Error",
                body: "AnimationWrapper handles all animation.",
              })
            }
          >
            Add Error
          </button>
          <button className="btn-dismiss" onClick={() => toast.dismissAll()}>
            Dismiss All
          </button>
        </div>
        <Toaster store={toast}><Toaster.List><WrapperToast /></Toaster.List></Toaster>
      </div>
    );
  },
};

/**
 * AnimationWrapper with a custom CSS class applied via the className prop.
 */
export const WithCustomClassName: Story = {
  name: "With Custom ClassName",
  render: function Render() {
    const toast = useIsolatedToast();

    function CustomClassToast() {
      const { toast, dismiss } = useToast();

      return (
        <AnimationWrapper className="toast-custom-story">
          <strong>{String(toast.data.title)}</strong>
          <p>{String(toast.data.body)}</p>
          <button
            className="toast-close"
            onClick={() => dismiss("user")}
            aria-label="Close"
          >
            &times;
          </button>
        </AnimationWrapper>
      );
    }

    return (
      <div className="story-wrapper">
        <h2>AnimationWrapper &mdash; Custom ClassName</h2>
        <p className="story-subtitle">
          Pass an additional <code>className</code> prop to
          <code> &lt;AnimationWrapper&gt;</code>. The class is applied as-is, so
          your CSS can combine it with emitted attributes like
          <code> [data-toast-type=&quot;success&quot;]</code>.
        </p>
        <div className="story-controls">
          <button
            className="btn-success"
            onClick={() =>
              toast.success({
                title: "Custom Class",
                body: "Extra class 'toast-custom-story' appended.",
              })
            }
          >
            Add Toast
          </button>
        </div>
        <Toaster store={toast}><Toaster.List><CustomClassToast /></Toaster.List></Toaster>
      </div>
    );
  },
};
