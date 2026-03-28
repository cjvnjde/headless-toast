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
echo "Which package to release?"
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
info "Current version of $PKG_NAME: $CURRENT"

# ── 2. select bump type ─────────────────────────────────────────────────────

echo ""
echo "Bump type?"
echo "  1) patch"
echo "  2) minor"
echo "  3) major"
read -rp "Choice [1/2/3]: " bump_choice

IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"

case "$bump_choice" in
  1) PATCH=$((PATCH + 1)) ;;
  2) MINOR=$((MINOR + 1)); PATCH=0 ;;
  3) MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0 ;;
  *) die "Invalid choice" ;;
esac

NEW_VERSION="$MAJOR.$MINOR.$PATCH"
TAG="$PKG_NAME@$NEW_VERSION"

echo ""
info "$CURRENT → $NEW_VERSION"
info "Tag: $TAG"
read -rp "Continue? [y/N]: " confirm
[[ "$confirm" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 0; }

# ── 3. check for clean working tree ─────────────────────────────────────────

if [[ -n "$(git status --porcelain)" ]]; then
  die "Working tree is not clean. Commit or stash your changes first."
fi

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

# ── 5. bump version in package.json ─────────────────────────────────────────

node -e "
  const fs = require('fs');
  const p = JSON.parse(fs.readFileSync('$PKG_JSON','utf8'));
  p.version = '$NEW_VERSION';
  fs.writeFileSync('$PKG_JSON', JSON.stringify(p, null, 2) + '\n');
"
ok "Updated $PKG_DIR/package.json → $NEW_VERSION"

# ── 6. create tag (on current HEAD, before changelog commit) ─────────────────

git tag "$TAG" -m "Release: $TAG"
ok "Created tag $TAG"

# ── 7. generate changelog (needs the tag to exist) ──────────────────────────

case "$PKG_DIR" in
  core)           pnpm run changelog:core  ;;
  adapters/react) pnpm run changelog:react ;;
esac
ok "Changelog generated"

# ── 8. format, then commit version + changelog (skip-changelog footer) ──────

info "Formatting…"
pnpm format
ok "Formatted"

git add "$PKG_DIR/package.json" "$PKG_DIR/CHANGELOG.md"
git commit -m "chore(release): $TAG" -m "skip-changelog: true"
ok "Committed release changes"

# ── 9. re-tag to include the release commit ──────────────────────────────────

git tag -f "$TAG" -m "Release: $TAG"
ok "Re-tagged $TAG (now includes changelog)"

echo ""
echo "🎉 Release $TAG is ready!"
echo "   Review with:  git log --oneline -5 && git tag -l '$PKG_NAME@*'"
echo "   Push with:    git push --follow-tags"
