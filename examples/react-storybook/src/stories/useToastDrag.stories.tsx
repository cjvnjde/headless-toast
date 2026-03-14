import type { Meta, StoryObj } from "@storybook/react";
import {
  Toaster,
  useToast,
  useToastAnimation,
  useToastDrag,
} from "@headless-toast/react";
import { noControlsParameters, withCodeDocs } from "./shared/storybookDocs";
import { useIsolatedToast } from "./shared/useIsolatedToast";

function DraggableToast() {
  const { toast: currentToast, dismiss, pauseOnHoverHandlers } = useToast();
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
    </div>
  );
}

const meta: Meta = {
  title: "Hooks/useToastDrag",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    controls: {
      disable: true,
    },
    docs: {
      description: {
        component:
          "`useToastDrag()` adds pointer-based drag and swipe-to-dismiss behavior to a single toast. Pair it with `useToastAnimation()` so swipe exits can use a different exit animation state.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const DragToDismiss: Story = {
  name: "Drag to Dismiss",
  parameters: {
    ...noControlsParameters,
    ...withCodeDocs(
      "Use the built-in drag hook when you want pointer-driven swipe dismissal without bringing in another gesture library.",
      `const drag = useToastDrag();
const animation = useToastAnimation({
  className: "demo-toast",
  swipeDismissed: drag.swipeDismissed,
});

<div
  ref={animation.ref}
  className={animation.className}
  style={drag.style}
  {...animation.handlers}
  {...drag.handlers}
  {...animation.attributes}
/>;`,
    ),
  },
  render: function Render() {
    const toastStore = useIsolatedToast();

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
              toastStore.info(
                { title: "Drag me", body: "Swipe left or right to dismiss." },
                { draggable: true, duration: 0 },
              )
            }
          >
            Add Draggable Toast
          </button>
        </div>
        <Toaster store={toastStore}>
          <Toaster.List>
            <DraggableToast />
          </Toaster.List>
        </Toaster>
      </div>
    );
  },
};

export const DragDirections: Story = {
  name: "Drag Directions",
  parameters: {
    ...noControlsParameters,
    ...withCodeDocs(
      "Pass a draggable config to control axis and threshold. This is useful when your UI should allow only horizontal swipe, only vertical dismissal, or both.",
      `toastStore.info(
  { title: "Horizontal", body: "Drag left or right only." },
  { draggable: { direction: "x", threshold: 100 }, duration: 0 },
);`,
    ),
  },
  render: function Render() {
    const toastStore = useIsolatedToast();

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
              toastStore.info(
                { title: "Horizontal", body: "Drag left or right only." },
                { draggable: { direction: "x", threshold: 100 }, duration: 0 },
              )
            }
          >
            Horizontal (x)
          </button>
          <button
            onClick={() =>
              toastStore.info(
                { title: "Vertical", body: "Drag up or down only." },
                { draggable: { direction: "y", threshold: 100 }, duration: 0 },
              )
            }
          >
            Vertical (y)
          </button>
          <button
            onClick={() =>
              toastStore.info(
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
        <Toaster store={toastStore}>
          <Toaster.List>
            <DraggableToast />
          </Toaster.List>
        </Toaster>
      </div>
    );
  },
};
