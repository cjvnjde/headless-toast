import { Link } from "@tanstack/react-router";
import { groupExamples } from "../lib/examples";

function Sidebar() {
  return (
    <aside className="hidden xl:block xl:w-[18rem] xl:flex-none">
      <div className="sticky top-20">
        <nav className="doc-card max-h-[calc(100vh-6.5rem)] overflow-y-auto p-3">
          <div className="mb-3 px-2">
            <p className="doc-eyebrow">Examples</p>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              Browse every toast pattern.
            </p>
          </div>

          <div className="space-y-4">
            {groupExamples().map((group) => (
              <div key={group.category}>
                <h2 className="px-2 text-[11px] font-semibold tracking-[0.16em] text-[var(--ink-soft)] uppercase">
                  {group.category}
                </h2>
                <div className="mt-1 space-y-1">
                  {group.items.map((example) => (
                    <Link
                      key={example.path}
                      to={example.path}
                      className="doc-nav-link"
                      activeProps={{ className: "doc-nav-link is-active" }}
                    >
                      <span className="block text-sm font-medium text-[var(--ink)]">
                        {example.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </nav>
      </div>
    </aside>
  );
}

export { Sidebar };
