import type { ArgTypes, Parameters } from "@storybook/react";

type StoryDocSection = {
  title: string;
  language: string;
  code: string;
};

function stripIndent(value: string) {
  const lines = value.replace(/^\n+|\n+$/g, "").split("\n");
  const indents = lines
    .filter((line) => line.trim().length > 0)
    .map((line) => line.match(/^\s*/)![0].length);
  const baseIndent = indents.length > 0 ? Math.min(...indents) : 0;

  return lines.map((line) => line.slice(baseIndent)).join("\n");
}

function renderMarkdownSections(sections: StoryDocSection[]) {
  return sections
    .map(
      (section) =>
        `\n\n#### ${section.title}\n\n\
\`\`\`${section.language}\n${stripIndent(section.code)}\n\`\`\``,
    )
    .join("");
}

function createStoryDocs(
  description: string,
  sourceCode: string,
  sections: StoryDocSection[] = [],
): Parameters {
  return {
    docs: {
      description: {
        story: `${description}${renderMarkdownSections(sections)}`,
      },
      source: {
        code: stripIndent(sourceCode),
        language: "tsx",
      },
    },
  };
}

const demoToasterImplementation = `
import { Toaster, useToast, useToastAnimation } from "@headless-toast/react";
import type { ReactToastStore } from "@headless-toast/react";

function DemoToast() {
  const { toast: currentToast, dismiss, pauseOnHoverHandlers } = useToast();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className: "demo-toast",
  });

  return (
    <article
      ref={ref}
      className={className}
      {...handlers}
      {...pauseOnHoverHandlers}
      {...attributes}
    >
      {currentToast.data.title ? <strong>{String(currentToast.data.title)}</strong> : null}
      {currentToast.data.body ? <p>{String(currentToast.data.body)}</p> : null}
      {currentToast.options.dismissible !== false ? (
        <button type="button" className="toast-close" onClick={() => dismiss("user")}>
          &times;
        </button>
      ) : null}
    </article>
  );
}

export function DemoToaster({ store }: { store: ReactToastStore }) {
  return (
    <Toaster store={store}>
      <Toaster.List>
        <DemoToast />
      </Toaster.List>
    </Toaster>
  );
}
`;

const demoToasterStyles = `
.demo-toast {
  pointer-events: auto;
  position: relative;
  display: flex;
  gap: 12px;
  width: min(24rem, 100%);
  padding: 14px 16px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.14);
}

.demo-toast[data-toast-status="entering"] {
  animation: toast-enter 300ms ease-out;
}

.demo-toast[data-toast-status="exiting"][data-toast-swipe-dismissed="false"] {
  animation: toast-exit 300ms ease-in forwards;
}

@keyframes toast-enter {
  from {
    opacity: 0;
    transform: translateY(-12px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes toast-exit {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  to {
    opacity: 0;
    transform: translateY(-12px) scale(0.95);
  }
}
`;

const inlineToasterImplementation = `
import { Toaster, useToast, useToastAnimation } from "@headless-toast/react";
import type { ReactToastStore } from "@headless-toast/react";

function InlineToast() {
  const { toast: currentToast, dismiss } = useToast();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className: "inline-toast",
  });

  return (
    <div ref={ref} className={className} {...handlers} {...attributes}>
      <div className="inline-toast-content">
        <strong>{String(currentToast.data.title)}</strong>
        <span>{String(currentToast.data.body)}</span>
      </div>
      <button type="button" className="inline-toast-close" onClick={() => dismiss("user")}>
        &times;
      </button>
    </div>
  );
}

export function InlineToaster({
  store,
  containerId,
}: {
  store: ReactToastStore;
  containerId: string;
}) {
  return (
    <Toaster store={store} containerId={containerId} inline>
      <Toaster.List>
        <InlineToast />
      </Toaster.List>
    </Toaster>
  );
}
`;

const inlineToasterStyles = `
.inline-toast {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border-radius: 14px;
  background: linear-gradient(180deg, #ffffff, #f8fafc);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.inline-toast[data-toast-status="entering"] {
  animation: toast-enter 300ms ease-out;
}
`;

const tailwindAnimationStyles = `
.toast-shell[data-toast-status="entering"] {
  animation: toast-tailwind-enter 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-shell[data-toast-status="exiting"][data-toast-swipe-dismissed="false"] {
  animation: toast-tailwind-exit 240ms ease-in forwards;
}

.toast-shell[data-toast-status="exiting"][data-toast-swipe-dismissed="true"] {
  animation: toast-tailwind-swipe-exit 240ms ease-in forwards;
}
`;

function withCodeDocs(
  description: string,
  sourceCode = "// See the story description below for reproduction code.",
  sections?: StoryDocSection[],
) {
  return createStoryDocs(description, sourceCode, sections);
}

function withDemoToasterDocs(description: string, triggerCode: string) {
  return createStoryDocs(description, demoToasterImplementation, [
    {
      title: "Story trigger",
      language: "tsx",
      code: triggerCode,
    },
    {
      title: "Shared demo CSS",
      language: "css",
      code: demoToasterStyles,
    },
  ]);
}

function withInlineToasterDocs(description: string, triggerCode: string) {
  return createStoryDocs(description, inlineToasterImplementation, [
    {
      title: "Story trigger",
      language: "tsx",
      code: triggerCode,
    },
    {
      title: "Inline toaster CSS",
      language: "css",
      code: inlineToasterStyles,
    },
  ]);
}

function withTailwindToasterDocs(
  description: string,
  sourceCode: string,
  triggerCode: string,
) {
  return createStoryDocs(description, sourceCode, [
    {
      title: "Story trigger",
      language: "tsx",
      code: triggerCode,
    },
    {
      title: "Tailwind animation CSS",
      language: "css",
      code: tailwindAnimationStyles,
    },
  ]);
}

const noControlsParameters = {
  controls: {
    disable: true,
  },
} satisfies Parameters;

const toasterArgTypes = {
  store: {
    control: false,
    description: "Toast store instance returned by `createToast()`.",
    table: {
      type: {
        summary: "ReactToastStore",
      },
    },
  },
  children: {
    control: false,
    description:
      "Toast markup rendered once for each toast through toaster context.",
    table: {
      type: {
        summary: "ReactNode",
      },
    },
  },
  className: {
    control: "text",
    description: "Class applied to the toast region wrapper.",
    table: {
      type: {
        summary: "string | undefined",
      },
    },
  },
  containerId: {
    control: "text",
    description: "Only render toasts with the matching `containerId`.",
    table: {
      type: {
        summary: "string | undefined",
      },
    },
  },
  inline: {
    control: "boolean",
    description: "Render in place instead of portal-ing to `document.body`.",
    table: {
      defaultValue: {
        summary: "false",
      },
      type: {
        summary: "boolean | undefined",
      },
    },
  },
} satisfies ArgTypes;

const animationWrapperArgTypes = {
  className: {
    control: "text",
    description: "Extra class applied to the wrapper element.",
    table: {
      type: {
        summary: "string | undefined",
      },
    },
  },
  children: {
    control: false,
    description: "Your toast content.",
    table: {
      type: {
        summary: "ReactNode",
      },
    },
  },
  style: {
    control: false,
    description: "Inline styles, commonly used for drag transforms.",
    table: {
      type: {
        summary: "CSSProperties | undefined",
      },
    },
  },
  swipeDismissed: {
    control: "boolean",
    description:
      "Marks swipe-driven exits so you can style a different exit animation.",
    table: {
      type: {
        summary: "boolean | undefined",
      },
    },
  },
  onPointerDown: {
    control: false,
    table: {
      type: {
        summary: "PointerEventHandler | undefined",
      },
    },
  },
  onPointerMove: {
    control: false,
    table: {
      type: {
        summary: "PointerEventHandler | undefined",
      },
    },
  },
  onPointerUp: {
    control: false,
    table: {
      type: {
        summary: "PointerEventHandler | undefined",
      },
    },
  },
  onPointerCancel: {
    control: false,
    table: {
      type: {
        summary: "PointerEventHandler | undefined",
      },
    },
  },
  onLostPointerCapture: {
    control: false,
    table: {
      type: {
        summary: "PointerEventHandler | undefined",
      },
    },
  },
} satisfies ArgTypes;

export {
  animationWrapperArgTypes,
  noControlsParameters,
  toasterArgTypes,
  withCodeDocs,
  withDemoToasterDocs,
  withInlineToasterDocs,
  withTailwindToasterDocs,
};
