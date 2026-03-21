import { createFileRoute } from "@tanstack/react-router";
import { OutsideReactPage } from "#/toasts/state/outside-react/outside-react";

const Route = createFileRoute("/state/outside-react")({
  component: OutsideReactPage,
});

export { Route };
