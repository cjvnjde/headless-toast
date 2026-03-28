import {
  CircleAlert,
  CircleCheckBig,
  Info,
  LoaderCircle,
  TriangleAlert,
} from "lucide-react";
import { tv } from "tailwind-variants";
import {
  Toaster,
  createToast,
  useToast,
  useToastAnimation,
} from "@headless-toast/react";
import { ExamplePage } from "#/components/ExamplePage";
import { extractExampleSource } from "#/lib/exampleSource";
import rawSource from "./basic-variants.tsx?raw";

type ToastTone =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "loading"
  | "custom";

const toast = createToast<{ title: string; body: string }>({
  defaults: { duration: 4500, pauseOnHover: true, placement: "top-right" },
}).toast;

const variantToastCard = tv({
  variants: {
    tone: {
      success:
        "border-emerald-300 bg-emerald-50/95 text-emerald-950 dark:border-emerald-400/30 dark:bg-emerald-950/60 dark:text-emerald-50",
      error:
        "border-rose-300 bg-rose-50/95 text-rose-950 dark:border-rose-400/30 dark:bg-rose-950/60 dark:text-rose-50",
      warning:
        "border-amber-300 bg-amber-50/95 text-amber-950 dark:border-amber-300/30 dark:bg-amber-950/60 dark:text-amber-50",
      info: "border-sky-300 bg-sky-50/95 text-sky-950 dark:border-sky-400/30 dark:bg-sky-950/60 dark:text-sky-50",
      loading:
        "border-violet-300 bg-violet-50/95 text-violet-950 dark:border-violet-400/30 dark:bg-violet-950/60 dark:text-violet-50",
      custom:
        "border-slate-300 bg-white text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50",
    },
  },
  defaultVariants: {
    tone: "info",
  },
});

const variantToastAccent = tv({
  base: "absolute inset-y-0 left-0 w-1.5 rounded-l-[inherit]",
  variants: {
    tone: {
      success: "bg-emerald-500",
      error: "bg-rose-500",
      warning: "bg-amber-500",
      info: "bg-sky-500",
      loading: "bg-violet-500",
      custom: "bg-slate-400 dark:bg-slate-500",
    },
  },
  defaultVariants: {
    tone: "info",
  },
});

const variantToastIconWrap = tv({
  base: "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-sm",
  variants: {
    tone: {
      success:
        "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-400/25 dark:bg-emerald-500/15 dark:text-emerald-200",
      error:
        "border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-400/25 dark:bg-rose-500/15 dark:text-rose-200",
      warning:
        "border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-400/25 dark:bg-amber-500/15 dark:text-amber-200",
      info: "border-sky-200 bg-sky-100 text-sky-700 dark:border-sky-400/25 dark:bg-sky-500/15 dark:text-sky-200",
      loading:
        "border-violet-200 bg-violet-100 text-violet-700 dark:border-violet-400/25 dark:bg-violet-500/15 dark:text-violet-200",
      custom:
        "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
    },
  },
  defaultVariants: {
    tone: "info",
  },
});

const variantToastBadge = tv({
  base: "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em]",
  variants: {
    tone: {
      success:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200",
      error: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200",
      warning:
        "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200",
      info: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-200",
      loading:
        "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-200",
      custom:
        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    },
  },
  defaultVariants: {
    tone: "info",
  },
});

const variantToastTitle = tv({
  base: "mt-3 text-sm font-semibold",
  variants: {
    tone: {
      success: "text-emerald-950 dark:text-emerald-50",
      error: "text-rose-950 dark:text-rose-50",
      warning: "text-amber-950 dark:text-amber-50",
      info: "text-sky-950 dark:text-sky-50",
      loading: "text-violet-950 dark:text-violet-50",
      custom: "text-slate-950 dark:text-slate-50",
    },
  },
  defaultVariants: {
    tone: "info",
  },
});

const variantToastBody = tv({
  base: "mt-1 text-sm leading-6",
  variants: {
    tone: {
      success: "text-emerald-800 dark:text-emerald-100/85",
      error: "text-rose-800 dark:text-rose-100/85",
      warning: "text-amber-900 dark:text-amber-100/85",
      info: "text-sky-800 dark:text-sky-100/85",
      loading: "text-violet-800 dark:text-violet-100/85",
      custom: "text-slate-600 dark:text-slate-300",
    },
  },
  defaultVariants: {
    tone: "info",
  },
});

const variantToastCloseButton = tv({
  base: "absolute right-3 top-3 inline-flex cursor-pointer h-8 w-8 items-center justify-center rounded-full border transition duration-150 hover:shadow-sm",
  variants: {
    tone: {
      success:
        "border-emerald-200/80 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-400/20 dark:text-emerald-200 dark:hover:bg-emerald-500/15",
      error:
        "border-rose-200/80 text-rose-700 hover:bg-rose-100 dark:border-rose-400/20 dark:text-rose-200 dark:hover:bg-rose-500/15",
      warning:
        "border-amber-200/80 text-amber-700 hover:bg-amber-100 dark:border-amber-400/20 dark:text-amber-200 dark:hover:bg-amber-500/15",
      info: "border-sky-200/80 text-sky-700 hover:bg-sky-100 dark:border-sky-400/20 dark:text-sky-200 dark:hover:bg-sky-500/15",
      loading:
        "border-violet-200/80 text-violet-700 hover:bg-violet-100 dark:border-violet-400/20 dark:text-violet-200 dark:hover:bg-violet-500/15",
      custom:
        "border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800",
    },
  },
  defaultVariants: {
    tone: "info",
  },
});

const variantTriggerButton = tv({
  base: "inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm transition duration-150 hover:shadow-md",
  variants: {
    tone: {
      success:
        "border-emerald-200 bg-emerald-50 text-emerald-900 hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-100 dark:hover:bg-emerald-500/15",
      error:
        "border-rose-200 bg-rose-50 text-rose-900 hover:border-rose-300 hover:bg-rose-100 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-100 dark:hover:bg-rose-500/15",
      warning:
        "border-amber-200 bg-amber-50 text-amber-900 hover:border-amber-300 hover:bg-amber-100 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-100 dark:hover:bg-amber-500/15",
      info: "border-sky-200 bg-sky-50 text-sky-900 hover:border-sky-300 hover:bg-sky-100 dark:border-sky-400/30 dark:bg-sky-500/10 dark:text-sky-100 dark:hover:bg-sky-500/15",
      loading:
        "border-violet-200 bg-violet-50 text-violet-900 hover:border-violet-300 hover:bg-violet-100 dark:border-violet-400/30 dark:bg-violet-500/10 dark:text-violet-100 dark:hover:bg-violet-500/15",
      custom:
        "border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50 dark:hover:border-slate-700 dark:hover:bg-slate-800",
    },
  },
  defaultVariants: {
    tone: "info",
  },
});

function getToastToneMeta(tone: ToastTone) {
  switch (tone) {
    case "success":
      return { label: "Success", Icon: CircleCheckBig };
    case "error":
      return { label: "Error", Icon: CircleAlert };
    case "warning":
      return { label: "Warning", Icon: TriangleAlert };
    case "loading":
      return { label: "Loading", Icon: LoaderCircle };
    case "custom":
      return { label: "Custom", Icon: Info };
    default:
      return { label: "Info", Icon: Info };
  }
}

function VariantToast() {
  const { toast, dismiss } = useToast<{
    title: string;
    body: string;
  }>();
  const tone = toast.type;
  const { Icon, label } = getToastToneMeta(tone);
  const { ref, className, handlers, attributes } = useToastAnimation({
    className:
      "origin-top-right transition duration-200 ease-out will-change-[translate,scale,opacity] data-[toast-status=entering]:starting:opacity-0 data-[toast-status=entering]:starting:-translate-y-3 data-[toast-status=entering]:starting:scale-95 data-[toast-status=exiting]:opacity-0 data-[toast-status=exiting]:-translate-y-2 data-[toast-status=exiting]:scale-95 data-[toast-status=exiting]:duration-150 data-[toast-status=exiting]:ease-in [&[data-toast-placement^=bottom]]:origin-bottom-right pointer-events-auto relative w-full overflow-hidden rounded-3xl border p-4 pl-5 pr-12 shadow-xl",
  });

  return (
    <article
      ref={ref}
      className={variantToastCard({ tone, className })}
      {...handlers}
      {...attributes}
    >
      <div aria-hidden="true" className={variantToastAccent({ tone })} />
      <div className="flex gap-3 pr-6">
        <div className={variantToastIconWrap({ tone })}>
          <Icon
            className={tone === "loading" ? "h-5 w-5 animate-spin" : "h-5 w-5"}
            strokeWidth={2.2}
          />
        </div>
        <div className="min-w-0 flex-1">
          <span className={variantToastBadge({ tone })}>{label}</span>
          <p className={variantToastTitle({ tone })}>{toast.data.title}</p>
          <p className={variantToastBody({ tone })}>{toast.data.body}</p>
        </div>
      </div>
      <button
        type="button"
        aria-label="Close toast"
        className={variantToastCloseButton({ tone })}
        onClick={() => dismiss("user")}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="h-3.5 w-3.5"
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

type VariantTriggerButtonProps = {
  children: string;
  tone: ToastTone;
  onClick: () => void;
};

function VariantTriggerButton({
  children,
  tone,
  onClick,
}: VariantTriggerButtonProps) {
  const { Icon } = getToastToneMeta(tone);

  return (
    <button
      type="button"
      className={variantTriggerButton({ tone })}
      onClick={onClick}
    >
      <Icon
        className={tone === "loading" ? "h-4 w-4 animate-spin" : "h-4 w-4"}
        strokeWidth={2.2}
      />
      {children}
    </button>
  );
}

function BasicVariantsPreview() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3">
        <VariantTriggerButton
          tone="success"
          onClick={() =>
            toast.success({
              title: "Saved",
              body: "Changes were written to disk.",
            })
          }
        >
          Success
        </VariantTriggerButton>
        <VariantTriggerButton
          tone="error"
          onClick={() =>
            toast.error({
              title: "Upload failed",
              body: "The request returned a 500 error.",
            })
          }
        >
          Error
        </VariantTriggerButton>
        <VariantTriggerButton
          tone="warning"
          onClick={() =>
            toast.warning({
              title: "Storage almost full",
              body: "Only 8% free space remains.",
            })
          }
        >
          Warning
        </VariantTriggerButton>
        <VariantTriggerButton
          tone="info"
          onClick={() =>
            toast.info({
              title: "Background sync",
              body: "A refresh is already running.",
            })
          }
        >
          Info
        </VariantTriggerButton>
        <VariantTriggerButton
          tone="loading"
          onClick={() =>
            toast.loading({
              title: "Deploying",
              body: "A release is being published right now.",
            })
          }
        >
          Loading
        </VariantTriggerButton>
      </div>
      <Toaster store={toast} className="pointer-events-none fixed inset-0 z-50">
        <Toaster.List className="fixed right-4 top-4 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
          <VariantToast />
        </Toaster.List>
      </Toaster>
    </div>
  );
}

const code = extractExampleSource(rawSource);

function BasicVariantsPage() {
  return (
    <ExamplePage
      category="Fundamentals"
      title="Basic variants"
      summary="Use one toast item component for the built-in type helpers and branch on currentToast.type only where the UI needs to change."
      files={[{ filename: "basic-variants.tsx", language: "tsx", code }]}
      preview={<BasicVariantsPreview />}
    />
  );
}

export { BasicVariantsPage };
