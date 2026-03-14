import { useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DemoToaster } from "../shared/DemoToast";
import { noControlsParameters, withCodeDocs } from "../shared/storybookDocs";
import { ToastCounter } from "../shared/ToastCounter";
import { useIsolatedToast } from "../shared/useIsolatedToast";

const meta: Meta = {
  title: "Features/Limits",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Store-level limits let you cap how many visible toasts can exist at once. When the limit is reached, the oldest visible toast exits first.",
      },
    },
  },
};

export default meta;

type Story = StoryObj;

function MaxToastsStory({ maxToasts }: { maxToasts: number }) {
  const toast = useIsolatedToast({ maxToasts });
  const counterRef = useRef(0);
  const types = ["success", "error", "warning", "info"] as const;

  return (
    <div className="story-wrapper">
      <h2>Max Toasts ({maxToasts})</h2>
      <p className="story-subtitle">
        Once the store reaches {maxToasts} visible toasts, adding another toast
        dismisses the oldest one first.
      </p>
      <div className="story-controls">
        <button
          className="btn-info"
          onClick={() => {
            counterRef.current += 1;
            const type = types[counterRef.current % types.length];
            toast[type](
              {
                title: `Toast #${counterRef.current}`,
                body: `Only ${maxToasts} visible at once.`,
              },
              { duration: 0 },
            );
          }}
        >
          Add Toast
        </button>
        <button
          onClick={() => {
            for (let index = 0; index < maxToasts * 2; index += 1) {
              counterRef.current += 1;
              const type = types[counterRef.current % types.length];
              toast[type](
                {
                  title: `Toast #${counterRef.current}`,
                  body: "Rapid fire!",
                },
                { duration: 0 },
              );
            }
          }}
        >
          Add {maxToasts * 2} Rapidly
        </button>
        <button className="btn-dismiss" onClick={() => toast.dismissAll()}>
          Dismiss All
        </button>
      </div>
      <ToastCounter store={toast} />
      <DemoToaster store={toast} />
    </div>
  );
}

export const MaxToasts3: Story = {
  name: "Max Toasts (3)",
  parameters: {
    ...noControlsParameters,
    ...withCodeDocs(
      "Use `maxToasts` when a product surface should never grow into an unreadable wall of notifications.",
      `const { toast: toastStore } = createToast({ maxToasts: 3 });`,
    ),
  },
  render: function Render() {
    return <MaxToastsStory maxToasts={3} />;
  },
};

export const MaxToasts5: Story = {
  name: "Max Toasts (5)",
  parameters: {
    ...noControlsParameters,
    ...withCodeDocs(
      "Increase the cap when the surface can tolerate more simultaneous notifications without overwhelming the user.",
      `const { toast: toastStore } = createToast({ maxToasts: 5 });`,
    ),
  },
  render: function Render() {
    return <MaxToastsStory maxToasts={5} />;
  },
};
