# React examples site

Static docs and examples app for `@headless-toast/react`.

## Goals

- Replace the old Storybook showcase with one GitHub Pages-friendly site.
- Keep every toast example isolated so each page is easy to copy into a real project.
- Use TanStack Router for route-based example pages.
- Use Tailwind CSS v4 for the docs UI.

## Development

From this package directory:

```bash
pnpm dev
```

## Type-check

```bash
pnpm typecheck
```

## Build

```bash
pnpm build
```

The build outputs a static app in `dist/` and writes `404.html` as an SPA fallback so deep links keep working on GitHub Pages.

## GitHub Pages base path

The Vite base path is controlled with `VITE_BASE_PATH`.

```bash
VITE_BASE_PATH=/headless-toast/ pnpm build
```

The GitHub Actions workflow sets this automatically from `actions/configure-pages`.
