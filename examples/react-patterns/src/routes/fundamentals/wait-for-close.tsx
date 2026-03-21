import { createFileRoute } from "@tanstack/react-router";
import { WaitForClosePage } from "#/toasts/fundamentals/wait-for-close/wait-for-close";

const Route = createFileRoute("/fundamentals/wait-for-close")({
  component: WaitForClosePage,
});

export { Route };
