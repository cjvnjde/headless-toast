import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { CodeBlock } from "./CodeBlock";
import { PreviewSurface } from "./PreviewSurface";
import type { CodeFile } from "./CodeBlock";

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
