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
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition duration-150 hover:border-slate-300 hover:bg-slate-100 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
          >
            <ArrowLeft size={15} />
            All examples
          </Link>
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            {category}
          </span>
        </div>

        <div className="mt-6 max-w-5xl">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
            {category}
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl xl:text-6xl dark:text-slate-50">
            {title}
          </h1>
          <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
            {summary}
          </p>
        </div>
      </section>

      <PreviewSurface>{preview}</PreviewSurface>

      <CodeBlock files={files} />
    </div>
  );
}

export { ExamplePage };
