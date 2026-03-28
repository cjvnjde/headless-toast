import { Link } from "@tanstack/react-router";
import { Package, Package2 } from "lucide-react";
import { examples } from "../lib/examples";
import { ThemeToggle } from "./ThemeToggle";

const logoSrc = `${import.meta.env.BASE_URL}toast.png`;

function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
      <div className="w-full px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition duration-150 hover:border-slate-300 hover:bg-slate-100 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50 dark:hover:border-slate-700 dark:hover:bg-slate-800"
            >
              <img
                src={logoSrc}
                alt=""
                aria-hidden="true"
                className="h-5 w-5 flex-none object-contain"
              />
              <span>Headless Toast</span>
            </Link>
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">
              {examples.length} examples
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="https://github.com/cjvnjde/headless-toast"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition duration-150 hover:border-slate-300 hover:bg-slate-100 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
            >
              <Package size={15} />
              GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/@headless-toast/react"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition duration-150 hover:border-slate-300 hover:bg-slate-100 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
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
