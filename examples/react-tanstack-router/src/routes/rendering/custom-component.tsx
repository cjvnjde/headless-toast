import { createFileRoute } from "@tanstack/react-router";
import { CustomComponentPage } from "#/toasts/rendering/custom-component/custom-component";

const Route = createFileRoute("/rendering/custom-component")({
  component: CustomComponentPage,
});

export { Route };
