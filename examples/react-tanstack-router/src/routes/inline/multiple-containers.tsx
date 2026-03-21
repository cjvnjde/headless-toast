import { createFileRoute } from "@tanstack/react-router";
import { MultipleContainersPage } from "#/toasts/inline/multiple-containers/multiple-containers";

const Route = createFileRoute("/inline/multiple-containers")({
  component: MultipleContainersPage,
});

export { Route };
