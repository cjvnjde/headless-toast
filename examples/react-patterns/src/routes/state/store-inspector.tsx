import { createFileRoute } from "@tanstack/react-router";
import { StoreInspectorPage } from "#/toasts/state/store-inspector/store-inspector";

const Route = createFileRoute("/state/store-inspector")({
  component: StoreInspectorPage,
});

export { Route };
