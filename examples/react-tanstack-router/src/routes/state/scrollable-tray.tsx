import { createFileRoute } from "@tanstack/react-router";
import { ScrollableTrayPage } from "#/toasts/state/scrollable-tray/scrollable-tray";

const Route = createFileRoute("/state/scrollable-tray")({
  component: ScrollableTrayPage,
});

export { Route };
