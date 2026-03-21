import { createFileRoute } from "@tanstack/react-router";
import { UndoWindowPage } from "#/toasts/state/undo-window/undo-window";

const Route = createFileRoute("/state/undo-window")({
  component: UndoWindowPage,
});

export { Route };
