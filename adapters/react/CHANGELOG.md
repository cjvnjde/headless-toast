# Changelog

All notable changes to this project will be documented in this file.

## unreleased

### Bug Fixes

- Enable skipLibCheck in tsconfig for faster type checking

### Refactoring

- Replace normalizeData with resolveData for improved type handling

### Miscellaneous

- Update dependencies in package.json and pnpm-workspace.yaml

## react@0.0.1 - 2026-03-14

### Features

- Refactor toast management for improved state handling and add destroy method
- Bump version to 0.0.1-alpha.6 for both @headless-toast/react and @headless-toast/core
- Enhance type safety in useToastAnimation and AnimationResult for better flexibility
- Update README with installation instructions, usage examples, and improved toast styling
- Refactor Toaster component to use Toaster.List for rendering toast items
- Refactor Toaster component to use Toaster.List for rendering toast items
- Add animation duration calculation utilities
- Enhance TypeScript configuration and update Vite plugin settings
- Add core logic and react adapter

### Refactoring

- Use DRAG_DIRECTION constant for draggable config direction
- Rename examples/react to examples/react-storybook
- Replace string literals with constants for toast configuration
- Update toast API to use `toast` instead of `store` for state management

### Documentation

- Update GettingStarted and README with toast defaults and styling guidance

### Miscellaneous

- Add CHANGELOG to document notable project changes
- Update package versions from alpha to stable release
- Update package versions and add esbuild support in pnpm workspace
- Bump version to 0.0.1-alpha.4 for both core and react packages
- Update build script and TypeScript configuration for declaration generation
- Set skipLibCheck to false in tsconfig.json
- Bump version to 0.0.1-alpha.3 for both core and react packages
- Update packageManager version to pnpm@10.31.0
- Add repository URL to package.json
- Increment package version
