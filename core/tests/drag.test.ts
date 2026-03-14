import { describe, expect, it } from "vitest";
import { computeDragState, DRAG_DIRECTION } from "../src";
import type { DraggableConfig, GestureInput } from "../src";

function drag(
  config: DraggableConfig,
  gesture: Partial<GestureInput>,
): ReturnType<typeof computeDragState> {
  return computeDragState(config, {
    dx: 0,
    dy: 0,
    vx: 0,
    vy: 0,
    ...gesture,
  });
}

describe("computeDragState", () => {
  it("uses only the configured axis for distance and offsets", () => {
    const state = drag(
      { threshold: 100, direction: DRAG_DIRECTION.Y },
      { dx: 200, dy: 40 },
    );

    expect(state).toMatchObject({
      active: true,
      offsetX: 0,
      offsetY: 40,
      progress: 0.4,
      dismissed: false,
    });
  });

  it("uses euclidean distance when both axes are enabled", () => {
    const state = drag(
      { threshold: 100, direction: DRAG_DIRECTION.BOTH },
      { dx: 60, dy: 80 },
    );

    expect(state.offsetX).toBe(60);
    expect(state.offsetY).toBe(80);
    expect(state.progress).toBe(1);
    expect(state.dismissed).toBe(true);
  });

  it("treats movement in either direction as distance", () => {
    const state = drag(
      { threshold: 100, direction: DRAG_DIRECTION.X },
      { dx: -120 },
    );

    expect(state.offsetX).toBe(-120);
    expect(state.progress).toBe(1.2);
    expect(state.dismissed).toBe(true);
  });

  it("can dismiss by velocity even when distance is still below threshold", () => {
    const state = drag(
      {
        threshold: 100,
        direction: DRAG_DIRECTION.X,
        velocityThreshold: 2,
      },
      { dx: 20, vx: 0, vy: 2 },
    );

    expect(state.velocity).toBe(2);
    expect(state.progress).toBe(0.2);
    expect(state.dismissed).toBe(true);
  });

  it("ignores velocity when no positive velocity threshold is configured", () => {
    const withoutThreshold = drag(
      { threshold: 100, direction: DRAG_DIRECTION.X },
      { dx: 20, vx: 10 },
    );
    const withZeroThreshold = drag(
      {
        threshold: 100,
        direction: DRAG_DIRECTION.X,
        velocityThreshold: 0,
      },
      { dx: 20, vx: 10 },
    );

    expect(withoutThreshold.dismissed).toBe(false);
    expect(withZeroThreshold.dismissed).toBe(false);
  });

  it("avoids dividing by zero when the threshold is not positive", () => {
    const state = drag(
      { threshold: 0, direction: DRAG_DIRECTION.X },
      { dx: 50 },
    );

    expect(state.progress).toBe(0);
    expect(state.dismissed).toBe(true);
  });
});
