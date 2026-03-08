import type { Meta, StoryObj } from "@storybook/react";
import { Toaster } from "@headless-toast/react";
import { useToast } from "@headless-toast/react";
import { useToastAnimation } from "@headless-toast/react";
import { useIsolatedToastContext } from "./shared/useIsolatedToastContext";

// ---- Shared toast components for stories ----

/**
 * Basic toast component that demonstrates useToast() hook output.
 */
function BasicToast() {
  const { toast, dismiss, pauseOnHoverHandlers } = useToast();
  const { ref, className, attributes, handlers } = useToastAnimation({
    className: "demo-toast",
  });

  return (
    <div
      ref={ref}
      className={className}
      {...handlers}
      {...pauseOnHoverHandlers}
      {...attributes}
    >
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
      {toast.options.progress && (
        <div
          className="toast-progress"
          style={{ width: `${toast.progress * 100}%` }}
          role="progressbar"
          aria-valuenow={Math.round(toast.progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      )}
    </div>
  );
}

/**
 * Custom-styled toast to demonstrate full rendering control via useToast().
 */
function CustomStyledToast() {
  const { toast, dismiss } = useToast();
  const { ref, className, attributes, handlers } = useToastAnimation();

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
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background:
              toast.type === "success"
                ? "#dcfce7"
                : toast.type === "error"
                  ? "#fee2e2"
                  : "#dbeafe",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          {toast.type === "success"
            ? "\u2713"
            : toast.type === "error"
              ? "\u2717"
              : "\u2139"}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>
            {String(toast.data.title)}
          </div>
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
            color: "#9ca3af",
            fontSize: 18,
          }}
        >
          &times;
        </button>
      </div>
    </div>
  );
}

const meta: Meta = {
  title: "Hooks/useToast",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "`useToast()` provides the current toast state and actions inside a user-defined " +
          "toast component rendered by `<Toaster>`. It returns the toast state, store reference, " +
          "and convenience helpers (dismiss, pause, resume, update, waitForClose, pauseOnHoverHandlers).",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// ---- Stories ----

/**
 * Default toast rendered via `useToast()` hook — all type variants.
 */
export const AllTypeVariants: Story = {
  name: "All Type Variants",
  render: function Render() {
    const { store, toast } = useIsolatedToastContext();

    return (
      <div className="story-wrapper">
        <h2>All Type Variants</h2>
        <p className="story-subtitle">
          Shows every toast type rendered via the <code>useToast()</code> hook.
          Each type gets a unique left-border color and icon.
        </p>
        <div className="story-controls">
          {(["success", "error", "warning", "info", "loading"] as const).map(
            (type) => (
              <button
                key={type}
                className={`btn-${type}`}
                onClick={() =>
                  toast[type](
                    {
                      title: type.charAt(0).toUpperCase() + type.slice(1),
                      body: `This is a ${type} toast.`,
                    },
                    { duration: 0 },
                  )
                }
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ),
          )}
          <button className="btn-dismiss" onClick={() => toast.dismissAll()}>
            Dismiss All
          </button>
        </div>
        <Toaster store={store} component={BasicToast} />
      </div>
    );
  },
};

/**
 * Toast without a close button (dismissible: false).
 */
export const NonDismissible: Story = {
  name: "Non-Dismissible",
  render: function Render() {
    const { store, toast } = useIsolatedToastContext();

    return (
      <div className="story-wrapper">
        <h2>Non-Dismissible</h2>
        <p className="story-subtitle">
          Toast without a close button. Set <code>dismissible: false</code> to
          prevent the user from closing it manually.
        </p>
        <div className="story-controls">
          <button
            className="btn-warning"
            onClick={() =>
              toast.warning(
                { title: "Persistent", body: "No close button on this one." },
                { dismissible: false, duration: 0 },
              )
            }
          >
            Add Non-Dismissible Toast
          </button>
          <button className="btn-dismiss" onClick={() => toast.dismissAll()}>
            Dismiss All
          </button>
        </div>
        <Toaster store={store} component={BasicToast} />
      </div>
    );
  },
};

/**
 * Toast with progress bar visible.
 */
export const WithProgressBar: Story = {
  name: "With Progress Bar",
  render: function Render() {
    const { store, toast } = useIsolatedToastContext();

    return (
      <div className="story-wrapper">
        <h2>With Progress Bar</h2>
        <p className="story-subtitle">
          Displays a progress bar that counts down the remaining time before the
          toast auto-dismisses.
        </p>
        <div className="story-controls">
          <button
            className="btn-info"
            onClick={() =>
              toast.info(
                { title: "Downloading", body: "Watch the progress bar..." },
                { progress: true, duration: 5000 },
              )
            }
          >
            Add Toast with Progress
          </button>
        </div>
        <Toaster store={store} component={BasicToast} />
      </div>
    );
  },
};

/**
 * Custom toast component with different visual style.
 */
export const CustomComponent: Story = {
  name: "Custom Component",
  render: function Render() {
    const { store, toast } = useIsolatedToastContext();

    return (
      <div className="story-wrapper">
        <h2>Custom Component</h2>
        <p className="story-subtitle">
          Demonstrates full rendering control via <code>useToast()</code>. The
          toast uses a custom layout with a circular icon, styled text, and a
          minimal close button.
        </p>
        <div className="story-controls">
          <button
            className="btn-success"
            onClick={() =>
              toast.success({
                title: "Custom Render",
                body: "Styled with a custom component.",
              })
            }
          >
            Add Custom Toast
          </button>
          <button
            className="btn-error"
            onClick={() =>
              toast.error({
                title: "Custom Error",
                body: "Different icon and background.",
              })
            }
          >
            Add Custom Error
          </button>
        </div>
        <Toaster store={store} component={CustomStyledToast} />
      </div>
    );
  },
};

/**
 * Interactive dismiss: demonstrates that dismiss() from useToast() works.
 */
export const InteractiveDismiss: Story = {
  name: "Interactive Dismiss",
  render: function Render() {
    const { store, toast } = useIsolatedToastContext();

    return (
      <div className="story-wrapper">
        <h2>Interactive Dismiss</h2>
        <p className="story-subtitle">
          Click the close button on the toast to dismiss it via the
          <code> useToast()</code> hook. The <code>dismiss()</code> function
          triggers the exit animation and removes the toast from the store.
        </p>
        <div className="story-controls">
          <button
            className="btn-info"
            onClick={() =>
              toast.info(
                {
                  title: "Click the X",
                  body: "Dismissing triggers store.dismiss()",
                },
                { duration: 0 },
              )
            }
          >
            Add Dismissible Toast
          </button>
        </div>
        <Toaster store={store} component={BasicToast} />
      </div>
    );
  },
};
