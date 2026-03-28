import { Link } from "@tanstack/react-router";
import { groupExamples } from "../lib/examples";

function Sidebar() {
  return (
    <aside className="hidden xl:block xl:w-72 xl:flex-none">
      <div className="sticky top-23">
        <nav className="max-h-[calc(100vh-6.5rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-4">
            {groupExamples().map((group) => (
              <div key={group.category}>
                <h2 className="px-2 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  {group.category}
                </h2>
                <div className="mt-1 space-y-1">
                  {group.items.map((example) => (
                    <Link
                      key={example.path}
                      to={example.path}
                      className="block rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                      activeProps={{
                        className:
                          "block rounded-xl border border-slate-300 bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-700 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50",
                      }}
                    >
                      {example.title}
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
