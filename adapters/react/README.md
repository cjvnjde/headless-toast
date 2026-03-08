# @headless-toast/react

React bindings for `headless-toast`.

This package pairs the headless core store with React rendering primitives. You bring the markup and styles; the adapter handles subscription, context, animation timing, placement grouping, and gesture wiring.

## Install

```bash
pnpm add @headless-toast/react react react-dom
```

`@headless-toast/react` depends on `@headless-toast/core`, so you do not need to install the core package separately unless you want to import it directly.

## What You Get

- `createToast()` for isolated `{ store, toast }` pairs
- `toast` and `defaultStore` for a shared singleton flow
- `Toaster` to render your toast component
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

const { store, toast } = createToast<{
  title: string;
  body?: string;
}>({
  defaults: {
    duration: 3000,
    placement: "top-right",
    pauseOnHover: true,
    dismissible: true,
  },
});

function AppToast() {
  const { toast: item, dismiss, pauseOnHoverHandlers } = useToast();
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
      <strong>{String(item.data.title)}</strong>
      {item.data.body ? <p>{String(item.data.body)}</p> : null}
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

      <Toaster store={store} component={AppToast} />
    </>
  );
}
```

## Styling And Animation

The adapter reads the actual animation or transition duration from the rendered element. That means your toast component needs real CSS for enter and exit states.

```css
.app-toast {
  min-width: 18rem;
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

<Toaster
  store={store}
  component={AppToast}
  containerId="sidebar"
  inline
  placements={["top-right"]}
/>;
```

### Custom reactive views

Use `useStore(store)` when you want counters, debug panels, or analytics around the current toast list:

```tsx
import { useStore } from "@headless-toast/react";

function ToastDebugPanel() {
  const toasts = useStore(store);

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
