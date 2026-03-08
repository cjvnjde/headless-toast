import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  ToastCtx,
  useStore,
  useToast,
  useToastAnimation,
} from "@headless-toast/react";
import type { ReactToastStore } from "@headless-toast/react";
import { DemoToast } from "../shared/DemoToast";
import { ToastCounter } from "../shared/ToastCounter";
import { useIsolatedToast } from "../shared/useIsolatedToast";

const TOAST_HEIGHT = 72;
const COLLAPSED_GAP = 12;
const EXPANDED_GAP = 10;
const MAX_VISIBLE_COLLAPSED = 5;

const meta: Meta = {
  title: "Features/Layouts",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Alternative toast layout behaviors, including deck-style collapsed stacks and scrollable overflow containers.",
      },
    },
  },
};

export default meta;

type Story = StoryObj;

function StackedToastItem() {
  const { toast, dismiss } = useToast();
  const { ref, className, attributes, handlers } = useToastAnimation({
    className: "demo-toast",
  });

  return (
    <div
      ref={ref}
      className={className}
      {...handlers}
      {...attributes}
      style={{
        height: TOAST_HEIGHT,
        boxSizing: "border-box",
        width: "100%",
      }}
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
  );
}

function StackedToaster({ store }: { store: ReactToastStore }) {
  const toasts = useStore(store);
  const [isExpanded, setIsExpanded] = useState(false);
  const reversed = [...toasts].reverse();
  const visibleCount = Math.min(reversed.length, MAX_VISIBLE_COLLAPSED);
  const collapsedHeight =
    reversed.length === 0
      ? 0
      : TOAST_HEIGHT + (visibleCount - 1) * COLLAPSED_GAP;
  const expandedHeight =
    reversed.length * TOAST_HEIGHT +
    Math.max(0, reversed.length - 1) * EXPANDED_GAP;
  const containerHeight = isExpanded ? expandedHeight : collapsedHeight;

  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 9999,
        width: 360,
        padding: 16,
      }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div
        style={{
          position: "relative",
          height: containerHeight,
          transition: "height 350ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {reversed.map((toast, index) => {
          const isHidden = !isExpanded && index >= MAX_VISIBLE_COLLAPSED;
          const collapsedY = index * COLLAPSED_GAP;
          const expandedY = index * (TOAST_HEIGHT + EXPANDED_GAP);
          const y = isExpanded ? expandedY : collapsedY;
          const scale = isExpanded ? 1 : Math.max(1 - index * 0.03, 0.92);
          const opacity = isHidden
            ? 0
            : isExpanded
              ? 1
              : Math.max(1 - index * 0.2, 0.3);
          const zIndex = reversed.length - index;

          return (
            <div
              key={toast.id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: TOAST_HEIGHT,
                transform: `translateY(${y}px) scale(${scale})`,
                transformOrigin: "top center",
                opacity,
                transition:
                  "transform 350ms cubic-bezier(0.4, 0, 0.2, 1), opacity 350ms cubic-bezier(0.4, 0, 0.2, 1)",
                zIndex,
                pointerEvents: !isExpanded && index > 0 ? "none" : "auto",
              }}
            >
              <ToastCtx.Provider value={{ toast, store }}>
                <StackedToastItem />
              </ToastCtx.Provider>
            </div>
          );
        })}
      </div>
      {!isExpanded && reversed.length > 1 && (
        <div
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "#9ca3af",
            marginTop: 8,
            transition: "opacity 200ms ease",
          }}
        >
          {reversed.length} notification{reversed.length !== 1 ? "s" : ""} -
          hover to expand
        </div>
      )}
    </div>
  );
}

function ScrollableToaster({ store }: { store: ReactToastStore }) {
  const toasts = useStore(store);

  return (
    <div
      className="scrollable-toast-container"
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 9999,
        maxWidth: 400,
        maxHeight: "calc(100vh - 32px)",
        overflowY: "auto",
        overflowX: "hidden",
        padding: "0 4px 4px 0",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          padding: 16,
        }}
      >
        {toasts.map((toast) => (
          <ToastCtx.Provider value={{ toast, store }} key={toast.id}>
            <DemoToast />
          </ToastCtx.Provider>
        ))}
      </div>
    </div>
  );
}

export const StackedDeck: Story = {
  name: "Stacked (Deck of Cards)",
  render: function Render() {
    const toast = useIsolatedToast();
    const counterRef = useRef(0);
    const types = ["success", "error", "warning", "info"] as const;

    return (
      <div className="story-wrapper">
        <h2>Stacked Toasts (Deck of Cards)</h2>
        <p className="story-subtitle">
          Collapse many notifications into a hover-expandable stack.
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
                  body: `Type: ${type}`,
                },
                { duration: 0 },
              );
            }}
          >
            Add Toast
          </button>
          <button
            onClick={() => {
              for (let index = 0; index < 5; index += 1) {
                counterRef.current += 1;
                const type = types[counterRef.current % types.length];
                toast[type](
                  {
                    title: `Toast #${counterRef.current}`,
                    body: `Type: ${type}`,
                  },
                  { duration: 0 },
                );
              }
            }}
          >
            Add 5 Toasts
          </button>
          <button className="btn-dismiss" onClick={() => toast.dismissAll()}>
            Dismiss All
          </button>
        </div>
        <ToastCounter store={toast} />
        <StackedToaster store={toast} />
      </div>
    );
  },
};

export const ScrollingToasts: Story = {
  name: "Scrolling Toasts",
  render: function Render() {
    const toast = useIsolatedToast();
    const counterRef = useRef(0);
    const types = ["success", "error", "warning", "info"] as const;

    return (
      <div className="story-wrapper">
        <h2>Scrollable Toast Container</h2>
        <p className="story-subtitle">
          Let the container scroll once the toast list grows beyond viewport
          height.
        </p>
        <div className="story-controls">
          <button
            onClick={() => {
              for (let index = 0; index < 20; index += 1) {
                counterRef.current += 1;
                const type = types[counterRef.current % types.length];
                toast[type](
                  {
                    title: `Toast #${counterRef.current}`,
                    body: "Scroll down to see more!",
                  },
                  { duration: 0 },
                );
              }
            }}
          >
            Add 20 Toasts
          </button>
          <button
            className="btn-info"
            onClick={() => {
              counterRef.current += 1;
              const type = types[counterRef.current % types.length];
              toast[type](
                { title: `Toast #${counterRef.current}`, body: "One more!" },
                { duration: 0 },
              );
            }}
          >
            Add 1 Toast
          </button>
          <button className="btn-dismiss" onClick={() => toast.dismissAll()}>
            Dismiss All
          </button>
        </div>
        <ToastCounter store={toast} />
        <ScrollableToaster store={toast} />
      </div>
    );
  },
};
