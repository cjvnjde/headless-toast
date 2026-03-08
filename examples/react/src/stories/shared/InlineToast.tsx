import { useToast, useToastAnimation } from "@headless-toast/react";

function InlineToast() {
  const { toast, dismiss } = useToast();
  const { ref, className, attributes, handlers } = useToastAnimation({
    className: "inline-toast",
  });

  return (
    <div ref={ref} className={className} {...handlers} {...attributes}>
      <div className="inline-toast-content">
        {toast.data.title ? <strong>{String(toast.data.title)}</strong> : null}
        {toast.data.body ? <span>{String(toast.data.body)}</span> : null}
      </div>
      {toast.options.dismissible !== false && (
        <button
          className="inline-toast-close"
          onClick={() => dismiss("user")}
          aria-label="Close"
        >
          &times;
        </button>
      )}
    </div>
  );
}

export { InlineToast };
