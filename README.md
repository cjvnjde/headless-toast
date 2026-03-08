# headless-toast

Headless, framework-agnostic toast notifications.

The repo is split into two layers:

- `@headless-toast/core` is the state machine. It owns toast lifecycle, timers, progress, promise flows, and drag math.
- `@headless-toast/react` is the React adapter. It subscribes to the core store, renders your component, reads DOM animation timing, and wires gestures back into core.

Core is the brain. Adapters are the body.

## Packages

| Package                          | Path              | Purpose                                      |
| -------------------------------- | ----------------- | -------------------------------------------- |
| `@headless-toast/core`           | `core/`           | Framework-free toast store and types         |
| `@headless-toast/react`          | `adapters/react/` | React hooks, components, and adapter helpers |
| `@headless-toast/examples-react` | `examples/react/` | Storybook playground and usage docs          |

## Highlights

- Fully headless API with no built-in toast markup or styles
- Typed toast store with `success`, `error`, `warning`, `info`, and `loading` helpers
- Promise toasts with loading -> success/error updates
- Pause, resume, dismiss, `dismissAll`, and `waitForClose`
- Adapter-driven enter/exit animations with safety fallbacks in core
- React-side placement, scoped containers, stacking, and drag-to-dismiss

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

The library is headless, so you provide the visuals and the animation CSS:

```css
.app-toast {
  min-width: 18rem;
  border: 1px solid #d0d7de;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.14);
  padding: 12px 16px;
}

.app-toast[data-toast-status="entering"] {
  animation: toast-enter 220ms ease-out;
}

.app-toast[data-toast-status="exiting"] {
  animation: toast-exit 180ms ease-in forwards;
}

@keyframes toast-enter {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
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
```

## Workspace Commands

From the repo root:

```bash
pnpm install
pnpm test
pnpm build
pnpm storybook:dev
pnpm storybook:build
pnpm format
```

## Docs

- Architecture: `docs/TOAST_LIBRARY_DESIGN.md`
- Implementation map: `docs/CORE_REACT_IMPLEMENTATION_MAP.md`
- Core package guide: `core/README.md`
- React adapter guide: `adapters/react/README.md`
- Storybook/examples guide: `examples/react/README.md`

## Development Notes

- Package manager: `pnpm`
- Bundler: `vite`
- Tests: `vitest`
- Storybook lives in `examples/react/`
