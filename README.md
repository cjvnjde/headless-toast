# headless-toast

[![npm: @headless-toast/core](https://img.shields.io/npm/v/%40headless-toast%2Fcore?label=%40headless-toast%2Fcore)](https://www.npmjs.com/package/@headless-toast/core)
[![npm: @headless-toast/react](https://img.shields.io/npm/v/%40headless-toast%2Freact?label=%40headless-toast%2Freact)](https://www.npmjs.com/package/@headless-toast/react)

Headless, framework-agnostic toast notifications.

The repo is split into two layers:

- `@headless-toast/core` is the state machine. It owns toast lifecycle, timers, progress, promise flows, and drag math.
- `@headless-toast/react` is the React adapter. It subscribes to the core store, renders your component, reads DOM animation timing, and wires gestures back into core.

Core is the brain. Adapters are the body.

## Packages

| Package                 | Path              | Purpose                                      |
| ----------------------- | ----------------- | -------------------------------------------- |
| `@headless-toast/core`  | `core/`           | Framework-free toast store and types         |
| `@headless-toast/react` | `adapters/react/` | React hooks, components, and adapter helpers |

## Highlights

- Fully headless API with no built-in toast markup or styles
- Typed toast store with `success`, `error`, `warning`, `info`, and `loading` helpers
- Promise toasts with loading -> success/error updates
- Pause, resume, dismiss, `dismissAll`, and `waitForClose`
- Adapter-driven enter/exit animations with safety fallbacks in core
- React-side placement, scoped containers, stacking, and drag-to-dismiss

## Getting Started

### Install

```bash
pnpm add @headless-toast/react react react-dom
```

### React quick start

This example is intentionally complete, including the CSS that keeps the toast clickable.

```tsx
import {
  createToast,
  Toaster,
  useToast,
  useToastAnimation,
} from "@headless-toast/react";
import "./app.css";

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
      <div className="ht-toast__body">
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
            title: "Profile saved",
            body: "Your changes are live.",
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
  color-scheme: light;
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

.ht-toast__body {
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

.ht-toast__close:hover {
  background: rgba(148, 163, 184, 0.24);
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

  .ht-toast {
    border-radius: 16px;
    padding: 13px 14px;
  }
}
```

The most common cause of "unclickable" toasts is leaving `pointer-events: none` on the toast card itself. In the example above, the overlay and placement list ignore pointer events, but the actual toast opts back in with `pointer-events: auto`.

### Tailwind quick start

If you prefer Tailwind, keep the same structure: non-interactive region, interactive card.

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

### More examples

#### Promise toast

```tsx
async function saveProfile() {
  await toast.promise(
    fetch("/api/profile", { method: "POST" }).then((response) => {
      if (!response.ok) {
        throw new Error("Save failed");
      }

      return response.json() as Promise<{ name: string }>;
    }),
    {
      loading: { title: "Saving profile", body: "Please wait a moment." },
      success: (result) => ({
        title: "Profile saved",
        body: `Updated ${result.name}.`,
      }),
      error: (error) => ({
        title: "Could not save profile",
        body: error instanceof Error ? error.message : "Unexpected error.",
      }),
    },
  );
}
```

#### Scoped inline container

```tsx
const { toast: dashboardToast } = createToast<{
  title: string;
  body?: string;
}>();

function DashboardPanel() {
  return (
    <section className="dashboard-panel">
      <button
        type="button"
        onClick={() =>
          dashboardToast.success(
            {
              title: "Widget updated",
              body: "Only this panel shows the toast.",
            },
            { containerId: "settings-panel" },
          )
        }
      >
        Save widget
      </button>

      <Toaster store={dashboardToast} containerId="settings-panel" inline>
        <Toaster.List className="dashboard-toast-list">
          <AppToast />
        </Toaster.List>
      </Toaster>
    </section>
  );
}
```

```css
.dashboard-panel {
  position: relative;
}

.dashboard-toast-list {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: min(24rem, calc(100% - 32px));
}
```

#### Imperative update

```tsx
const handle = toast.loading({
  title: "Uploading assets",
  body: "0 of 3 files uploaded.",
});

handle.update({
  type: "success",
  data: {
    title: "Upload complete",
    body: "All files are ready.",
  },
});

await handle.closed;
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

## Publishing

Publishing is driven by Git tags. Pushing a matching tag triggers `.github/workflows/publish.yml`.

### Tag format

- Stable release: `@headless-toast/<package>@<version>`
- Prerelease: `@headless-toast/<package>@<version>-<channel>.<number>`

Examples:

```bash
@headless-toast/core@0.2.0
@headless-toast/react@0.2.0
@headless-toast/core@0.3.0-alpha.1
@headless-toast/react@0.3.0-rc.2
```

Rules:

- `<package>` must match the published workspace package name, currently `core` or `react`
- The tag version must exactly match that package's `package.json` version
- `alpha`, `beta`, and `rc` tags publish to the matching npm dist-tag; stable releases publish to `latest`

### Release flow

1. Bump the version in the target package's `package.json`
2. For stable releases, generate and review that package's `CHANGELOG.md`
3. Commit the version and changelog updates
4. Create the release tag
5. Push the commit and tag to GitHub

Example for `@headless-toast/core`:

```bash
git tag "@headless-toast/core@0.2.0"
git push origin main --tags
```

Example for a prerelease:

```bash
git tag "@headless-toast/react@0.3.0-beta.1" -m "Release: @headless-toast/react@0.3.0-beta.1"
git push --tags
```

### Changelog generation

Stable releases require a `CHANGELOG.md` entry for the tagged version. This repo uses `git-cliff` with package-scoped scripts:

```bash
pnpm changelog:core
pnpm changelog:react
```

What those scripts do:

- Generate `core/CHANGELOG.md` or `adapters/react/CHANGELOG.md`
- Include commits only from that package path
- Group entries from conventional commit types like `feat`, `fix`, `refactor`, and `docs`
- Ignore prerelease tags when building the stable changelog

Recommended release commit flow:

```bash
# update version first
pnpm changelog:core
git add core/package.json core/CHANGELOG.md
git commit -m "chore(release): release @headless-toast/core 0.2.0" -m "skip-changelog: true"
git tag "@headless-toast/core@0.2.0"
git push origin main --tags
```

Universal changelog opt-out rule:

If you want any commit to pass the current conventional commitlint checks but stay out of the generated changelog, add this footer to the commit message:

```text
skip-changelog: true
```

Examples:

```bash
git commit -m "chore: bump @headless-toast/core to 0.2.0" -m "skip-changelog: true"
git commit -m "docs(core): internal release docs update" -m "skip-changelog: true"
```

Notes:

- Stable tags fail in CI if the package changelog is missing or does not contain the tagged version
- Prereleases do not require a changelog entry
- The publish workflow also runs lint, test, and build before publishing to npm and creating the GitHub release

## Docs

- Core package guide: `core/README.md`
- React adapter guide: `adapters/react/README.md`

## Development Notes

- Package manager: `pnpm`
- Bundler: `vite`
- Tests: `vitest`
