import { createFileRoute } from "@tanstack/react-router";
import { PersistentToastPage } from "#/toasts/fundamentals/persistent-toast/persistent-toast";

const Route = createFileRoute("/fundamentals/persistent-toast")({
  component: PersistentToastPage,
});

export { Route };
