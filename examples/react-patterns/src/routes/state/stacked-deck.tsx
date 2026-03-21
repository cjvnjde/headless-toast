import { createFileRoute } from "@tanstack/react-router";
import { StackedDeckPage } from "#/toasts/state/stacked-deck/stacked-deck";

const Route = createFileRoute("/state/stacked-deck")({
  component: StackedDeckPage,
});

export { Route };
