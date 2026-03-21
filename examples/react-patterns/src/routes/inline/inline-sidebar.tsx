import { createFileRoute } from "@tanstack/react-router";
import { InlineSidebarPage } from "#/toasts/inline/inline-sidebar/inline-sidebar";

const Route = createFileRoute("/inline/inline-sidebar")({
  component: InlineSidebarPage,
});

export { Route };
