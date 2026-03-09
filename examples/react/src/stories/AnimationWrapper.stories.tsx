import type { Meta, StoryObj } from "@storybook/react";
import { AnimationWrapper, Toaster, useToast } from "@headless-toast/react";
import {
  animationWrapperArgTypes,
  noControlsParameters,
  withCodeDocs,
} from "./shared/storybookDocs";
import { useIsolatedToast } from "./shared/useIsolatedToast";

function WrapperToast() {
  const { toast: currentToast, dismiss, pauseOnHoverHandlers } = useToast();

  return (
    <AnimationWrapper className="demo-toast">
      <div {...pauseOnHoverHandlers}>
        {currentToast.data.title ? (
          <strong>{String(currentToast.data.title)}</strong>
        ) : null}
        {currentToast.data.body ? (
          <p>{String(currentToast.data.body)}</p>
        ) : null}
        {currentToast.options.dismissible !== false ? (
          <button
            className="toast-close"
            onClick={() => dismiss("user")}
            aria-label="Close"
          >
            &times;
          </button>
        ) : null}
      </div>
    </AnimationWrapper>
  );
}

const meta: Meta<typeof AnimationWrapper> = {
  title: "Components/AnimationWrapper",
  component: AnimationWrapper,
  tags: ["autodocs"],
  argTypes: animationWrapperArgTypes,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "`AnimationWrapper` is the convenience version of `useToastAnimation()`. Use it when one wrapper element is enough and you do not need to spread animation handlers manually.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AnimationWrapper>;

export const BasicUsage: Story = {
  name: "Basic Usage",
  parameters: {
    ...noControlsParameters,
    ...withCodeDocs(
      "Use `AnimationWrapper` when your toast has a single outer element and you want CSS lifecycle wiring without manually handling refs and DOM events.",
      `function WrapperToast() {
  const { toast: currentToast, dismiss, pauseOnHoverHandlers } = useToast();

  return (
    <AnimationWrapper className="demo-toast">
      <div {...pauseOnHoverHandlers}>
        <strong>{String(currentToast.data.title)}</strong>
        <p>{String(currentToast.data.body)}</p>
        <button type="button" className="toast-close" onClick={() => dismiss("user")}>
          &times;
        </button>
      </div>
    </AnimationWrapper>
  );
}`,
    ),
  },
  render: function Render() {
    const toastStore = useIsolatedToast();

    return (
      <div className="story-wrapper">
        <h2>AnimationWrapper - Basic Usage</h2>
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
              toastStore.success({
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
              toastStore.error({
                title: "Error",
                body: "AnimationWrapper handles all animation.",
              })
            }
          >
            Add Error
          </button>
          <button
            className="btn-dismiss"
            onClick={() => toastStore.dismissAll()}
          >
            Dismiss All
          </button>
        </div>
        <Toaster store={toastStore}>
          <Toaster.List>
            <WrapperToast />
          </Toaster.List>
        </Toaster>
      </div>
    );
  },
};

export const WithCustomClassName: Story = {
  name: "With Custom ClassName",
  parameters: {
    ...noControlsParameters,
    ...withCodeDocs(
      "Pass a custom class name when your design system wants to style the wrapper directly while still relying on the emitted data attributes.",
      `function CustomClassToast() {
  const { toast: currentToast, dismiss } = useToast();

  return (
    <AnimationWrapper className="toast-custom-story">
      <strong>{String(currentToast.data.title)}</strong>
      <p>{String(currentToast.data.body)}</p>
      <button type="button" className="toast-close" onClick={() => dismiss("user")}>
        &times;
      </button>
    </AnimationWrapper>
  );
}`,
    ),
  },
  render: function Render() {
    const toastStore = useIsolatedToast();

    function CustomClassToast() {
      const { toast: currentToast, dismiss } = useToast();

      return (
        <AnimationWrapper className="toast-custom-story">
          <strong>{String(currentToast.data.title)}</strong>
          <p>{String(currentToast.data.body)}</p>
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
        <h2>AnimationWrapper - Custom ClassName</h2>
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
              toastStore.success({
                title: "Custom Class",
                body: "Extra class 'toast-custom-story' appended.",
              })
            }
          >
            Add Toast
          </button>
        </div>
        <Toaster store={toastStore}>
          <Toaster.List>
            <CustomClassToast />
          </Toaster.List>
        </Toaster>
      </div>
    );
  },
};
