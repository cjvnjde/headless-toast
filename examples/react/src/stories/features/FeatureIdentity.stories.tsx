import { useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DemoToaster } from "../shared/DemoToast";
import { ToastCounter } from "../shared/ToastCounter";
import { useIsolatedToast } from "../shared/useIsolatedToast";

const meta: Meta = {
  title: "Features/Identity",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Examples for toast identity, deduplication, and update-in-place behavior using explicit ids.",
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const DuplicateIdPrevention: Story = {
  name: "Duplicate ID Prevention",
  render: function Render() {
    const toast = useIsolatedToast();
    const counterRef = useRef(0);

    return (
      <div className="story-wrapper">
        <h2>Duplicate ID Prevention</h2>
        <p className="story-subtitle">
          Reusing an id updates an existing toast instead of rendering a
          duplicate.
        </p>
        <div className="story-controls">
          <button
            className="btn-success"
            onClick={() => {
              counterRef.current += 1;
              toast.success(
                {
                  title: "Unique Toast",
                  body: `Updated ${counterRef.current} time(s)`,
                },
                { id: "unique-toast", duration: 0 },
              );
            }}
          >
            Add/Update "unique-toast"
          </button>
          <button
            className="btn-warning"
            onClick={() => {
              toast.warning(
                { title: "Download Progress", body: "Downloading file..." },
                { id: "download", duration: 0 },
              );
            }}
          >
            Set Download (warning)
          </button>
          <button
            className="btn-success"
            onClick={() => {
              toast.success(
                { title: "Download Complete", body: "File saved!" },
                { id: "download", duration: 3000 },
              );
            }}
          >
            Set Download (success)
          </button>
          <button
            className="btn-info"
            onClick={() => {
              toast.info({
                title: "Regular Toast",
                body: "This one gets a fresh ID each time.",
              });
            }}
          >
            Add Regular Toast
          </button>
          <button className="btn-dismiss" onClick={() => toast.dismissAll()}>
            Dismiss All
          </button>
        </div>
        <ToastCounter store={toast} />
        <DemoToaster store={toast} />
      </div>
    );
  },
};
