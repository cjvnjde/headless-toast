import { createFileRoute } from "@tanstack/react-router";
import { TailwindStyledPage } from "#/toasts/rendering/tailwind-styled/tailwind-styled";

const Route = createFileRoute("/rendering/tailwind-styled")({
  component: TailwindStyledPage,
});

export { Route };
