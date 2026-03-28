import { useState } from "react";
import { Check, Copy, FileCode2 } from "lucide-react";
import { tv } from "tailwind-variants";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { LanguageSupport, LRLanguage } from "@codemirror/language";
import { oneDark } from "@codemirror/theme-one-dark";
import { parser as bashParser } from "@fig/lezer-bash";

type CodeFile = {
  filename: string;
  language: string;
  code: string;
  label?: string;
  copyLabel?: string;
};

type CodeBlockProps = {
  files: CodeFile[];
  eyebrow?: string;
  title?: string;
  description?: string;
};

const bashLanguage = LRLanguage.define({ parser: bashParser });
const bashSupport = new LanguageSupport(bashLanguage);

const languageExtensions = {
  bash: [bashSupport],
  css: [css()],
  js: [javascript({ jsx: true })],
  jsx: [javascript({ jsx: true })],
  sh: [bashSupport],
  ts: [javascript({ typescript: true })],
  tsx: [javascript({ jsx: true, typescript: true })],
};

const fileTabButton = tv({
  base: "inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium shadow-sm transition duration-150 hover:shadow-md",
  variants: {
    active: {
      true: "border-slate-300 bg-slate-100 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50",
      false:
        "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800",
    },
  },
});

function resolveExtensions(language: string) {
  return (
    languageExtensions[language as keyof typeof languageExtensions] ??
    languageExtensions.tsx
  );
}

function CodeBlock({
  files,
  eyebrow = "Code",
  title = "Copy the source",
  description = "Same code as the running demo.",
}: CodeBlockProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  if (files.length === 0) {
    return null;
  }

  const activeFile = files[activeIndex] ?? files[0];
  const lineCount = activeFile.code.split("\n").length;
  const activeLabel = activeFile.label ?? activeFile.filename;
  const copyLabel = activeFile.copyLabel ?? activeLabel;

  async function copy() {
    await navigator.clipboard.writeText(activeFile.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between dark:border-slate-800">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950 dark:text-slate-50">
            {title}
          </h2>
          {description ? (
            <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
              {description}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-3">
          {files.length === 1 ? (
            <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
              {activeLabel}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <FileCode2 size={14} />
            {activeFile.language.toUpperCase()}
          </span>
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {lineCount} lines
          </span>
          <button
            type="button"
            onClick={copy}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition duration-150 hover:border-slate-300 hover:bg-slate-100 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied" : `Copy ${copyLabel}`}
          </button>
        </div>
      </div>

      {files.length > 1 ? (
        <div className="flex flex-wrap gap-2 border-b border-slate-200 px-5 py-3 dark:border-slate-800">
          {files.map((file, index) => (
            <button
              key={file.filename + file.language + (file.label ?? "")}
              type="button"
              className={fileTabButton({ active: index === activeIndex })}
              onClick={() => setActiveIndex(index)}
            >
              {file.label ?? file.filename}
            </button>
          ))}
        </div>
      ) : null}

      <div className="px-5 py-5">
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
          <CodeMirror
            key={`${activeIndex}:${activeFile.language}`}
            value={activeFile.code}
            extensions={[
              EditorView.lineWrapping,
              ...resolveExtensions(activeFile.language),
            ]}
            theme={oneDark}
            editable={false}
            basicSetup={false}
            width="100%"
            minWidth="0"
            maxWidth="100%"
            className="[&_.cm-activeLine]:bg-transparent [&_.cm-activeLineGutter]:bg-transparent [&_.cm-content]:min-w-0 [&_.cm-content]:w-full [&_.cm-content]:p-4 [&_.cm-cursor]:hidden [&_.cm-dropCursor]:hidden [&_.cm-editor]:max-w-full [&_.cm-editor]:bg-slate-950 [&_.cm-editor]:text-sm [&_.cm-editor]:text-sky-100 [&_.cm-focused]:outline-none [&_.cm-gutters]:hidden [&_.cm-line]:px-0 [&_.cm-lineWrapping]:break-words [&_.cm-lineWrapping]:wrap-anywhere [&_.cm-scroller]:max-w-full [&_.cm-scroller]:overflow-x-hidden [&_.cm-scroller]:overflow-y-auto [&_.cm-scroller]:font-mono [&_.cm-scroller]:leading-7 [&_.cm-selectionBackground]:bg-sky-300/25 [&_*::selection]:bg-sky-300/25"
          />
        </div>
      </div>
    </section>
  );
}

export { CodeBlock };
export type { CodeFile };
