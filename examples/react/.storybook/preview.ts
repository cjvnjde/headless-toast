import type { Preview } from "@storybook/react";
import { headlessToastTheme } from "./theme";
import "../src/stories/toast.css";
import "../src/stories/tailwind.css";

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: [
          "Docs",
          ["Getting Started", "Usage Patterns", "Advanced Recipes"],
          "Components",
          [
            "Toaster",
            ["Basics", "Behavior", "Async", "Customization", "Tailwind"],
            "AnimationWrapper",
          ],
          "Hooks",
          ["useToast", "useToastDrag", "useStore"],
          "Features",
          ["Inline Containers", "Limits", "Layouts", "Identity", "Integration"],
          "Advanced Integrations",
          ["Framer Motion", "Swipe Gestures", "Floating UI", "Drag Placement"],
        ],
      },
    },
    controls: {
      expanded: true,
      sort: "requiredFirst",
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      theme: headlessToastTheme,
      toc: {
        headingSelector: "h2, h3",
        title: "On this page",
      },
    },
  },
};

export default preview;
