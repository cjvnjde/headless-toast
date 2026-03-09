import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Toaster, useToast, useToastAnimation } from "@headless-toast/react";
import { useIsolatedToast } from "../shared/useIsolatedToast";

const iconByType: Record<string, string> = {
  success: "OK",
  error: "ER",
  warning: "!",
  info: "i",
  loading: "..",
  custom: "*",
};

const accentByType: Record<string, string> = {
  success: "var(--color-toast-success)",
  error: "var(--color-toast-error)",
  warning: "var(--color-toast-warning)",
  info: "var(--color-toast-info)",
  loading: "var(--color-toast-loading)",
  custom: "var(--color-toast-info)",
};

const iconClassByType: Record<string, string> = {
  success: "bg-emerald-500",
  error: "bg-rose-500",
  warning: "bg-amber-500",
  info: "bg-sky-500",
  loading: "bg-violet-500",
  custom: "bg-slate-500",
};

function TailwindToast() {
  const { toast, dismiss, pauseOnHoverHandlers } = useToast();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className: "toast-shell",
  });
  const type = toast.type ?? "info";
  const accent = accentByType[type] ?? accentByType.info;
  const iconClass = iconClassByType[type] ?? iconClassByType.info;
  const style = { "--toast-accent": accent } as CSSProperties;

  return (
    <div
      ref={ref}
      className={className}
      style={style}
      {...handlers}
      {...pauseOnHoverHandlers}
      {...attributes}
    >
      <div className="toast-accent" />
      <div className={`toast-icon ${iconClass}`}>{iconByType[type] ?? "i"}</div>
      <div className="min-w-0 flex-1 pr-8">
        {toast.data.title ? (
          <strong className="block text-sm font-semibold tracking-tight text-[var(--color-toast-ink)]">
            {String(toast.data.title)}
          </strong>
        ) : null}
        {toast.data.body ? (
          <p className="mt-1 text-sm leading-5 text-[var(--color-toast-muted)]">
            {String(toast.data.body)}
          </p>
        ) : null}
      </div>
      {toast.options.dismissible !== false ? (
        <button
          className="toast-close-btn absolute right-3 top-3 border-0 bg-transparent"
          onClick={() => dismiss("user")}
          aria-label="Close"
        >
          x
        </button>
      ) : null}
      {toast.options.progress ? (
        <div
          className="toast-progress-bar"
          style={{ width: `${toast.progress * 100}%` }}
          role="progressbar"
          aria-valuenow={Math.round(toast.progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      ) : null}
    </div>
  );
}

const meta: Meta<typeof Toaster> = {
  title: "Components/Toaster/Tailwind",
  component: Toaster,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A toast setup where the root region, placement list, and toast item are all styled with Tailwind CSS v4 utilities.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Toaster>;

export const DefaultToastWithTailwind: Story = {
  name: "Default Toast Styled With Tailwind",
  render: function Render() {
    const toast = useIsolatedToast();

    return (
      <div className="story-wrapper">
        <h2>Default Toast Styled With Tailwind</h2>
        <p className="story-subtitle">
          This uses Tailwind v4 classes for the toaster region, the placement
          list, and the toast item while keeping the same hook-driven behavior.
        </p>
        <div className="story-controls">
          <button
            className="btn-success"
            onClick={() =>
              toast.success(
                {
                  title: "Saved",
                  body: "Tailwind v4 styles are applied here.",
                },
                { progress: true, duration: 5000, pauseOnHover: true },
              )
            }
          >
            Success
          </button>
          <button
            className="btn-error"
            onClick={() =>
              toast.error({
                title: "Upload failed",
                body: "The toast layout is the same, only the styling changed.",
              })
            }
          >
            Error
          </button>
          <button
            className="btn-info"
            onClick={() =>
              toast.info({
                title: "Background sync",
                body: "You can keep using the same store and hook APIs.",
              })
            }
          >
            Info
          </button>
          <button className="btn-dismiss" onClick={() => toast.dismissAll()}>
            Dismiss All
          </button>
        </div>
        <Toaster
          store={toast}
          className="pointer-events-none fixed inset-0 z-9999"
        >
          <Toaster.List className="pointer-events-none fixed flex w-[min(26rem,calc(100vw-24px))] max-w-[calc(100vw-24px)] flex-col gap-3 p-6 data-[placement=top-left]:left-0 data-[placement=top-left]:top-0 data-[placement=top-left]:items-start data-[placement=top-center]:left-1/2 data-[placement=top-center]:top-0 data-[placement=top-center]:-translate-x-1/2 data-[placement=top-center]:items-center data-[placement=top-right]:right-0 data-[placement=top-right]:top-0 data-[placement=top-right]:items-end data-[placement=bottom-left]:bottom-0 data-[placement=bottom-left]:left-0 data-[placement=bottom-left]:items-start data-[placement=bottom-center]:bottom-0 data-[placement=bottom-center]:left-1/2 data-[placement=bottom-center]:-translate-x-1/2 data-[placement=bottom-center]:items-center data-[placement=bottom-right]:right-0 data-[placement=bottom-right]:bottom-0 data-[placement=bottom-right]:items-end">
            <TailwindToast />
          </Toaster.List>
        </Toaster>
      </div>
    );
  },
};
