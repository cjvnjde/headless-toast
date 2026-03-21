import { createFileRoute } from "@tanstack/react-router";
import { DragToDismissPage } from "#/toasts/advanced/drag-to-dismiss/drag-to-dismiss";

const Route = createFileRoute("/advanced/drag-to-dismiss")({
  component: DragToDismissPage,
});

export { Route };
