import { createFileRoute } from "@tanstack/react-router";
import { PromiseLifecyclePage } from "#/toasts/fundamentals/promise-lifecycle/promise-lifecycle";

const Route = createFileRoute("/fundamentals/promise-lifecycle")({
  component: PromiseLifecyclePage,
});

export { Route };
