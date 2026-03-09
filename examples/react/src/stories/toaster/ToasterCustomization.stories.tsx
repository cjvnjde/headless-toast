import type { Meta, StoryObj } from "@storybook/react";
import { Toaster, useToast, useToastAnimation } from "@headless-toast/react";
import { DemoToast } from "../shared/DemoToast";
import {
  noControlsParameters,
  withDemoToasterDocs,
  toasterArgTypes,
} from "../shared/storybookDocs";
import { useIsolatedToast } from "../shared/useIsolatedToast";

const meta: Meta<typeof Toaster> = {
  title: "Components/Toaster/Customization",
  component: Toaster,
  tags: ["autodocs"],
  argTypes: toasterArgTypes,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Customization stories focus on the boundary between the headless toast state machine and your own visual system. Use these when you want full markup control or selector-driven styling.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Toaster>;

function FancyToast() {
  const { toast: currentToast, dismiss } = useToast();
  const { ref, className, attributes, handlers } = useToastAnimation({
    className: "demo-toast",
  });

  return (
    <div ref={ref} className={className} {...handlers} {...attributes}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          width: "100%",
        }}
      >
        <span style={{ fontSize: 24 }}>
          {currentToast.type === "success"
            ? "OK"
            : currentToast.type === "error"
              ? "!"
              : "i"}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>
            {String(currentToast.data.title)}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>
            {String(currentToast.data.body)}
          </div>
        </div>
        <button
          onClick={() => dismiss("user")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 18,
            color: "#9ca3af",
          }}
        >
          &times;
        </button>
      </div>
    </div>
  );
}

export const CustomComponent: Story = {
  name: "Custom Component",
  parameters: {
    ...noControlsParameters,
    ...withDemoToasterDocs(
      "Replace the entire toast item while keeping the same store, placement grouping, and lifecycle hooks underneath.",
      `import { createToast } from "@headless-toast/react";

const { toast: toastStore } = createToast();

toastStore.success({
  title: "Custom Render",
  body: "Styled differently.",
});`,
    ),
  },
  render: function Render() {
    const toastStore = useIsolatedToast();

    return (
      <div className="story-wrapper">
        <h2>Custom Component</h2>
        <p className="story-subtitle">
          Replace the entire toast renderer while keeping the same store and
          toaster primitives.
        </p>
        <div className="story-controls">
          <button
            className="btn-success"
            onClick={() =>
              toastStore.success({
                title: "Custom Render",
                body: "Styled differently.",
              })
            }
          >
            Add Custom-Rendered Toast
          </button>
        </div>
        <Toaster store={toastStore}>
          <Toaster.List>
            <FancyToast />
          </Toaster.List>
        </Toaster>
      </div>
    );
  },
};

export const HeadlessSelectors: Story = {
  parameters: {
    ...noControlsParameters,
    ...withDemoToasterDocs(
      "Style stacks and lifecycle phases entirely through emitted data attributes like `data-placement`, `data-stack-expanded`, and `data-toast-status`.",
      `import { createToast } from "@headless-toast/react";

const { toast: toastStore } = createToast();

toastStore.success(
  { title: "Saved", body: "Styled via data attributes." },
  {
    placement: "top-left",
    stack: { mode: "collapsed", expandOn: "hover", maxVisible: 3 },
    pauseOnHover: true,
    duration: 5000,
  },
);`,
    ),
  },
  render: function Render() {
    const toastStore = useIsolatedToast();

    return (
      <div className="story-wrapper">
        <h2>Headless Selectors</h2>
        <p className="story-subtitle">
          Style placements and lifecycle states with emitted data attributes
          instead of built-in UI classes.
        </p>
        <div className="story-controls">
          <button
            className="btn-success"
            onClick={() =>
              toastStore.success(
                { title: "Saved", body: "Styled via data attributes." },
                {
                  placement: "top-left",
                  stack: {
                    mode: "collapsed",
                    expandOn: "hover",
                    maxVisible: 3,
                  },
                  pauseOnHover: true,
                  duration: 5000,
                },
              )
            }
          >
            Top Left Stack
          </button>
          <button
            className="btn-info"
            onClick={() =>
              toastStore.info(
                { title: "Center", body: "Use data-placement selectors." },
                {
                  placement: "bottom-center",
                  stack: {
                    mode: "collapsed",
                    expandOn: "hover",
                    maxVisible: 3,
                  },
                  pauseOnHover: true,
                  duration: 5000,
                },
              )
            }
          >
            Bottom Center Stack
          </button>
          <button
            className="btn-warning"
            onClick={() =>
              toastStore.warning(
                { title: "Hover stack", body: "Container expands on hover." },
                {
                  placement: "top-right",
                  stack: {
                    mode: "collapsed",
                    expandOn: "hover",
                    maxVisible: 2,
                  },
                  pauseOnHover: true,
                  duration: 0,
                },
              )
            }
          >
            Top Right Hover Stack
          </button>
          <button
            className="btn-dismiss"
            onClick={() => toastStore.dismissAll()}
          >
            Dismiss All
          </button>
        </div>
        <Toaster store={toastStore} className="selector-demo-region">
          <Toaster.List className="selector-demo-placement">
            <DemoToast />
          </Toaster.List>
        </Toaster>
      </div>
    );
  },
};
