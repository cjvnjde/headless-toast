import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";

function NotFound() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
        Not found
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl dark:text-slate-50">
        That example does not exist.
      </h1>
      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
        Head back to the overview and pick another example.
      </p>
      <Link
        to="/"
        className="mt-5 inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-indigo-500 hover:shadow-lg dark:bg-indigo-500 dark:hover:bg-indigo-400"
      >
        Go to overview
      </Link>
    </div>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFound,
});

function RootComponent() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <Header />
      <div className="w-full px-4 py-6 sm:px-6">
        <div className="grid gap-6 xl:grid-cols-[18rem_minmax(0,1fr)]">
          <Sidebar />
          <main className="min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
