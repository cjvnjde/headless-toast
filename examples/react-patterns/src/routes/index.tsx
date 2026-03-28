import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { CodeBlock } from "../components/CodeBlock";
import { examples, groupExamples } from "../lib/examples";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const installFiles = [
  {
    filename: "pnpm",
    language: "bash",
    code: "pnpm add @headless-toast/react",
  },
  {
    filename: "npm",
    language: "bash",
    code: "npm install @headless-toast/react",
  },
  {
    filename: "yarn",
    language: "bash",
    code: "yarn add @headless-toast/react",
  },
  {
    filename: "bun",
    language: "bash",
    code: "bun add @headless-toast/react",
  },
] as const;

function HomePage() {
  const featured = examples.filter((example) => example.featured);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
          React examples
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl xl:text-6xl dark:text-slate-50">
          Copy-ready toast examples.
        </h1>
        <p className="mt-4 max-w-4xl text-base leading-8 text-slate-600 dark:text-slate-300">
          Open any route from the sidebar, try the live preview, and copy the
          exact source used by the example. Each demo keeps its own toast logic
          so it is easy to lift into a real app.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/fundamentals/basic-variants"
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-indigo-500 hover:shadow-lg dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            Start with basics
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/rendering/plain-css"
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition duration-150 hover:border-slate-300 hover:bg-slate-100 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
          >
            Plain CSS
          </Link>
        </div>
      </section>

      <CodeBlock
        eyebrow="Getting started"
        title="Install the React adapter"
        description="@headless-toast/react already includes @headless-toast/core, so you only need one package."
        files={[...installFiles]}
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
              Featured
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">
              Good starting points
            </h2>
          </div>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {featured.length} examples
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {featured.map((example) => (
            <Link
              key={example.path}
              to={example.path}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
                    {example.category}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-50">
                    {example.title}
                  </h3>
                </div>
                <ArrowRight
                  size={18}
                  className="mt-1 flex-none text-indigo-600 dark:text-indigo-300"
                />
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                {example.summary}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {example.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {groupExamples().map((group) => (
        <section key={group.category} className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
                {group.category}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">
                {group.category}
              </h2>
            </div>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {group.items.length} examples
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {group.items.map((example) => (
              <Link
                key={example.path}
                to={example.path}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50">
                      {example.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                      {example.summary}
                    </p>
                  </div>
                  <ArrowRight
                    size={18}
                    className="mt-1 flex-none text-indigo-600 dark:text-indigo-300"
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
