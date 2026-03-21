import type { CSSProperties } from "react";
import { useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Toaster,
  createToast,
  useToast,
  useToastAnimation,
} from "@headless-toast/react";
import type { ReactToastStore } from "@headless-toast/react";
import { ExamplePage } from "../../components/ExamplePage";
import { extractRouteExampleSource } from "../../lib/exampleSource";
import rawSource from "./tailwind-styled.tsx?raw";

export const Route = createFileRoute("/examples/tailwind-styled")({
  component: TailwindStyledPage,
});

const placementListClassName = [
  "pointer-events-none fixed flex w-[min(26rem,calc(100vw-24px))] max-w-[calc(100vw-24px)] flex-col gap-3 p-4",
  "data-[placement=top-left]:left-0 data-[placement=top-left]:top-0",
  "data-[placement=top-center]:left-1/2 data-[placement=top-center]:top-0 data-[placement=top-center]:-translate-x-1/2",
  "data-[placement=top-right]:right-0 data-[placement=top-right]:top-0",
  "data-[placement=bottom-left]:bottom-0 data-[placement=bottom-left]:left-0",
  "data-[placement=bottom-center]:bottom-0 data-[placement=bottom-center]:left-1/2 data-[placement=bottom-center]:-translate-x-1/2",
  "data-[placement=bottom-right]:bottom-0 data-[placement=bottom-right]:right-0",
].join(" ");

function TailwindToast() {
  const { toast, dismiss, pauseOnHoverHandlers } = useToast<{
    title: string;
    body: string;
  }>();
  const { ref, className, handlers, attributes } = useToastAnimation({
    className:
      "pointer-events-auto relative overflow-hidden rounded-[1.6rem] border border-white/60 bg-slate-950 text-slate-50 shadow-[0_24px_50px_rgba(15,23,42,0.35)] dark:border-white/10",
  });

  const accent =
    toast.type === "success"
      ? "#10b981"
      : toast.type === "error"
        ? "#ef4444"
        : toast.type === "warning"
          ? "#f59e0b"
          : toast.type === "loading"
            ? "#8b5cf6"
            : "#38bdf8";

  return (
    <article
      ref={ref}
      className={className}
      style={{ "--toast-accent": accent } as CSSProperties}
      {...handlers}
      {...pauseOnHoverHandlers}
      {...attributes}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-[var(--toast-accent)]" />
      <div className="flex items-start gap-4 p-4 pr-12">
        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-sm font-bold uppercase text-[var(--toast-accent)]">
          {(toast.type ?? "info").slice(0, 2)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold tracking-tight">
            {toast.data.title}
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-300">
            {toast.data.body}
          </p>
        </div>
      </div>
      <button
        type="button"
        className="absolute right-3 top-3 text-xs text-slate-300"
        onClick={() => dismiss("user")}
      >
        Close
      </button>
      {toast.options.progress ? (
        <div className="h-1 bg-white/8">
          <div
            className="h-full bg-[var(--toast-accent)]"
            style={{ width: `${toast.progress * 100}%` }}
          />
        </div>
      ) : null}
    </article>
  );
}

function TailwindStyledPreview() {
  const storeRef = useRef<ReactToastStore<{
    title: string;
    body: string;
  }> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createToast<{ title: string; body: string }>({
      defaults: { duration: 5000, pauseOnHover: true },
    }).toast;
  }

  const toast = storeRef.current;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="doc-button"
          onClick={() =>
            toast.success(
              {
                title: "Saved",
                body: "Tailwind utilities style the whole toast item here.",
              },
              { progress: true },
            )
          }
        >
          Success
        </button>
        <button
          type="button"
          className="doc-button doc-button-secondary"
          onClick={() =>
            toast.error({
              title: "Build failed",
              body: "Only the styles changed — the store API stayed the same.",
            })
          }
        >
          Error
        </button>
      </div>
      <Toaster
        store={toast}
        className="pointer-events-none fixed inset-0 z-[9999]"
      >
        <Toaster.List className={placementListClassName}>
          <TailwindToast />
        </Toaster.List>
      </Toaster>
    </div>
  );
}

const code = extractRouteExampleSource(rawSource);

function TailwindStyledPage() {
  return (
    <ExamplePage
      category="Rendering"
      title="Tailwind styled"
      summary="If the host app already uses Tailwind, keep the headless flow and replace all presentation with utility classes and data-attribute selectors."
      notes={[
        "This page intentionally keeps toast styles local to the example instead of sharing a global toast component.",
        "The same store, toaster, and hook APIs work no matter how opinionated your styling layer is.",
        "Use data-placement and data-toast-status selectors when list positioning or lifecycle phases need visual tweaks.",
      ]}
      files={[{ filename: "tailwind-styled.tsx", language: "tsx", code }]}
      preview={<TailwindStyledPreview />}
    />
  );
}
