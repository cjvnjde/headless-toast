import { createFileRoute } from "@tanstack/react-router";
import { FramerMotionPage } from "#/toasts/advanced/framer-motion/framer-motion";

const Route = createFileRoute("/advanced/framer-motion")({
  component: FramerMotionPage,
});

export { Route };
