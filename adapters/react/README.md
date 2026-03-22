# @headless-toast/react

[![NPM Version](https://img.shields.io/npm/v/%40headless-toast%2Freact?label=%40headless-toast%2Freact)](https://www.npmjs.com/package/@headless-toast/react)

React bindings for `headless-toast`.

This package pairs the headless core store with React rendering primitives. You bring the markup and styles; the adapter handles subscription, context, animation timing, placement grouping, and gesture wiring.

## Install

```bash
pnpm add @headless-toast/react react react-dom
```

`@headless-toast/react` depends on `@headless-toast/core`, so you do not need to install the core package separately unless you want to import it directly.

## What You Get

- `createToast()` for isolated toast instances
- `toast` for a shared singleton flow
- `Toaster` and `Toaster.List` to declare where toast groups render
- `useToast()` for per-toast state and actions
- `useToastSelector()` for field-level toast subscriptions
- `useToastActions()` for actions without subscribing to the full toast snapshot
- `useProgress()` and `useProgressEffect()` for progress-heavy UIs
- `useToastAnimation()` for DOM timing and phase completion
- `useToastDrag()` for pointer-driven drag-to-dismiss
- `useStore()` for custom reactive views over the toast array
- `AnimationWrapper` as a convenience wrapper around animation attributes and handlers

## Getting Started

### React quick start

This example includes the missing pieces people usually need in a real app: a complete toast component, placement styling, and animation CSS.

```tsx
import {
  createToast,
  Toaster,
  useToast,
  useToastAnimation,
} from "@headless-toast/react";
import "./toast.css";

const { toast } = createToast<{
  title: string;
  body?: string;
}>({
  maxToasts: 4,
  defaults: {
    duration: 4000,
    placement: "top-right",
    pauseOnHover: true,
    dismissible: true,
  },
});

function AppToast() {
  const { toast: currentToast, dismiss, pauseOnHoverHandlers } = useToast();
  const { ref, className, attributes, handlers } = useToastAnimation({
    className: "ht-toast",
  });

  return (
    <article
      ref={ref}
      className={className}
      {...handlers}
      {...pauseOnHoverHandlers}
      {...attributes}
    >
      <div className="ht-toast__content">
        <strong className="ht-toast__title">
          {String(currentToast.data.title)}
        </strong>
        {currentToast.data.body ? (
          <p className="ht-toast__message">{String(currentToast.data.body)}</p>
        ) : null}
      </div>

      <button
        type="button"
        className="ht-toast__close"
        onClick={() => dismiss("user")}
        aria-label="Dismiss notification"
      >
        Close
      </button>
    </article>
  );
}

export function App() {
  return (
    <>
      <button
        type="button"
        onClick={() =>
          toast.success({
            title: "Saved",
            body: "Profile updated successfully.",
          })
        }
      >
        Show toast
      </button>

      <Toaster store={toast} className="ht-toast-region">
        <Toaster.List className="ht-toast-list">
          <AppToast />
        </Toaster.List>
      </Toaster>
    </>
  );
}
```

```css
:root {
  --ht-toast-bg: rgba(255, 255, 255, 0.96);
  --ht-toast-border: rgba(148, 163, 184, 0.28);
  --ht-toast-shadow: 0 18px 45px rgba(15, 23, 42, 0.18);
  --ht-toast-text: #0f172a;
  --ht-toast-muted: #475569;
  --ht-toast-accent: #2563eb;
}

.ht-toast-region {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
}

.ht-toast-list {
  position: fixed;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: min(26rem, calc(100vw - 24px));
  padding: 16px;
}

.ht-toast-list[data-placement^="top-"] {
  top: 0;
}

.ht-toast-list[data-placement^="bottom-"] {
  bottom: 0;
}

.ht-toast-list[data-placement$="-left"] {
  left: 0;
  align-items: flex-start;
}

.ht-toast-list[data-placement$="-center"] {
  left: 50%;
  transform: translateX(-50%);
  align-items: stretch;
}

.ht-toast-list[data-placement$="-right"] {
  right: 0;
  align-items: flex-end;
}

.ht-toast {
  pointer-events: auto;
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  width: 100%;
  border: 1px solid var(--ht-toast-border);
  border-left: 4px solid var(--ht-toast-accent);
  border-radius: 18px;
  background: var(--ht-toast-bg);
  box-shadow: var(--ht-toast-shadow);
  backdrop-filter: blur(12px);
  padding: 14px 16px;
  color: var(--ht-toast-text);
}

.ht-toast[data-toast-type="success"] {
  --ht-toast-accent: #16a34a;
}

.ht-toast[data-toast-type="error"] {
  --ht-toast-accent: #dc2626;
}

.ht-toast[data-toast-type="warning"] {
  --ht-toast-accent: #d97706;
}

.ht-toast[data-toast-type="info"] {
  --ht-toast-accent: #2563eb;
}

.ht-toast[data-toast-type="loading"] {
  --ht-toast-accent: #7c3aed;
}

.ht-toast__content {
  min-width: 0;
}

.ht-toast__title {
  display: block;
  font-size: 0.95rem;
  line-height: 1.3;
}

.ht-toast__message {
  margin: 6px 0 0;
  color: var(--ht-toast-muted);
  font-size: 0.9rem;
  line-height: 1.5;
}

.ht-toast__close {
  align-self: start;
  border: 0;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.16);
  color: var(--ht-toast-text);
  padding: 8px 10px;
  cursor: pointer;
}

.ht-toast[data-toast-status="entering"] {
  animation: ht-toast-enter 240ms cubic-bezier(0.16, 1, 0.3, 1);
}

.ht-toast[data-toast-status="exiting"][data-toast-swipe-dismissed="false"] {
  animation: ht-toast-exit 180ms ease-in forwards;
}

.ht-toast[data-toast-status="exiting"][data-toast-swipe-dismissed="true"] {
  animation: ht-toast-swipe-exit 180ms ease-in forwards;
}

@keyframes ht-toast-enter {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes ht-toast-exit {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  to {
    opacity: 0;
    transform: translateY(-8px) scale(0.98);
  }
}

@keyframes ht-toast-swipe-exit {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}

@media (max-width: 640px) {
  .ht-toast-list {
    width: calc(100vw - 16px);
    padding: 8px;
  }
}
```

`Toaster` owns the region and portal behavior. `Toaster.List` is the element you style for placement groups. It renders once per active placement, while the store and hooks remain responsible for placement and toast state.

Important: the overlay region should keep `pointer-events: none`, but the actual toast card must set `pointer-events: auto`. If the toast itself inherits `pointer-events: none`, buttons and links inside it will feel broken.

## Styling And Animation

The adapter reads the actual animation or transition duration from the rendered element. That means your toast component needs real CSS for enter and exit states.

Safe defaults for most apps:

- `maxToasts: 3` or `4`
- `duration: 4000`
- `placement: "top-right"`
- `pauseOnHover: true`
- `dismissible: true`

Good visual defaults:

- Width around `20rem` to `26rem`
- Padding around `12px 16px`
- Radius around `16px` to `18px`
- One accent color per toast type
- Enter motion around `220ms` to `280ms`
- Exit motion around `160ms` to `200ms`

### Tailwind example

If you use Tailwind, keep the same interaction rule: the region ignores clicks, the toast card enables them.

```tsx
import {
  createToast,
  Toaster,
  useToast,
  useToastAnimation,
} from "@headless-toast/react";
import "./toast-motion.css";

const { toast } = createToast<{
  title: string;
  body?: string;
}>({
  defaults: {
    placement: "bottom-right",
    duration: 4500,
    pauseOnHover: true,
  },
});

const toastListClassName = [
  "fixed flex w-[min(26rem,calc(100vw-24px))] max-w-[calc(100vw-24px)] flex-col gap-3 p-4",
  "data-[placement=top-left]:left-0 data-[placement=top-left]:top-0 data-[placement=top-left]:items-start",
  "data-[placement=top-center]:left-1/2 data-[placement=top-center]:top-0 data-[placement=top-center]:-translate-x-1/2 data-[placement=top-center]:items-stretch",
  "data-[placement=top-right]:right-0 data-[placement=top-right]:top-0 data-[placement=top-right]:items-end",
  "data-[placement=bottom-left]:bottom-0 data-[placement=bottom-left]:left-0 data-[placement=bottom-left]:items-start",
  "data-[placement=bottom-center]:bottom-0 data-[placement=bottom-center]:left-1/2 data-[placement=bottom-center]:-translate-x-1/2 data-[placement=bottom-center]:items-stretch",
  "data-[placement=bottom-right]:bottom-0 data-[placement=bottom-right]:right-0 data-[placement=bottom-right]:items-end",
].join(" ");

function TailwindToast() {
  const { toast: currentToast, dismiss, pauseOnHoverHandlers } = useToast();
  const { ref, className, attributes, handlers } = useToastAnimation({
    className: [
      "ht-toast-motion pointer-events-auto relative w-full overflow-hidden rounded-3xl border border-slate-200/70 bg-white/95 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.18)] backdrop-blur",
      "data-[toast-type=success]:border-emerald-200 data-[toast-type=success]:bg-emerald-50/95",
      "data-[toast-type=error]:border-rose-200 data-[toast-type=error]:bg-rose-50/95",
      "data-[toast-type=warning]:border-amber-200 data-[toast-type=warning]:bg-amber-50/95",
      "data-[toast-type=info]:border-sky-200 data-[toast-type=info]:bg-sky-50/95",
      "data-[toast-type=loading]:border-violet-200 data-[toast-type=loading]:bg-violet-50/95",
    ].join(" "),
  });

  return (
    <div
      ref={ref}
      className={className}
      {...handlers}
      {...pauseOnHoverHandlers}
      {...attributes}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <strong className="block text-sm font-semibold text-slate-950">
            {String(currentToast.data.title)}
          </strong>
          {currentToast.data.body ? (
            <p className="mt-1 text-sm leading-5 text-slate-600">
              {String(currentToast.data.body)}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
          onClick={() => dismiss("user")}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

export function App() {
  return (
    <>
      <button
        type="button"
        onClick={() =>
          toast.info({
            title: "Build finished",
            body: "Deploy preview is ready to review.",
          })
        }
      >
        Open toast
      </button>

      <Toaster
        store={toast}
        className="pointer-events-none fixed inset-0 z-[9999]"
      >
        <Toaster.List className={toastListClassName}>
          <TailwindToast />
        </Toaster.List>
      </Toaster>
    </>
  );
}
```

```css
.ht-toast-motion[data-toast-status="entering"] {
  animation: ht-toast-enter 240ms cubic-bezier(0.16, 1, 0.3, 1);
}

.ht-toast-motion[data-toast-status="exiting"][data-toast-swipe-dismissed="false"] {
  animation: ht-toast-exit 180ms ease-in forwards;
}

.ht-toast-motion[data-toast-status="exiting"][data-toast-swipe-dismissed="true"] {
  animation: ht-toast-swipe-exit 180ms ease-in forwards;
}

@keyframes ht-toast-enter {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes ht-toast-exit {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  to {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
}

@keyframes ht-toast-swipe-exit {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}
```

`useToastAnimation()` adds these attributes to help with styling and lifecycle inspection:

- `data-toast`
- `data-toast-id`
- `data-toast-status`
- `data-toast-type`
- `data-toast-swipe-dismissed`

## Common Patterns

### Scoped containers

Use `containerId` to keep notifications inside a specific area:

```tsx
toast.success(
  { title: "Saved", body: "Sidebar settings updated." },
  { containerId: "sidebar" },
);

<Toaster store={toast} containerId="sidebar" inline>
  <Toaster.List className="sidebar-toast-list">
    <AppToast />
  </Toaster.List>
</Toaster>;
```

```css
.sidebar-panel {
  position: relative;
}

.sidebar-toast-list {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: min(24rem, calc(100% - 32px));
}
```

`Toaster` defines the region. `Toaster.List` defines the visible layout for each
active placement group.

### Promise toasts

```tsx
async function saveSettings() {
  await toast.promise(
    fetch("/api/settings", { method: "POST" }).then((response) => {
      if (!response.ok) {
        throw new Error("Request failed");
      }

      return response.json() as Promise<{ workspaceName: string }>;
    }),
    {
      loading: {
        title: "Saving settings",
        body: "We are updating your workspace.",
      },
      success: (result) => ({
        title: "Settings saved",
        body: `${result.workspaceName} is up to date.`,
      }),
      error: (error) => ({
        title: "Could not save settings",
        body: error instanceof Error ? error.message : "Unexpected error.",
      }),
    },
  );
}
```

### Custom reactive views

Use `useStore(toast)` when you want counters, debug panels, or analytics around the current toast list:

```tsx
import { useStore } from "@headless-toast/react";

function ToastDebugPanel() {
  const toasts = useStore(toast);

  return (
    <ul>
      {toasts.map((toast) => (
        <li key={toast.id}>
          {toast.type} - {toast.status}
        </li>
      ))}
    </ul>
  );
}
```

### Fine-grained toast subscriptions

For hot paths, subscribe only to the fields you actually render:

```tsx
import {
  useProgress,
  useToastActions,
  useToastAnimation,
  useToastSelector,
} from "@headless-toast/react";
import type { ReactResolvedToastOptions } from "@headless-toast/react";

type AppToastData = {
  title: string;
  body?: string;
};

function ToastProgressBar() {
  const progress = useProgress<AppToastData>();

  return (
    <div
      className="app-toast__progress"
      style={{ width: `${progress * 100}%` }}
    />
  );
}

function AppToast() {
  const data = useToastSelector((toast) => toast.data as AppToastData);
  const options = useToastSelector(
    (toast) => toast.options as ReactResolvedToastOptions<AppToastData>,
  );
  const { dismiss, pauseOnHoverHandlers } = useToastActions<AppToastData>();
  const { ref, className, attributes, handlers } = useToastAnimation({
    className: "app-toast",
  });

  return (
    <article
      ref={ref}
      className={className}
      {...handlers}
      {...pauseOnHoverHandlers}
      {...attributes}
      data-placement={options.placement ?? "top-right"}
    >
      <strong>{String(data.title)}</strong>
      {data.body ? <p>{String(data.body)}</p> : null}
      <button type="button" onClick={() => dismiss("user")}>
        Dismiss
      </button>
      {options.progress ? <ToastProgressBar /> : null}
    </article>
  );
}
```

Use `useProgressEffect()` when you want to react to progress changes without re-rendering the whole component:

```tsx
import { useRef } from "react";

function DirectDomProgress() {
  const fillRef = useRef<HTMLDivElement | null>(null);
  const valueRef = useRef<HTMLSpanElement | null>(null);

  useProgressEffect((progress) => {
    const percent = Math.round(progress * 100);

    if (fillRef.current) {
      fillRef.current.style.width = `${progress * 100}%`;
    }

    if (valueRef.current) {
      valueRef.current.textContent = `${percent}%`;
    }
  });

  return (
    <div>
      <span ref={valueRef}>0%</span>
      <div ref={fillRef} style={{ width: "0%" }} />
    </div>
  );
}
```

### Drag to dismiss

```tsx
import {
  AnimationWrapper,
  useToast,
  useToastDrag,
} from "@headless-toast/react";

function DraggableToast() {
  const { toast } = useToast();
  const drag = useToastDrag();

  return (
    <AnimationWrapper
      className="app-toast"
      style={drag.style}
      swipeDismissed={drag.swipeDismissed}
      {...drag.handlers}
    >
      <strong>{String(toast.data.title)}</strong>
    </AnimationWrapper>
  );
}
```

Set `draggable: true` or pass a full draggable config in toast options or store defaults.

### Imperative handles

```tsx
async function uploadAsset() {
  const handle = toast.loading({
    title: "Uploading asset",
    body: "Starting upload...",
  });

  try {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    handle.update({
      type: "success",
      data: {
        title: "Upload complete",
        body: "The asset is ready to use.",
      },
    });
  } catch {
    handle.update({
      type: "error",
      data: {
        title: "Upload failed",
        body: "Please try again.",
      },
    });
  }

  await handle.closed;
}
```

## Adapter-Specific Options

On top of the core options, React toasts can also use:

- `placement`
- `containerId`
- `dismissible`
- `pauseOnHover`
- `pauseOnFocusLoss`
- `draggable`
- `stack`

## Development

From `adapters/react/`:

```bash
pnpm exec vitest run
pnpm exec tsc --noEmit
pnpm exec vite build
```
