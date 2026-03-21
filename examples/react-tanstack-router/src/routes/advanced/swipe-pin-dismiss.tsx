import { createFileRoute } from "@tanstack/react-router";
import { SwipePinDismissPage } from "#/toasts/advanced/swipe-pin-dismiss/swipe-pin-dismiss";

const Route = createFileRoute("/advanced/swipe-pin-dismiss")({
  component: SwipePinDismissPage,
});

export { Route };
