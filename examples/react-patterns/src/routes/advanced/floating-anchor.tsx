import { createFileRoute } from "@tanstack/react-router";
import { FloatingAnchorPage } from "#/toasts/advanced/floating-anchor/floating-anchor";

const Route = createFileRoute("/advanced/floating-anchor")({
  component: FloatingAnchorPage,
});

export { Route };
