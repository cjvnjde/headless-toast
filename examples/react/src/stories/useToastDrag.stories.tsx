import type { Meta, StoryObj } from "@storybook/react";
import { Toaster } from "@headless-toast/react";
import { useToast } from "@headless-toast/react";
import { useToastAnimation } from "@headless-toast/react";
import { useToastDrag } from "@headless-toast/react";
import { useIsolatedToast } from "./shared/useIsolatedToast";

// ---- Shared draggable toast component ----

/**
 * Example toast component with drag-to-dismiss support.
 * Uses all three hooks — no props needed.
 */
function DraggableToast() {
  const { toast, dismiss, pauseOnHoverHandlers } = useToast();
  const drag = useToastDrag();
  const { ref, className, attributes, handlers } = useToastAnimation({
    className: "demo-toast",
    swipeDismissed: drag.swipeDismissed,
  });

  return (
    <div {...pauseOnHoverHandlers}>
      <div
        ref={ref}
        className={className}
        style={drag.style}
        {...handlers}
        {...drag.handlers}
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
      </div>
    </div>
  );
}

const meta: Meta = {
  title: "Hooks/useToastDrag",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "`useToastDrag` provides drag-to-dismiss functionality for individual toasts. " +
          "It captures pointer events and feeds them into core's `computeDragState` function. " +
          "Drag horizontally to dismiss a toast.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// ---- Stories ----

/**
 * Drag a toast sideways to dismiss it. The hook applies `transform` styles
 * during the gesture and snaps back on release if the threshold isn't met.
 */
export const DragToDismiss: Story = {
  name: "Drag to Dismiss",
  render: function Render() {
    const toast = useIsolatedToast();

    return (
      <div className="story-wrapper">
        <h2>Drag to Dismiss</h2>
        <p className="story-subtitle">
          Pointer-drag the toast horizontally past the threshold to dismiss it.
          Release before the threshold to snap back into place.
        </p>
        <div className="story-controls">
          <button
            className="btn-info"
            onClick={() =>
              toast.info(
                { title: "Drag me", body: "Swipe left or right to dismiss." },
                { draggable: true, duration: 0 },
              )
            }
          >
            Add Draggable Toast
          </button>
        </div>
        <Toaster store={toast} component={DraggableToast} />
      </div>
    );
  },
};

/**
 * Draggable toast with a custom direction configuration.
 */
export const DragDirections: Story = {
  name: "Drag Directions",
  render: function Render() {
    const toast = useIsolatedToast();

    return (
      <div className="story-wrapper">
        <h2>Drag Directions</h2>
        <p className="story-subtitle">
          Configure the drag axis and threshold. Choose horizontal-only,
          vertical-only, or both axes with a custom pixel threshold.
        </p>
        <div className="story-controls">
          <button
            onClick={() =>
              toast.info(
                { title: "Horizontal", body: "Drag left/right only." },
                { draggable: { direction: "x", threshold: 100 }, duration: 0 },
              )
            }
          >
            Horizontal (x)
          </button>
          <button
            onClick={() =>
              toast.info(
                { title: "Vertical", body: "Drag up/down only." },
                { draggable: { direction: "y", threshold: 100 }, duration: 0 },
              )
            }
          >
            Vertical (y)
          </button>
          <button
            onClick={() =>
              toast.info(
                { title: "Both Axes", body: "Drag in any direction." },
                {
                  draggable: { direction: "both", threshold: 100 },
                  duration: 0,
                },
              )
            }
          >
            Both Axes
          </button>
        </div>
        <Toaster store={toast} component={DraggableToast} />
      </div>
    );
  },
};
