#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# ── helpers ──────────────────────────────────────────────────────────────────

die()  { echo "❌ $*" >&2; exit 1; }
info() { echo "ℹ️  $*"; }
ok()   { echo "✅ $*"; }

# ── 1. select package ───────────────────────────────────────────────────────

echo ""
echo "Which package to re-release?"
echo "  1) @headless-toast/core"
echo "  2) @headless-toast/react"
read -rp "Choice [1/2]: " pkg_choice

case "$pkg_choice" in
  1) PKG_NAME="@headless-toast/core";  PKG_DIR="core" ;;
  2) PKG_NAME="@headless-toast/react"; PKG_DIR="adapters/react" ;;
  *) die "Invalid choice" ;;
esac

PKG_JSON="$ROOT/$PKG_DIR/package.json"
CURRENT=$(node -p "require('$PKG_JSON').version")
TAG="$PKG_NAME@$CURRENT"

info "Re-releasing $TAG"

# ── 2. verify tag exists locally ────────────────────────────────────────────

if ! git rev-parse "$TAG" >/dev/null 2>&1; then
  die "Tag $TAG does not exist locally. Nothing to re-release."
fi

# ── 3. check for clean working tree ─────────────────────────────────────────

if [[ -n "$(git status --porcelain)" ]]; then
  die "Working tree is not clean. Commit or stash your changes first."
fi

echo ""
read -rp "Re-release $TAG at current HEAD? [y/N]: " confirm
[[ "$confirm" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 0; }

# ── 4. run checks ───────────────────────────────────────────────────────────

info "Running lint ($PKG_NAME)…"
pnpm --filter "$PKG_NAME" lint
ok "Lint passed"

info "Running tests ($PKG_NAME)…"
pnpm --filter "$PKG_NAME" test
ok "Tests passed"

info "Running build ($PKG_NAME)…"
pnpm --filter "$PKG_NAME" build
ok "Build passed"

# ── 5. delete old tag, re-create at HEAD ─────────────────────────────────────

git tag -d "$TAG"
ok "Deleted old tag $TAG"

git tag "$TAG" -m "Release: $TAG"
ok "Created tag $TAG at HEAD"

# ── 6. regenerate changelog (needs the tag to exist) ────────────────────────

case "$PKG_DIR" in
  core)           pnpm run changelog:core  ;;
  adapters/react) pnpm run changelog:react ;;
esac
ok "Changelog regenerated"

# ── 7. format, then commit changelog (skip-changelog footer) ────────────────

info "Formatting…"
pnpm format
ok "Formatted"

git add "$PKG_DIR/CHANGELOG.md"
git commit -m "chore(release): $TAG" -m "skip-changelog: true"
ok "Committed updated changelog"

# ── 8. re-tag to include the release commit ──────────────────────────────────

git tag -f "$TAG" -m "Release: $TAG"
ok "Re-tagged $TAG (now includes changelog)"

echo ""
echo "🎉 Re-release $TAG is ready!"
echo "   Review with:  git log --oneline -5 && git tag -l '$PKG_NAME@*'"
echo "   Push with:    git push --follow-tags"
echo "   Force-push tag: git push origin $TAG --force"
