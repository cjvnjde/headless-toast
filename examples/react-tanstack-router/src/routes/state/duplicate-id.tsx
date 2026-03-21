import { createFileRoute } from "@tanstack/react-router";
import { DuplicateIdPage } from "#/toasts/state/duplicate-id/duplicate-id";

const Route = createFileRoute("/state/duplicate-id")({
  component: DuplicateIdPage,
});

export { Route };
