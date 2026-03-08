# React Storybook Examples

Private Storybook workspace for exploring `@headless-toast/react`.

This package acts as the living demo app for the monorepo. It imports the local source for `@headless-toast/core` and `@headless-toast/react`, then documents focused usage patterns through stories and MDX docs.

## What Is Here

- Basic toaster setup and toast type examples
- Behavior demos for timing, pause, and dismissal flows
- Feature stories for limits, layouts, inline containers, and identity
- Advanced integrations with Framer Motion and `@use-gesture/react`
- Tailwind v4 styling examples
- MDX docs for getting started, patterns, and advanced recipes

## Run It

From the repo root:

```bash
pnpm storybook:dev
pnpm storybook:build
```

Or from `examples/react/`:

```bash
pnpm dev
pnpm build
```

## Storybook Setup Notes

- Stories live in `examples/react/src/stories/`
- MDX docs live beside the stories in `examples/react/src/stories/docs/`
- `.storybook/main.ts` aliases `@headless-toast/core` and `@headless-toast/react` to local source files so stories exercise the current workspace code
- Tailwind is enabled through `@tailwindcss/vite`

## Good Entry Points

- `examples/react/src/stories/docs/GettingStarted.mdx`
- `examples/react/src/stories/docs/Patterns.mdx`
- `examples/react/src/stories/toaster/ToasterBasics.stories.tsx`
- `examples/react/src/stories/toaster/ToasterBehavior.stories.tsx`
- `examples/react/src/stories/advanced/SwipeInteractions.stories.tsx`

## Why This Package Exists

- Verify adapter behavior visually while developing the core store
- Capture API patterns that are hard to explain with unit tests alone
- Provide a reference implementation for styling and composition decisions

## Related Docs

- React adapter guide: `../../adapters/react/README.md`
- Root workspace guide: `../../README.md`
