import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { CodeFile } from "./CodeBlock";
import { CodeBlock } from "./CodeBlock";
import { PreviewSurface } from "./PreviewSurface";

type ExamplePageProps = {
  category: string;
  title: string;
  summary: string;
  notes?: string[];
  files: CodeFile[];
  preview: ReactNode;
};

function ExamplePage({
  category,
  title,
  summary,
  notes,
  files,
  preview,
}: ExamplePageProps) {
  return (
    <div className="space-y-6">
      <section className="doc-hero overflow-hidden">
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/" className="doc-chip-link">
            <ArrowLeft size={15} />
            All examples
          </Link>
          <span className="doc-chip">{category}</span>
        </div>

        <div className="mt-6 max-w-5xl">
          <h1 className="doc-title">{title}</h1>
          <p className="mt-4 text-base leading-8 text-(--ink-soft)">
            {summary}
          </p>
        </div>
      </section>

      {notes && notes.length > 0 ? (
        <section className="doc-card px-5 py-5">
          <div className="border-b border-(--line) pb-4">
            <p className="doc-eyebrow">Why this pattern</p>
            <h2 className="mt-1 text-lg font-semibold text-(--ink)">
              Key takeaways
            </h2>
          </div>
          <ul className="space-y-3 pt-5">
            {notes.map((note) => (
              <li key={note} className="flex gap-3">
                <span className="mt-2 h-2.5 w-2.5 flex-none rounded-full bg-(--accent)" />
                <p className="text-sm leading-7 text-(--ink-soft)">{note}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="doc-card doc-preview-card px-5 py-5">
        <div className="border-b border-(--line) pb-4">
          <p className="doc-eyebrow">Interactive demo</p>
          <h2 className="mt-1 text-lg font-semibold text-(--ink)">Preview</h2>
        </div>
        <div className="pt-5">
          <PreviewSurface>{preview}</PreviewSurface>
        </div>
      </section>

      <CodeBlock files={files} />
    </div>
  );
}

export { ExamplePage };
