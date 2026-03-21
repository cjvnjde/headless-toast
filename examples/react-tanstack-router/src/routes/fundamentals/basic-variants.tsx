import { createFileRoute } from "@tanstack/react-router";
import { BasicVariantsPage } from "#/toasts/fundamentals/basic-variants/basic-variants";

const Route = createFileRoute("/fundamentals/basic-variants")({
  component: BasicVariantsPage,
});

export { Route };
