import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

function resolveBasepath() {
  const baseUrl = import.meta.env.BASE_URL;

  if (baseUrl === "/") {
    return "/";
  }

  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

const router = createRouter({
  routeTree,
  basepath: resolveBasepath(),
  defaultPreload: "intent",
  scrollRestoration: true,
});

export { router };

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
