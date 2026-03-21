import { createFileRoute } from "@tanstack/react-router";
import { CountdownProgressPage } from "#/toasts/fundamentals/countdown-progress/countdown-progress";

const Route = createFileRoute("/fundamentals/countdown-progress")({
  component: CountdownProgressPage,
});

export { Route };
