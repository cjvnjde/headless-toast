import { createFileRoute } from "@tanstack/react-router";
import { PlainCssPage } from "#/toasts/rendering/plain-css/plain-css";

const Route = createFileRoute("/rendering/plain-css")({
  component: PlainCssPage,
});

export { Route };
