import { createFileRoute } from "@tanstack/react-router";
import { ProgressCallbackPage } from "#/toasts/fundamentals/progress-callback/progress-callback";

const Route = createFileRoute("/fundamentals/progress-callback")({
  component: ProgressCallbackPage,
});

export { Route };
