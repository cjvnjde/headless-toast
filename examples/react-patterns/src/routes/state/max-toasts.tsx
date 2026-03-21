import { createFileRoute } from "@tanstack/react-router";
import { MaxToastsPage } from "#/toasts/state/max-toasts/max-toasts";

const Route = createFileRoute("/state/max-toasts")({
  component: MaxToastsPage,
});

export { Route };
