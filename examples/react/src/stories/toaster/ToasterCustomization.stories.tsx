import type { Meta, StoryObj } from "@storybook/react";
import { Toaster, useToast, useToastAnimation } from "@headless-toast/react";
import { DemoToast } from "../shared/DemoToast";
import { useIsolatedToastContext } from "../shared/useIsolatedToastContext";

const meta: Meta<typeof Toaster> = {
  title: "Components/Toaster/Customization",
  component: Toaster,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Examples that focus on custom rendering and styling with user-provided selectors and placement class names.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Toaster>;

function FancyToast() {
  const { toast, dismiss } = useToast();
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
          {toast.type === "success" ? "OK" : toast.type === "error" ? "!" : "i"}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>{String(toast.data.title)}</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>
            {String(toast.data.body)}
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
  render: function Render() {
    const { store, toast } = useIsolatedToastContext();

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
              toast.success({
                title: "Custom Render",
                body: "Styled differently.",
              })
            }
          >
            Add Custom-Rendered Toast
          </button>
        </div>
        <Toaster store={store} component={FancyToast} />
      </div>
    );
  },
};

export const HeadlessSelectors: Story = {
  render: function Render() {
    const { store, toast } = useIsolatedToastContext();

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
              toast.success(
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
              toast.info(
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
              toast.warning(
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
          <button className="btn-dismiss" onClick={() => toast.dismissAll()}>
            Dismiss All
          </button>
        </div>
        <Toaster
          store={store}
          component={DemoToast}
          className="selector-demo-region"
          placementClassName={({ placement, expanded, stack }) =>
            [
              "selector-demo-placement",
              placement === "bottom-center"
                ? "selector-demo-placement-wide"
                : "",
              stack ? "selector-demo-placement-stack" : "",
              expanded ? "selector-demo-placement-expanded" : "",
            ]
              .filter(Boolean)
              .join(" ")
          }
        />
      </div>
    );
  },
};
