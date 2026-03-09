import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Toaster, useToast, useToastAnimation } from "@headless-toast/react";
import {
  noControlsParameters,
  withTailwindToasterDocs,
  toasterArgTypes,
} from "../shared/storybookDocs";
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

const placementListClassName = [
  "pointer-events-none fixed flex w-[min(26rem,calc(100vw-24px))] max-w-[calc(100vw-24px)] flex-col gap-3 p-6",
  "data-[placement=top-left]:left-0 data-[placement=top-left]:top-0 data-[placement=top-left]:items-start",
  "data-[placement=top-center]:left-1/2 data-[placement=top-center]:top-0 data-[placement=top-center]:-translate-x-1/2 data-[placement=top-center]:items-center",
  "data-[placement=top-right]:right-0 data-[placement=top-right]:top-0 data-[placement=top-right]:items-end",
  "data-[placement=bottom-left]:bottom-0 data-[placement=bottom-left]:left-0 data-[placement=bottom-left]:items-start",
  "data-[placement=bottom-center]:bottom-0 data-[placement=bottom-center]:left-1/2 data-[placement=bottom-center]:-translate-x-1/2 data-[placement=bottom-center]:items-center",
  "data-[placement=bottom-right]:right-0 data-[placement=bottom-right]:bottom-0 data-[placement=bottom-right]:items-end",
].join(" ");

function TailwindToast() {
  const { toast: currentToast, dismiss, pauseOnHoverHandlers } = useToast();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className: "toast-shell",
  });
  const type = currentToast.type ?? "info";
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
        {currentToast.data.title ? (
          <strong className="block text-sm font-semibold tracking-tight text-[var(--color-toast-ink)]">
            {String(currentToast.data.title)}
          </strong>
        ) : null}
        {currentToast.data.body ? (
          <p className="mt-1 text-sm leading-5 text-[var(--color-toast-muted)]">
            {String(currentToast.data.body)}
          </p>
        ) : null}
      </div>
      {currentToast.options.dismissible !== false ? (
        <button
          className="toast-close-btn absolute right-3 top-3 border-0 bg-transparent"
          onClick={() => dismiss("user")}
          aria-label="Close"
        >
          x
        </button>
      ) : null}
      {currentToast.options.progress ? (
        <div
          className="toast-progress-bar"
          style={{ width: `${currentToast.progress * 100}%` }}
          role="progressbar"
          aria-valuenow={Math.round(currentToast.progress * 100)}
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
  argTypes: toasterArgTypes,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "This story keeps the headless render flow unchanged while replacing the entire visual system with Tailwind CSS v4 utilities and theme tokens.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Toaster>;

export const DefaultToastWithTailwind: Story = {
  name: "Default Toast Styled With Tailwind",
  parameters: {
    ...noControlsParameters,
    ...withTailwindToasterDocs(
      "Use Tailwind for all presentation while keeping the same store, placement lists, and lifecycle hooks. This is the recommended pattern when the host app already uses Tailwind.",
      `import type { CSSProperties } from "react";
import { createToast } from "@headless-toast/react";
import { Toaster, useToast, useToastAnimation } from "@headless-toast/react";

const { toast: toastStore } = createToast();

function TailwindToast() {
  const { toast: currentToast, dismiss, pauseOnHoverHandlers } = useToast();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className: "toast-shell",
  });
  const style = {
    "--toast-accent": "var(--color-toast-success)",
  } as CSSProperties;

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
      <div className="min-w-0 flex-1 pr-8">
        <strong className="block text-sm font-semibold tracking-tight text-[var(--color-toast-ink)]">
          {String(currentToast.data.title)}
        </strong>
        {currentToast.data.body ? (
          <p className="mt-1 text-sm leading-5 text-[var(--color-toast-muted)]">
            {String(currentToast.data.body)}
          </p>
        ) : null}
      </div>
      <button className="toast-close-btn absolute right-3 top-3" onClick={() => dismiss("user")}>
        x
      </button>
    </div>
  );
}

<Toaster store={toastStore} className="pointer-events-none fixed inset-0 z-9999">
  <Toaster.List className={placementListClassName}>
    <TailwindToast />
  </Toaster.List>
</Toaster>;`,
      `toastStore.success(
  {
    title: "Saved",
    body: "Tailwind v4 styles are applied here.",
  },
  { progress: true, duration: 5000, pauseOnHover: true },
);`,
    ),
  },
  render: function Render() {
    const toastStore = useIsolatedToast();

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
              toastStore.success(
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
              toastStore.error({
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
              toastStore.info({
                title: "Background sync",
                body: "You can keep using the same store and hook APIs.",
              })
            }
          >
            Info
          </button>
          <button
            className="btn-dismiss"
            onClick={() => toastStore.dismissAll()}
          >
            Dismiss All
          </button>
        </div>
        <Toaster
          store={toastStore}
          className="pointer-events-none fixed inset-0 z-9999"
        >
          <Toaster.List className={placementListClassName}>
            <TailwindToast />
          </Toaster.List>
        </Toaster>
      </div>
    );
  },
};
