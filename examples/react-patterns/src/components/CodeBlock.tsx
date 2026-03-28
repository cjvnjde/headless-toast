import { useState } from "react";
import { Check, Copy, FileCode2 } from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
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
    <section className="doc-card overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-(--line) px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="doc-eyebrow">{eyebrow}</p>
          <h2 className="mt-1 text-lg font-semibold text-(--ink)">{title}</h2>
          {description ? (
            <p className="mt-2 text-sm leading-7 text-(--ink-soft)">
              {description}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {files.length === 1 ? (
            <span className="doc-chip">{activeLabel}</span>
          ) : null}
          <span className="doc-chip">
            <FileCode2 size={15} />
            {activeFile.language.toUpperCase()}
          </span>
          <span className="doc-chip">{lineCount} lines</span>
          <button
            type="button"
            onClick={copy}
            className="doc-button doc-button-secondary"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied" : `Copy ${copyLabel}`}
          </button>
        </div>
      </div>

      {files.length > 1 ? (
        <div className="flex flex-wrap gap-2 border-b border-(--line) px-5 py-3">
          {files.map((file, index) => (
            <button
              key={file.filename + file.language + (file.label ?? "")}
              type="button"
              className={
                index === activeIndex ? "doc-tab is-active" : "doc-tab"
              }
              onClick={() => setActiveIndex(index)}
            >
              {file.label ?? file.filename}
            </button>
          ))}
        </div>
      ) : null}

      <div className="px-5 py-5">
        <div className="doc-code-block">
          <CodeMirror
            key={`${activeIndex}:${activeFile.language}`}
            value={activeFile.code}
            extensions={resolveExtensions(activeFile.language)}
            theme={oneDark}
            editable={false}
            basicSetup={false}
            className="doc-code-editor"
          />
        </div>
      </div>
    </section>
  );
}

export { CodeBlock };
export type { CodeFile };
