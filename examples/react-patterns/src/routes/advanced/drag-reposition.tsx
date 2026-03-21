import { createFileRoute } from "@tanstack/react-router";
import { DragRepositionPage } from "#/toasts/advanced/drag-reposition/drag-reposition";

const Route = createFileRoute("/advanced/drag-reposition")({
  component: DragRepositionPage,
});

export { Route };
