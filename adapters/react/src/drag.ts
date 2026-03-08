import type { DraggableConfig } from "@headless-toast/core";

const DEFAULT_DRAGGABLE_CONFIG: DraggableConfig = {
  threshold: 100,
  direction: "x",
};

function resolveDraggableConfig(
  draggable: boolean | DraggableConfig | undefined,
) {
  if (!draggable) {
    return null;
  }

  if (draggable === true) {
    return DEFAULT_DRAGGABLE_CONFIG;
  }

  return draggable;
}

export { DEFAULT_DRAGGABLE_CONFIG, resolveDraggableConfig };
