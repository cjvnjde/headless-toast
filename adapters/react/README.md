# @headless-toast/react

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
- `useToastAnimation()` for DOM timing and phase completion
- `useToastDrag()` for pointer-driven drag-to-dismiss
- `useStore()` for custom reactive views over the toast array
- `AnimationWrapper` as a convenience wrapper around animation attributes and handlers

## Quick Start

```tsx
import {
  createToast,
  Toaster,
  useToast,
  useToastAnimation,
} from "@headless-toast/react";

const { toast } = createToast<{
  title: string;
  body?: string;
}>({
  maxToasts: 3,
  defaults: {
    duration: 4000,
    placement: "top-right",
    pauseOnHover: true,
    dismissible: true,
  },
});

function AppToast() {
  const { toast, dismiss, pauseOnHoverHandlers } = useToast();
  const { ref, className, attributes, handlers } = useToastAnimation({
    className: "app-toast",
  });

  return (
    <div
      ref={ref}
      className={className}
      {...handlers}
      {...pauseOnHoverHandlers}
      {...attributes}
    >
      <strong>{String(toast.data.title)}</strong>
      {toast.data.body ? <p>{String(toast.data.body)}</p> : null}
      <button onClick={() => dismiss("user")}>Close</button>
    </div>
  );
}

export function App() {
  return (
    <>
      <button
        onClick={() =>
          toast.success({
            title: "Saved",
            body: "Profile updated successfully.",
          })
        }
      >
        Show toast
      </button>

      <Toaster store={toast} className="app-toast-region">
        <Toaster.List className="app-toast-list">
          <AppToast />
        </Toaster.List>
      </Toaster>
    </>
  );
}
```

`Toaster` owns the region and portal behavior. `Toaster.List` is the element you
style for placement groups. It renders once per active placement, while the
store and hooks remain responsible for placement and toast state.

## Styling And Animation

The adapter reads the actual animation or transition duration from the rendered element. That means your toast component needs real CSS for enter and exit states.

If you want a safe starting point, these defaults work well in most apps:

- `maxToasts: 3`
- `duration: 4000`
- `placement: "top-right"`
- `pauseOnHover: true`
- `dismissible: true`

They keep the UI readable, avoid overly aggressive auto-dismiss timing, and match common product expectations.

For visuals, a good baseline is:

- Width around `18rem` to `24rem`
- Padding around `12px 16px`
- Radius around `12px` to `16px`
- A neutral surface with one accent color per toast type
- Enter motion around `220ms` to `280ms`
- Exit motion around `160ms` to `200ms`

```css
.app-toast-region {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
}

.app-toast-list {
  position: fixed;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: min(24rem, calc(100vw - 24px));
  padding: 16px;
}

.app-toast {
  min-width: 18rem;
  max-width: 24rem;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #d0d7de;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.16);
  padding: 12px 16px;
}

.app-toast[data-toast-status="entering"] {
  animation: toast-enter 240ms cubic-bezier(0.16, 1, 0.3, 1);
}

.app-toast[data-toast-status="exiting"][data-toast-swipe-dismissed="false"] {
  animation: toast-exit 180ms ease-in forwards;
}

.app-toast[data-toast-status="exiting"][data-toast-swipe-dismissed="true"] {
  animation: toast-swipe-exit 180ms ease-in forwards;
}

@keyframes toast-enter {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.98);
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
    transform: translateY(-8px) scale(0.98);
  }
}

@keyframes toast-swipe-exit {
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

<Toaster store={store} containerId="sidebar" inline>
  <Toaster.List className="sidebar-toast-list">
    <AppToast />
  </Toaster.List>
</Toaster>;
```

`Toaster` defines the region. `Toaster.List` defines the visible layout for each
active placement group.

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

For interactive examples, run the Storybook app in `examples/react/`.

## Related Docs

- Core package: `../../core/README.md`
- Architecture: `../../docs/TOAST_LIBRARY_DESIGN.md`
- Implementation map: `../../docs/CORE_REACT_IMPLEMENTATION_MAP.md`
- Storybook examples: `../../examples/react/README.md`
