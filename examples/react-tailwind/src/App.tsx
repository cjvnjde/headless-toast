import {
  Toaster,
  createToast,
  useToast,
  useToastAnimation,
} from "@headless-toast/react";
import { tv } from "tailwind-variants/lite";

type ExampleToastData = {
  title: string;
  body?: string;
};

const { toast } = createToast<ExampleToastData>({
  defaults: {
    duration: 4000,
    placement: "top-right",
    pauseOnHover: true,
    pauseOnFocusLoss: true,
    dismissible: true,
  },
});

const button = tv({
  base: "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
  variants: {
    tone: {
      success: "border-green-200 bg-green-50 text-green-700 hover:bg-green-100",
      error: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
      info: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
    },
  },
});

const toastCard = tv({
  base: "pointer-events-auto grid w-full grid-cols-[1fr_auto] gap-3 rounded-xl border bg-white p-4 shadow-lg",
  variants: {
    tone: {
      success: "border-green-200 bg-green-50",
      error: "border-red-200 bg-red-50",
      info: "border-blue-200 bg-blue-50",
      loading: "border-slate-200 bg-slate-50",
    },
  },
});

function getTone(type: string) {
  if (type === "success") return "success" as const;
  if (type === "error") return "error" as const;
  if (type === "loading") return "loading" as const;

  return "info" as const;
}

function ExampleToast() {
  const {
    toast: currentToast,
    dismiss,
    pauseOnHoverHandlers,
  } = useToast<ExampleToastData>();
  const data = currentToast.data;
  const tone = getTone(currentToast.type);
  const { ref, className, handlers, attributes } =
    useToastAnimation<HTMLElement>({
      className: toastCard({ tone }),
    });

  return (
    <article
      ref={ref}
      className={className}
      {...handlers}
      {...pauseOnHoverHandlers}
      {...attributes}
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">{data.title}</p>
        {data.body ? (
          <p className="mt-1 text-sm text-slate-600">{data.body}</p>
        ) : null}
      </div>

      <button
        type="button"
        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
        onClick={() => dismiss("user")}
      >
        Close
      </button>
    </article>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <main className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          React Tailwind example
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Simple example with Tailwind v4 and tailwind-variants.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className={button({ tone: "success" })}
            onClick={() => {
              toast.success({
                title: "Saved",
                body: "Your changes were saved.",
              });
            }}
          >
            Success toast
          </button>

          <button
            type="button"
            className={button({ tone: "error" })}
            onClick={() => {
              toast.error({
                title: "Request failed",
                body: "Please try again.",
              });
            }}
          >
            Error toast
          </button>

          <button
            type="button"
            className={button({ tone: "info" })}
            onClick={() => {
              void toast.promise(
                new Promise((resolve) => {
                  window.setTimeout(resolve, 1500);
                }),
                {
                  loading: {
                    title: "Uploading",
                    body: "Please wait...",
                  },
                  success: {
                    title: "Done",
                    body: "Upload finished.",
                  },
                  error: {
                    title: "Failed",
                    body: "Upload failed.",
                  },
                },
              );
            }}
          >
            Promise toast
          </button>
        </div>
      </main>

      <Toaster store={toast} className="pointer-events-none fixed inset-0 z-50">
        <Toaster.List className="fixed top-4 right-4 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
          <ExampleToast />
        </Toaster.List>
      </Toaster>
    </div>
  );
}

export { App };
