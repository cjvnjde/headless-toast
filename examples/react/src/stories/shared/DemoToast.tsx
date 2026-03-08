import { useToast, useToastAnimation } from "@headless-toast/react";

function DemoToast() {
  const { toast, dismiss, pauseOnHoverHandlers } = useToast();
  const { ref, className, attributes, handlers } = useToastAnimation({
    className: "demo-toast",
  });

  return (
    <div
      ref={ref}
      className={className}
      {...handlers}
      {...pauseOnHoverHandlers}
      {...attributes}
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
      {toast.options.progress && (
        <div
          className="toast-progress"
          style={{ width: `${toast.progress * 100}%` }}
          role="progressbar"
          aria-valuenow={Math.round(toast.progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      )}
    </div>
  );
}

export { DemoToast };
