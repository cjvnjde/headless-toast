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
      <section className="doc-hero">
        <p className="doc-eyebrow">React examples</p>
        <h1 className="doc-title mt-3">Copy-ready toast examples.</h1>
        <p className="mt-4 max-w-4xl text-base leading-8 text-(--ink-soft)">
          Open any route from the sidebar, try the live preview, and copy the
          exact source used by the example. Each demo keeps its own toast logic
          so it is easy to lift into a real app.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/fundamentals/basic-variants" className="doc-button">
            Start with basics
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/rendering/tailwind-styled"
            className="doc-button doc-button-secondary"
          >
            Tailwind v4 example
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
            <p className="doc-eyebrow">Featured</p>
            <h2 className="mt-2 text-2xl font-semibold text-(--ink)">
              Good starting points
            </h2>
          </div>
          <span className="doc-chip">{featured.length} examples</span>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {featured.map((example) => (
            <Link
              key={example.path}
              to={example.path}
              className="doc-card example-card p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="doc-eyebrow">{example.category}</p>
                  <h3 className="mt-2 text-lg font-semibold text-(--ink)">
                    {example.title}
                  </h3>
                </div>
                <ArrowRight
                  size={18}
                  className="mt-1 flex-none text-(--accent)"
                />
              </div>
              <p className="mt-3 text-sm leading-7 text-(--ink-soft)">
                {example.summary}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {example.tags.map((tag) => (
                  <span key={tag} className="doc-tag">
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
              <p className="doc-eyebrow">{group.category}</p>
              <h2 className="mt-2 text-2xl font-semibold text-(--ink)">
                {group.category}
              </h2>
            </div>
            <span className="doc-chip">{group.items.length} examples</span>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {group.items.map((example) => (
              <Link
                key={example.path}
                to={example.path}
                className="doc-card example-card p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-(--ink)">
                      {example.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-(--ink-soft)">
                      {example.summary}
                    </p>
                  </div>
                  <ArrowRight
                    size={18}
                    className="mt-1 flex-none text-(--accent)"
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
