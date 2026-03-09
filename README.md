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

const { toast } = createToast<{
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

      <Toaster store={toast} component={AppToast} />
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
git commit -m "chore(release): release @headless-toast/core 0.2.0"
git tag "@headless-toast/core@0.2.0"
git push origin main --tags
```

Notes:

- Stable tags fail in CI if the package changelog is missing or does not contain the tagged version
- Prereleases do not require a changelog entry
- The publish workflow also runs lint, test, and build before publishing to npm and creating the GitHub release

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
