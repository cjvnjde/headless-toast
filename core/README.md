# @headless-toast/core

Framework-free toast state management.

`@headless-toast/core` owns toast lifecycle and timing without touching the DOM or any UI framework. It is the engine that adapters subscribe to.

## What Core Handles

- Toast lifecycle: `entering -> visible -> exiting -> removed`
- Typed toast creation and updates
- Autoclose timers, pause/resume, and progress values
- Promise flows for loading -> success/error toasts
- Close reasons and `waitForClose()`
- Pure drag math through `computeDragState()`
- Subscriber notifications for adapters and custom integrations

## What Core Does Not Handle

- Rendering markup
- CSS classes or animations
- DOM timing APIs
- Pointer events
- Placement containers or portal behavior

Those concerns belong in an adapter such as `@headless-toast/react`.

## Install

```bash
pnpm add @headless-toast/core
```

## Quick Start

```ts
import { createToastStore } from "@headless-toast/core";

type ToastData = {
  title: string;
  body?: string;
};

type ToastOptions = {
  placement?: "top-right" | "bottom-center";
};

const store = createToastStore<ToastData, ToastOptions>({
  defaults: {
    duration: 3000,
    placement: "top-right",
  },
});

store.subscribe((toasts) => {
  console.log(
    toasts.map((toast) => ({
      id: toast.id,
      type: toast.type,
      status: toast.status,
    })),
  );
});

const handle = store.success(
  { title: "Saved", body: "Your changes are live." },
  { placement: "bottom-center" },
);

handle.update({ data: { body: "Closing soon." }, progress: true });
```

## API Snapshot

The store exposes:

- `add()`
- `success()`, `error()`, `warning()`, `info()`, `loading()`
- `update()`, `dismiss()`, `dismissAll()`
- `pause()`, `resume()`
- `promise()`
- `waitForClose()`
- `setAnimationDuration()`, `markEntered()`, `markExited()` for adapter lifecycle wiring

Each creation method returns a `ToastHandle`:

```ts
const handle = store.info({ title: "Heads up" });

console.log(handle.id);

handle.dismiss("programmatic");

await handle.closed;
```

## Promise Toasts

```ts
await store.promise(
  fetch("/api/save").then(
    (response) => response.json() as Promise<{ name: string }>,
  ),
  {
    loading: { title: "Saving..." },
    success: (result) => ({ title: `Saved ${result.name}` }),
    error: () => ({ title: "Save failed" }),
  },
);
```

By default, promise success toasts close after `3000ms` and error toasts after `5000ms`. You can override those durations in store timing config or per call.

## Adapter Contract

Adapters render UI and feed lifecycle events back into core:

```ts
store.setAnimationDuration(handle, "enter", 250);
store.markEntered(handle);

store.dismiss(handle, "user");
store.setAnimationDuration(handle, "exit", 180);
store.markExited(handle);
```

Core also starts safety timeouts so the lifecycle can still progress if an adapter never reports completion.

## Drag Math

`computeDragState()` is exported as a pure helper for adapters:

```ts
import { computeDragState } from "@headless-toast/core";

const drag = computeDragState(
  { threshold: 100, direction: "x" },
  { dx: 120, dy: 0, vx: 1.2, vy: 0 },
);

if (drag.dismissed) {
  store.dismiss(handle, "swipe");
}
```

## Development

From `core/`:

```bash
pnpm exec vitest run
pnpm exec tsc --noEmit
pnpm exec vite build
```

## Related Docs

- Package source: `core/src/index.ts`
- Architecture: `../docs/TOAST_LIBRARY_DESIGN.md`
- Implementation details: `../docs/CORE_REACT_IMPLEMENTATION_MAP.md`
- React adapter: `../adapters/react/README.md`
