import { createFileRoute } from "@tanstack/react-router";
import { AnimationWrapperPage } from "#/toasts/rendering/animation-wrapper/animation-wrapper";

const Route = createFileRoute("/rendering/animation-wrapper")({
  component: AnimationWrapperPage,
});

export { Route };
