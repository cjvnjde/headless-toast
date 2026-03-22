type ExampleMeta = {
  path: string;
  title: string;
  summary: string;
  category: "Fundamentals" | "Rendering" | "State" | "Inline" | "Advanced";
  tags: string[];
  featured?: boolean;
};

const examples = [
  {
    path: "/fundamentals/basic-variants",
    title: "Basic variants",
    summary:
      "Success, error, warning, info, and loading toasts with one toast component.",
    category: "Fundamentals",
    tags: ["createToast", "useToast", "Toaster"],
    featured: true,
  },
  {
    path: "/fundamentals/placements",
    title: "Placements",
    summary: "Trigger the same toast in every built-in placement.",
    category: "Fundamentals",
    tags: ["placement", "layout"],
  },
  {
    path: "/fundamentals/countdown-progress",
    title: "Countdown progress",
    summary: "Progress bars and pause-on-hover for readable auto-close toasts.",
    category: "Fundamentals",
    tags: ["progress", "pauseOnHover"],
    featured: true,
  },
  {
    path: "/fundamentals/progress-callback",
    title: "Progress callback",
    summary:
      "Drive DOM updates and side effects from progress ticks without re-rendering the toast body.",
    category: "Fundamentals",
    tags: ["progress", "useProgressEffect"],
  },
  {
    path: "/fundamentals/persistent-toast",
    title: "Persistent toast",
    summary:
      "A non-dismissible toast that stays until your app updates or dismisses it.",
    category: "Fundamentals",
    tags: ["dismissible", "duration"],
  },
  {
    path: "/fundamentals/promise-lifecycle",
    title: "Promise lifecycle",
    summary:
      "Map loading, success, and error states to one promise-driven toast.",
    category: "Fundamentals",
    tags: ["promise", "async"],
    featured: true,
  },
  {
    path: "/fundamentals/wait-for-close",
    title: "Wait for close",
    summary:
      "Use handle.closed when follow-up work should wait until a toast fully leaves.",
    category: "Fundamentals",
    tags: ["handle.closed", "close reason"],
    featured: true,
  },
  {
    path: "/rendering/custom-component",
    title: "Custom component",
    summary:
      "Swap in your own toast markup and styling while keeping the same store.",
    category: "Rendering",
    tags: ["useToast", "custom UI"],
  },
  {
    path: "/rendering/animation-wrapper",
    title: "AnimationWrapper",
    summary:
      "Use the convenience wrapper when one animated outer element is enough.",
    category: "Rendering",
    tags: ["AnimationWrapper", "CSS animations"],
  },
  {
    path: "/rendering/tailwind-styled",
    title: "Tailwind styled",
    summary:
      "A fully Tailwind v4 toast implementation using emitted data attributes.",
    category: "Rendering",
    tags: ["Tailwind", "data attributes"],
    featured: true,
  },
  {
    path: "/state/duplicate-id",
    title: "Duplicate id updates",
    summary:
      "Reuse a stable id to update an existing toast instead of creating duplicates.",
    category: "State",
    tags: ["id", "update"],
  },
  {
    path: "/state/undo-window",
    title: "Undo window",
    summary:
      "Delay destructive work until the toast closes and branch on the close reason.",
    category: "State",
    tags: ["handle.closed", "undo"],
    featured: true,
  },
  {
    path: "/state/store-inspector",
    title: "Store inspector",
    summary:
      "Use useStore() to render live toast state and compare multiple stores.",
    category: "State",
    tags: ["useStore", "multiple stores"],
  },
  {
    path: "/state/outside-react",
    title: "Outside React",
    summary:
      "Trigger toasts from timers, interceptors, and any module outside the React tree.",
    category: "State",
    tags: ["service layer", "plain JS"],
  },
  {
    path: "/state/max-toasts",
    title: "Max toasts",
    summary:
      "Cap visible notifications and stress-test the queue with rapid bursts.",
    category: "State",
    tags: ["maxToasts", "stress test"],
  },
  {
    path: "/state/stacked-deck",
    title: "Stacked deck",
    summary: "Render a hover-expandable deck of toast cards with useStore().",
    category: "State",
    tags: ["custom layout", "stacked"],
  },
  {
    path: "/state/scrollable-tray",
    title: "Scrollable tray",
    summary:
      "Build a scrollable toast surface for notification-heavy workflows.",
    category: "State",
    tags: ["custom layout", "scroll"],
  },
  {
    path: "/inline/inline-sidebar",
    title: "Inline sidebar",
    summary:
      "Route form feedback into a local sidebar container while keeping global toasts.",
    category: "Inline",
    tags: ["containerId", "inline"],
  },
  {
    path: "/inline/multiple-containers",
    title: "Multiple containers",
    summary:
      "Let different panels own independent toast streams from the same store.",
    category: "Inline",
    tags: ["containerId", "panels"],
  },
  {
    path: "/inline/form-validation",
    title: "Form validation",
    summary:
      "Keep validation feedback next to the form instead of the viewport edge.",
    category: "Inline",
    tags: ["forms", "inline"],
  },
  {
    path: "/advanced/drag-to-dismiss",
    title: "Drag to dismiss",
    summary:
      "Use custom gesture logic to keep a toast at its released position while it exits.",
    category: "Advanced",
    tags: ["gesture", "custom motion"],
  },
  {
    path: "/advanced/drag-reposition",
    title: "Drag to reposition",
    summary:
      "Treat placement as state and drop toasts into a different viewport zone.",
    category: "Advanced",
    tags: ["placement", "drag"],
  },
  {
    path: "/advanced/floating-anchor",
    title: "Floating anchor",
    summary: "Attach a toast stack to another element with Floating UI.",
    category: "Advanced",
    tags: ["Floating UI", "anchored"],
  },
  {
    path: "/advanced/framer-motion",
    title: "Framer Motion",
    summary:
      "Replace CSS transitions with motion-powered enter and exit animations.",
    category: "Advanced",
    tags: ["Framer Motion", "custom animation"],
  },
  {
    path: "/advanced/swipe-pin-dismiss",
    title: "Swipe to pin or dismiss",
    summary:
      "Swipe left to pin a toast or right to dismiss it with custom gesture logic.",
    category: "Advanced",
    tags: ["gesture", "update"],
    featured: true,
  },
] satisfies ExampleMeta[];

const categories = [
  "Fundamentals",
  "Rendering",
  "State",
  "Inline",
  "Advanced",
] as const;

function groupExamples() {
  return categories.map((category) => ({
    category,
    items: examples.filter((example) => example.category === category),
  }));
}

export { categories, examples, groupExamples };
export type { ExampleMeta };
