import { Link } from "@tanstack/react-router";
import { Github, Package2 } from "lucide-react";
import { examples } from "../lib/examples";
import { ThemeToggle } from "./ThemeToggle";

function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-(--line) bg-(--header-bg)/96 backdrop-blur">
      <div className="site-shell px-4 py-3">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className="brand-mark">
              <span className="brand-dot" />
              <span>Headless Toast</span>
            </Link>
            <span className="doc-tag">{examples.length} examples</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="https://github.com/cjvnjde/headless-toast"
              target="_blank"
              rel="noreferrer"
              className="doc-chip-link"
            >
              <Github size={15} />
              GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/@headless-toast/react"
              target="_blank"
              rel="noreferrer"
              className="doc-chip-link"
            >
              <Package2 size={15} />
              npm
            </a>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

export { Header };
