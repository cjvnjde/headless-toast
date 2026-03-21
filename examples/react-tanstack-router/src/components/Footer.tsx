import { examples } from "../lib/examples";

function Footer() {
  return (
    <footer className="site-shell px-4 pb-12 pt-10 text-sm text-[var(--ink-soft)]">
      <div className="doc-card grid gap-4 px-5 py-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <p className="doc-eyebrow">Examples site</p>
          <p className="mt-2 max-w-3xl leading-6">
            Built with TanStack Router, Tailwind v4, and static hosting in mind.
            Every route is focused on one toast pattern and ships with matching
            source.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="doc-chip">{examples.length} isolated examples</span>
          <span className="doc-chip">ES modules from source</span>
          <span className="doc-chip">GitHub Pages ready</span>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
