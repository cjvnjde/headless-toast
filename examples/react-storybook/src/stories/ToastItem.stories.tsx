import type { Meta, StoryObj } from "@storybook/react";
import { Toaster, useToast, useToastAnimation } from "@headless-toast/react";
import { noControlsParameters, withCodeDocs } from "./shared/storybookDocs";
import { useIsolatedToast } from "./shared/useIsolatedToast";

function BasicToast() {
  const { toast: currentToast, dismiss, pauseOnHoverHandlers } = useToast();
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
      {currentToast.data.title ? (
        <strong>{String(currentToast.data.title)}</strong>
      ) : null}
      {currentToast.data.body ? <p>{String(currentToast.data.body)}</p> : null}
      {currentToast.options.dismissible !== false ? (
        <button
          className="toast-close"
          onClick={() => dismiss("user")}
          aria-label="Close"
        >
          &times;
        </button>
      ) : null}
      {currentToast.options.progress ? (
        <div
          className="toast-progress"
          style={{ width: `${currentToast.progress * 100}%` }}
          role="progressbar"
          aria-valuenow={Math.round(currentToast.progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      ) : null}
    </div>
  );
}

function CustomStyledToast() {
  const { toast: currentToast, dismiss } = useToast();
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
              currentToast.type === "success"
                ? "#dcfce7"
                : currentToast.type === "error"
                  ? "#fee2e2"
                  : "#dbeafe",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          {currentToast.type === "success"
            ? "\u2713"
            : currentToast.type === "error"
              ? "\u2717"
              : "\u2139"}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>
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
    controls: {
      disable: true,
    },
    docs: {
      description: {
        component:
          "`useToast()` is the hook you call inside your toast item component. It gives you the current toast state plus actions such as `dismiss()`, `update()`, `pause()`, `resume()`, `markEntered()`, and `markExited()`.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const AllTypeVariants: Story = {
  name: "All Type Variants",
  parameters: {
    ...noControlsParameters,
    ...withCodeDocs(
      "Use `useToast()` when one component should render every toast variant and react to the current toast state directly.",
      `function BasicToast() {
  const { toast: currentToast, dismiss, pauseOnHoverHandlers } = useToast();
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
      <strong>{String(currentToast.data.title)}</strong>
      {currentToast.data.body ? <p>{String(currentToast.data.body)}</p> : null}
      <button type="button" className="toast-close" onClick={() => dismiss("user")}>
        &times;
      </button>
    </div>
  );
}`,
    ),
  },
  render: function Render() {
    const toastStore = useIsolatedToast();

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
                  toastStore[type](
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
          <button
            className="btn-dismiss"
            onClick={() => toastStore.dismissAll()}
          >
            Dismiss All
          </button>
        </div>
        <Toaster store={toastStore}>
          <Toaster.List>
            <BasicToast />
          </Toaster.List>
        </Toaster>
      </div>
    );
  },
};

export const NonDismissible: Story = {
  name: "Non-Dismissible",
  parameters: {
    ...noControlsParameters,
    ...withCodeDocs(
      "Read `toast.options.dismissible` from `useToast()` and decide whether your component should show a close affordance.",
      `toastStore.warning(
  { title: "Persistent", body: "No close button on this one." },
  { dismissible: false, duration: 0 },
);`,
    ),
  },
  render: function Render() {
    const toastStore = useIsolatedToast();

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
              toastStore.warning(
                { title: "Persistent", body: "No close button on this one." },
                { dismissible: false, duration: 0 },
              )
            }
          >
            Add Non-Dismissible Toast
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
            <BasicToast />
          </Toaster.List>
        </Toaster>
      </div>
    );
  },
};

export const WithProgressBar: Story = {
  name: "With Progress Bar",
  parameters: {
    ...noControlsParameters,
    ...withCodeDocs(
      "Use `toast.progress` from `useToast()` to build a progress bar or countdown UI inside your custom toast component.",
      `toastStore.info(
  { title: "Downloading", body: "Watch the progress bar..." },
  { progress: true, duration: 5000 },
);`,
    ),
  },
  render: function Render() {
    const toastStore = useIsolatedToast();

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
              toastStore.info(
                { title: "Downloading", body: "Watch the progress bar..." },
                { progress: true, duration: 5000 },
              )
            }
          >
            Add Toast with Progress
          </button>
        </div>
        <Toaster store={toastStore}>
          <Toaster.List>
            <BasicToast />
          </Toaster.List>
        </Toaster>
      </div>
    );
  },
};

export const CustomComponent: Story = {
  name: "Custom Component",
  parameters: {
    ...noControlsParameters,
    ...withCodeDocs(
      "`useToast()` is not tied to any specific markup. Use it to plug toast state into your own design-system component or branded layout.",
      `function CustomStyledToast() {
  const { toast: currentToast, dismiss } = useToast();
  const { ref, className, attributes, handlers } = useToastAnimation();

  return (
    <div ref={ref} className={className} {...handlers} {...attributes}>
      <div style={{ display: "flex", gap: 12, width: "100%" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%" }} />
        <div style={{ flex: 1 }}>
          <div>{String(currentToast.data.title)}</div>
          <div>{String(currentToast.data.body)}</div>
        </div>
        <button type="button" onClick={() => dismiss("user")}>
          &times;
        </button>
      </div>
    </div>
  );
}`,
    ),
  },
  render: function Render() {
    const toastStore = useIsolatedToast();

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
              toastStore.success({
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
              toastStore.error({
                title: "Custom Error",
                body: "Different icon and background.",
              })
            }
          >
            Add Custom Error
          </button>
        </div>
        <Toaster store={toastStore}>
          <Toaster.List>
            <CustomStyledToast />
          </Toaster.List>
        </Toaster>
      </div>
    );
  },
};

export const InteractiveDismiss: Story = {
  name: "Interactive Dismiss",
  parameters: {
    ...noControlsParameters,
    ...withCodeDocs(
      "Call `dismiss()` from the hook to trigger exit animation and cleanup from any element inside your custom toast component.",
      `const { dismiss } = useToast();

<button type="button" onClick={() => dismiss("user")}>
  Close
</button>;`,
    ),
  },
  render: function Render() {
    const toastStore = useIsolatedToast();

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
              toastStore.info(
                {
                  title: "Click the X",
                  body: "Dismissing triggers toast.dismiss()",
                },
                { duration: 0 },
              )
            }
          >
            Add Dismissible Toast
          </button>
        </div>
        <Toaster store={toastStore}>
          <Toaster.List>
            <BasicToast />
          </Toaster.List>
        </Toaster>
      </div>
    );
  },
};
