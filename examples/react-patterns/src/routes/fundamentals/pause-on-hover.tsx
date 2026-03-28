import { createFileRoute } from "@tanstack/react-router";
import { PauseOnHoverPage } from "#/toasts/fundamentals/pause-on-hover/pause-on-hover";

const Route = createFileRoute("/fundamentals/pause-on-hover")({
  component: PauseOnHoverPage,
});

export { Route };
