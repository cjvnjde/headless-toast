import type { DraggableConfig, DragState, GestureInput } from "./types";
import { DRAG_DIRECTION } from "./types";

function computeDragState(
  config: DraggableConfig,
  gesture: GestureInput,
): DragState {
  let offsetX = 0;
  let offsetY = 0;

  if (
    config.direction === DRAG_DIRECTION.X ||
    config.direction === DRAG_DIRECTION.BOTH
  ) {
    offsetX = gesture.dx;
  }
  if (
    config.direction === DRAG_DIRECTION.Y ||
    config.direction === DRAG_DIRECTION.BOTH
  ) {
    offsetY = gesture.dy;
  }

  const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
  const velocity = Math.sqrt(gesture.vx * gesture.vx + gesture.vy * gesture.vy);
  const progress = config.threshold > 0 ? distance / config.threshold : 0;

  const distanceDismissed = distance >= config.threshold;
  const velocityDismissed =
    config.velocityThreshold !== undefined &&
    config.velocityThreshold > 0 &&
    velocity >= config.velocityThreshold;
  const dismissed = distanceDismissed || velocityDismissed;

  return {
    active: true,
    offsetX,
    offsetY,
    velocity,
    progress,
    dismissed,
  };
}

export { computeDragState };
