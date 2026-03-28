import {
  Toaster,
  createToast,
  useToast,
  useToastAnimation,
} from "@headless-toast/react";
import { ExamplePage } from "#/components/ExamplePage";
import { extractExampleSource } from "#/lib/exampleSource";
import "./toast.css";
import rawSource from "./plain-css.tsx?raw";
import toastCss from "./toast.css?raw";

const toast = createToast<{ title: string; body: string }>({
  defaults: { placement: "top-right", pauseOnHover: true, duration: 4200 },
}).toast;

function PlainCssToast() {
  const { toast, dismiss } = useToast<{
    title: string;
    body: string;
  }>();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className: "plain-css-toast",
  });

  return (
    <article ref={ref} className={className} {...handlers} {...attributes}>
      <div className="plain-css-toast__content">
        <p className="plain-css-toast__title">{toast.data.title}</p>
        <p className="plain-css-toast__body">{toast.data.body}</p>
      </div>
      <button
        type="button"
        aria-label="Close toast"
        className="plain-css-toast__close"
        onClick={() => dismiss("user")}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="plain-css-toast__close-icon"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        >
          <path d="M4 4l8 8" />
          <path d="M12 4 4 12" />
        </svg>
      </button>
    </article>
  );
}

function PlainCssPreview() {
  return (
    <div className="plain-css-preview">
      <div className="plain-css-actions">
        <button
          type="button"
          className="plain-css-button"
          onClick={() =>
            toast.success({
              title: "Saved",
              body: "This example is styled with regular CSS classes.",
            })
          }
        >
          Trigger plain CSS toast
        </button>
        <button
          type="button"
          className="plain-css-button plain-css-button--secondary"
          onClick={() =>
            toast.info({
              title: "No Tailwind required",
              body: "Use data attributes and a stylesheet if that fits your stack better.",
            })
          }
        >
          Show secondary state
        </button>
      </div>

      <Toaster store={toast} className="plain-css-viewport">
        <Toaster.List className="plain-css-stack">
          <PlainCssToast />
        </Toaster.List>
      </Toaster>
    </div>
  );
}

const code = extractExampleSource(rawSource);

function PlainCssPage() {
  return (
    <ExamplePage
      category="Rendering"
      title="Plain CSS"
      summary="You do not need Tailwind to style headless-toast. Regular CSS classes and data-attribute selectors work well when your app uses a different styling approach."
      files={[
        { filename: "plain-css.tsx", language: "tsx", code },
        { filename: "toast.css", language: "css", code: toastCss },
      ]}
      preview={<PlainCssPreview />}
    />
  );
}

export { PlainCssPage };
