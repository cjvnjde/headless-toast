import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";

function NotFound() {
  return (
    <div className="doc-card px-6 py-10">
      <p className="doc-eyebrow">Not found</p>
      <h1 className="doc-title mt-2 text-3xl">That example does not exist.</h1>
      <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
        Head back to the overview and pick another example.
      </p>
      <Link to="/" className="doc-button mt-5 inline-flex">
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
    <div className="min-h-screen">
      <Header />
      <div className="site-shell px-4 py-6">
        <div className="grid gap-6 xl:grid-cols-[18rem_minmax(0,1fr)]">
          <Sidebar />
          <main className="min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
