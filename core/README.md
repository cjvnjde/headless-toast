# @headless-toast/core

[![NPM Version](https://img.shields.io/npm/v/%40headless-toast%2Fcore?label=%40headless-toast%2Fcore)](https://www.npmjs.com/package/@headless-toast/core)

Framework-free toast state management.

`@headless-toast/core` owns toast lifecycle and timing without touching the DOM or any UI framework. It is the engine that adapters use to build UI components and integrations.

## What Core Handles

- Toast lifecycle: `entering -> visible -> exiting`
- Toast creation and updates
- Autoclose timers, pause/resume, and progress values
- Promise flows for loading -> success/error toasts
- Close reasons and `waitForClose()`
- Subscriber notifications for adapters and custom integrations

## What Core Does Not Handle

- Rendering markup
- CSS classes or animations
- DOM timing APIs
- Pointer events
- Placement containers or portal behavior

Those concerns belong in adapters.

## Install

```bash
npm install @headless-toast/core
```

```bash
pnpm add @headless-toast/core
```

```bash
bun add @headless-toast/core
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
