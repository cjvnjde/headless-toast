import type { ReactNode } from "react";

type PreviewSurfaceProps = {
  children: ReactNode;
};

function PreviewSurface({ children }: PreviewSurfaceProps) {
  return (
    <div className="overflow-visible rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 text-slate-500 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
        <div className="inline-flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>
        <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">
          Try the example
        </p>
        <span className="ml-auto text-xs text-slate-500 max-md:ml-0 max-md:w-full dark:text-slate-400">
          Fixed-position demos use the browser viewport.
        </span>
      </div>
      <div className="relative overflow-visible p-4 sm:p-5 [&>*]:relative [&>*]:z-10">
        {children}
      </div>
    </div>
  );
}

export { PreviewSurface };
