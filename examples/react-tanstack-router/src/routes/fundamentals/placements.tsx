import { createFileRoute } from "@tanstack/react-router";
import { PlacementsPage } from "#/toasts/fundamentals/placements/placements";

const Route = createFileRoute("/fundamentals/placements")({
  component: PlacementsPage,
});

export { Route };
