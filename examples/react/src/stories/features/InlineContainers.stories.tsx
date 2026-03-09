import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DemoToaster } from "../shared/DemoToast";
import { InlineToaster } from "../shared/InlineToast";
import { useIsolatedToast } from "../shared/useIsolatedToast";

const meta: Meta = {
  title: "Features/Inline Containers",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Inline container stories for sidebars, forms, and multiple scoped toast regions using `containerId`.",
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const SidebarInlineToast: Story = {
  name: "Sidebar with Inline Toast",
  render: function Render() {
    const toast = useIsolatedToast();
    const [formValue, setFormValue] = useState("My Project");

    function handleSave() {
      toast.success(
        { title: "Saved", body: "Settings have been saved." },
        { containerId: "sidebar", duration: 3000 },
      );
    }

    function handleError() {
      toast.error(
        { title: "Error", body: "Failed to save settings." },
        { containerId: "sidebar", duration: 4000 },
      );
    }

    function handleGlobalToast() {
      toast.info({
        title: "Global Notification",
        body: "This appears in the portal, not the sidebar.",
      });
    }

    return (
      <div className="story-wrapper">
        <h2>Sidebar with Inline Toast</h2>
        <p className="story-subtitle">
          Scope notifications to local UI regions while keeping global toasts
          available.
        </p>

        <div className="demo-layout">
          <div className="demo-main">
            <h3>Main Content</h3>
            <p>Global toasts still appear in the portal.</p>
            <div className="story-controls">
              <button className="btn-info" onClick={handleGlobalToast}>
                Show Global Toast
              </button>
            </div>
          </div>

          <div className="demo-sidebar">
            <div className="demo-sidebar-header">Settings</div>
            <div className="demo-sidebar-body">
              <label className="demo-field">
                <span className="demo-field-label">Project Name</span>
                <input
                  type="text"
                  className="demo-input"
                  value={formValue}
                  onChange={(event) => setFormValue(event.target.value)}
                />
              </label>
              <label className="demo-field">
                <span className="demo-field-label">Visibility</span>
                <select className="demo-input">
                  <option>Public</option>
                  <option>Private</option>
                </select>
              </label>
            </div>

            <InlineToaster store={toast} containerId="sidebar" inline />

            <div className="demo-sidebar-footer">
              <button className="demo-btn-save" onClick={handleSave}>
                Save
              </button>
              <button className="demo-btn-secondary" onClick={handleError}>
                Simulate Error
              </button>
            </div>
          </div>
        </div>

        <DemoToaster store={toast} />
      </div>
    );
  },
};

export const MultipleContainers: Story = {
  name: "Multiple Inline Containers",
  render: function Render() {
    const toast = useIsolatedToast();

    function addToPanel(
      containerId: string,
      type: "success" | "error" | "warning" | "info",
    ) {
      toast[type](
        {
          title: `${type.charAt(0).toUpperCase() + type.slice(1)}`,
          body: `Scoped to \"${containerId}\"`,
        },
        { containerId, duration: 4000 },
      );
    }

    return (
      <div className="story-wrapper">
        <h2>Multiple Inline Containers</h2>
        <p className="story-subtitle">
          Different parts of the UI can each own their own toast stream.
        </p>

        <div className="demo-panels">
          <div className="demo-panel">
            <div className="demo-panel-header">Panel A</div>
            <div className="demo-panel-body">
              <p>Toasts scoped to this panel.</p>
              <div className="story-controls">
                <button
                  className="btn-success"
                  onClick={() => addToPanel("panel-a", "success")}
                >
                  Success
                </button>
                <button
                  className="btn-error"
                  onClick={() => addToPanel("panel-a", "error")}
                >
                  Error
                </button>
              </div>
            </div>
            <InlineToaster store={toast} containerId="panel-a" inline />
          </div>

          <div className="demo-panel">
            <div className="demo-panel-header">Panel B</div>
            <div className="demo-panel-body">
              <p>Toasts scoped to this panel.</p>
              <div className="story-controls">
                <button
                  className="btn-warning"
                  onClick={() => addToPanel("panel-b", "warning")}
                >
                  Warning
                </button>
                <button
                  className="btn-info"
                  onClick={() => addToPanel("panel-b", "info")}
                >
                  Info
                </button>
              </div>
            </div>
            <InlineToaster store={toast} containerId="panel-b" inline />
          </div>
        </div>

        <div className="story-controls" style={{ marginTop: 16 }}>
          <button
            className="btn-info"
            onClick={() => {
              toast.info({
                title: "Global Toast",
                body: "No containerId - appears in the portal.",
              });
            }}
          >
            Global Toast
          </button>
          <button className="btn-dismiss" onClick={() => toast.dismissAll()}>
            Dismiss All
          </button>
        </div>

        <DemoToaster store={toast} />
      </div>
    );
  },
};

export const FormValidation: Story = {
  name: "Form Validation Feedback",
  render: function Render() {
    const toast = useIsolatedToast();
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");

    function handleSubmit(event: React.FormEvent) {
      event.preventDefault();
      const errors: string[] = [];

      if (!name.trim()) errors.push("Name is required.");
      if (!email.trim()) errors.push("Email is required.");
      else if (!email.includes("@")) errors.push("Email must be valid.");

      if (errors.length > 0) {
        toast.error(
          { title: "Validation Failed", body: errors.join(" ") },
          { containerId: "form-feedback", duration: 5000 },
        );
        return;
      }

      toast.success(
        { title: "Submitted", body: "Form submitted successfully!" },
        { containerId: "form-feedback", duration: 3000 },
      );
    }

    return (
      <div className="story-wrapper">
        <h2>Form Validation Feedback</h2>
        <p className="story-subtitle">
          Keep validation feedback next to the form instead of at the viewport
          edge.
        </p>

        <form className="demo-form" onSubmit={handleSubmit}>
          <label className="demo-field">
            <span className="demo-field-label">Name</span>
            <input
              className="demo-input"
              type="text"
              value={name}
              placeholder="Jane Doe"
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label className="demo-field">
            <span className="demo-field-label">Email</span>
            <input
              className="demo-input"
              type="text"
              value={email}
              placeholder="jane@example.com"
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <InlineToaster store={toast} containerId="form-feedback" inline />

          <button className="demo-btn-save" type="submit">
            Submit
          </button>
        </form>
      </div>
    );
  },
};
