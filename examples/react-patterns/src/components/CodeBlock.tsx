import { useMemo, useState } from "react";
import { Check, Copy, FileCode2 } from "lucide-react";

type CodeFile = {
  filename: string;
  language: string;
  code: string;
};

type CodeBlockProps = {
  files: CodeFile[];
};

const tsxKeywords = new Set([
  "as",
  "async",
  "await",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "default",
  "else",
  "export",
  "extends",
  "false",
  "finally",
  "for",
  "from",
  "function",
  "if",
  "import",
  "in",
  "interface",
  "let",
  "new",
  "null",
  "return",
  "satisfies",
  "switch",
  "throw",
  "true",
  "try",
  "type",
  "typeof",
  "undefined",
  "useEffect",
  "useRef",
  "useState",
  "var",
  "void",
  "while",
]);

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function wrap(tokenClass: string, value: string) {
  return `<span class="${tokenClass}">${escapeHtml(value)}</span>`;
}

function highlightTsx(code: string) {
  const pattern =
    /(\/\*[\s\S]*?\*\/|(^|[^:])\/\/.*$|`(?:\\.|[^`])*`|"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\b(?:as|async|await|break|case|catch|class|const|continue|default|else|export|extends|false|finally|for|from|function|if|import|in|interface|let|new|null|return|satisfies|switch|throw|true|try|type|typeof|undefined|var|void|while)\b|\b(?:useEffect|useRef|useState)\b|\b[A-Z][A-Za-z0-9_]*\b|\b\d+(?:\.\d+)?\b)/gm;

  let result = "";
  let lastIndex = 0;

  for (const match of code.matchAll(pattern)) {
    const index = match.index ?? 0;
    const value = match[0];
    result += escapeHtml(code.slice(lastIndex, index));

    if (value.startsWith("/*") || value.includes("//")) {
      result += wrap("token-comment", value);
    } else if (
      value.startsWith("`") ||
      value.startsWith('"') ||
      value.startsWith("'")
    ) {
      result += wrap("token-string", value);
    } else if (/^\d/.test(value)) {
      result += wrap("token-number", value);
    } else if (tsxKeywords.has(value)) {
      result += wrap("token-keyword", value);
    } else if (/^[A-Z]/.test(value)) {
      result += wrap("token-type", value);
    } else {
      result += escapeHtml(value);
    }

    lastIndex = index + value.length;
  }

  result += escapeHtml(code.slice(lastIndex));
  return result;
}

function highlightCss(code: string) {
  const pattern =
    /(\/\*[\s\S]*?\*\/|"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|@[a-zA-Z-]+|#[\w-]+|\.[\w-]+|--[\w-]+|\b\d+(?:\.\d+)?(?:ms|s|px|rem|em|vh|vw|%)?\b)/gm;

  let result = "";
  let lastIndex = 0;

  for (const match of code.matchAll(pattern)) {
    const index = match.index ?? 0;
    const value = match[0];
    result += escapeHtml(code.slice(lastIndex, index));

    if (value.startsWith("/*")) {
      result += wrap("token-comment", value);
    } else if (value.startsWith("@")) {
      result += wrap("token-keyword", value);
    } else if (value.startsWith("#") || value.startsWith(".")) {
      result += wrap("token-type", value);
    } else if (value.startsWith("--")) {
      result += wrap("token-property", value);
    } else if (value.startsWith('"') || value.startsWith("'")) {
      result += wrap("token-string", value);
    } else {
      result += wrap("token-number", value);
    }

    lastIndex = index + value.length;
  }

  result += escapeHtml(code.slice(lastIndex));
  return result;
}

function highlightBash(code: string) {
  const pattern =
    /(^\s*(?:pnpm|npm|yarn|npx|git|cd)\b|--?[\w-]+|"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\b\d+(?:\.\d+)?\b)/gm;

  let result = "";
  let lastIndex = 0;

  for (const match of code.matchAll(pattern)) {
    const index = match.index ?? 0;
    const value = match[0];
    result += escapeHtml(code.slice(lastIndex, index));

    if (value.startsWith("--")) {
      result += wrap("token-property", value);
    } else if (value.startsWith('"') || value.startsWith("'")) {
      result += wrap("token-string", value);
    } else if (/^\s*\d/.test(value)) {
      result += wrap("token-number", value);
    } else {
      result += wrap("token-keyword", value);
    }

    lastIndex = index + value.length;
  }

  result += escapeHtml(code.slice(lastIndex));
  return result;
}

function highlightCode(language: string, code: string) {
  if (language === "css") return highlightCss(code);
  if (language === "bash" || language === "sh") return highlightBash(code);
  return highlightTsx(code);
}

function CodeBlock({ files }: CodeBlockProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const activeFile = files[activeIndex];
  const lineCount = useMemo(
    () => activeFile.code.split("\n").length,
    [activeFile.code],
  );
  const highlightedCode = useMemo(
    () => highlightCode(activeFile.language, activeFile.code),
    [activeFile.code, activeFile.language],
  );

  async function copy() {
    await navigator.clipboard.writeText(activeFile.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <section className="doc-card overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-(--line) px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="doc-eyebrow">Live source</p>
          <h2 className="mt-1 text-lg font-semibold text-(--ink)">
            Same code as the running demo
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
            {copied ? "Copied" : `Copy ${activeFile.filename}`}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-(--line) px-5 py-3">
        {files.map((file, index) => (
          <button
            key={file.filename}
            type="button"
            className={index === activeIndex ? "doc-tab is-active" : "doc-tab"}
            onClick={() => setActiveIndex(index)}
          >
            {file.filename}
          </button>
        ))}
      </div>

      <div className="px-5 py-5">
        <pre className="doc-code-block">
          <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
        </pre>
      </div>
    </section>
  );
}

export { CodeBlock };
export type { CodeFile };
