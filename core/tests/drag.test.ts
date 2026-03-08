import { describe, it, expect } from "vitest";
import { computeDragState } from "../src/drag";
import type { DraggableConfig, GestureInput } from "../src/types";

describe("computeDragState", () => {
  const defaultConfig: DraggableConfig = { threshold: 100, direction: "x" };

  describe("direction: x", () => {
    it("constrains offset to x axis only", () => {
      const gesture: GestureInput = { dx: 50, dy: 30, vx: 1, vy: 2 };
      const state = computeDragState(defaultConfig, gesture);

      expect(state.offsetX).toBe(50);
      expect(state.offsetY).toBe(0);
    });

    it("computes distance as absolute offsetX", () => {
      const gesture: GestureInput = { dx: -80, dy: 50, vx: 0, vy: 0 };
      const state = computeDragState(defaultConfig, gesture);

      // distance = sqrt(80^2 + 0^2) = 80 < 100
      expect(state.dismissed).toBe(false);
    });

    it("marks dismissed when distance exceeds threshold", () => {
      const gesture: GestureInput = { dx: 100, dy: 0, vx: 0, vy: 0 };
      const state = computeDragState(defaultConfig, gesture);

      expect(state.dismissed).toBe(true);
    });

    it("marks dismissed when negative dx exceeds threshold", () => {
      const gesture: GestureInput = { dx: -150, dy: 0, vx: 0, vy: 0 };
      const state = computeDragState(defaultConfig, gesture);

      expect(state.dismissed).toBe(true);
    });

    it("is not dismissed just below threshold", () => {
      const gesture: GestureInput = { dx: 99.9, dy: 0, vx: 0, vy: 0 };
      const state = computeDragState(defaultConfig, gesture);

      expect(state.dismissed).toBe(false);
    });
  });

  describe("direction: y", () => {
    const yConfig: DraggableConfig = { threshold: 80, direction: "y" };

    it("constrains offset to y axis only", () => {
      const gesture: GestureInput = { dx: 50, dy: 30, vx: 1, vy: 2 };
      const state = computeDragState(yConfig, gesture);

      expect(state.offsetX).toBe(0);
      expect(state.offsetY).toBe(30);
    });

    it("marks dismissed when y distance exceeds threshold", () => {
      const gesture: GestureInput = { dx: 0, dy: -80, vx: 0, vy: 0 };
      const state = computeDragState(yConfig, gesture);

      expect(state.dismissed).toBe(true);
    });

    it("ignores x displacement for dismissal", () => {
      const gesture: GestureInput = { dx: 200, dy: 10, vx: 0, vy: 0 };
      const state = computeDragState(yConfig, gesture);

      expect(state.dismissed).toBe(false);
      expect(state.offsetX).toBe(0);
    });
  });

  describe("direction: both", () => {
    const bothConfig: DraggableConfig = { threshold: 100, direction: "both" };

    it("uses both axes for offset", () => {
      const gesture: GestureInput = { dx: 60, dy: 80, vx: 0, vy: 0 };
      const state = computeDragState(bothConfig, gesture);

      expect(state.offsetX).toBe(60);
      expect(state.offsetY).toBe(80);
    });

    it("computes euclidean distance for dismissal", () => {
      // distance = sqrt(60^2 + 80^2) = sqrt(3600 + 6400) = sqrt(10000) = 100
      const gesture: GestureInput = { dx: 60, dy: 80, vx: 0, vy: 0 };
      const state = computeDragState(bothConfig, gesture);

      expect(state.dismissed).toBe(true);
    });

    it("is not dismissed when distance is below threshold", () => {
      // distance = sqrt(30^2 + 40^2) = sqrt(900 + 1600) = sqrt(2500) = 50
      const gesture: GestureInput = { dx: 30, dy: 40, vx: 0, vy: 0 };
      const state = computeDragState(bothConfig, gesture);

      expect(state.dismissed).toBe(false);
    });
  });

  describe("velocity", () => {
    it("computes velocity magnitude from vx and vy", () => {
      const gesture: GestureInput = { dx: 0, dy: 0, vx: 3, vy: 4 };
      const state = computeDragState(defaultConfig, gesture);

      // velocity = sqrt(3^2 + 4^2) = 5
      expect(state.velocity).toBe(5);
    });

    it("returns 0 velocity when gesture has no velocity", () => {
      const gesture: GestureInput = { dx: 50, dy: 0, vx: 0, vy: 0 };
      const state = computeDragState(defaultConfig, gesture);

      expect(state.velocity).toBe(0);
    });
  });

  describe("active flag", () => {
    it("is always true", () => {
      const gesture: GestureInput = { dx: 0, dy: 0, vx: 0, vy: 0 };
      const state = computeDragState(defaultConfig, gesture);

      expect(state.active).toBe(true);
    });
  });

  describe("progress", () => {
    it("returns 0 at origin", () => {
      const gesture: GestureInput = { dx: 0, dy: 0, vx: 0, vy: 0 };
      const state = computeDragState(defaultConfig, gesture);

      expect(state.progress).toBe(0);
    });

    it("returns 0.5 at half threshold", () => {
      const gesture: GestureInput = { dx: 50, dy: 0, vx: 0, vy: 0 };
      const state = computeDragState(defaultConfig, gesture);

      expect(state.progress).toBe(0.5);
    });

    it("returns 1 at threshold", () => {
      const gesture: GestureInput = { dx: 100, dy: 0, vx: 0, vy: 0 };
      const state = computeDragState(defaultConfig, gesture);

      expect(state.progress).toBe(1);
    });

    it("can exceed 1 past threshold", () => {
      const gesture: GestureInput = { dx: 200, dy: 0, vx: 0, vy: 0 };
      const state = computeDragState(defaultConfig, gesture);

      expect(state.progress).toBe(2);
    });

    it("works with euclidean distance for direction both", () => {
      const bothConfig: DraggableConfig = { threshold: 100, direction: "both" };
      // distance = sqrt(60^2 + 80^2) = 100
      const gesture: GestureInput = { dx: 60, dy: 80, vx: 0, vy: 0 };
      const state = computeDragState(bothConfig, gesture);

      expect(state.progress).toBe(1);
    });

    it("returns 0 when threshold is 0", () => {
      const zeroConfig: DraggableConfig = { threshold: 0, direction: "x" };
      const gesture: GestureInput = { dx: 50, dy: 0, vx: 0, vy: 0 };
      const state = computeDragState(zeroConfig, gesture);

      expect(state.progress).toBe(0);
    });
  });

  describe("velocity threshold", () => {
    const velConfig: DraggableConfig = {
      threshold: 100,
      direction: "x",
      velocityThreshold: 2,
    };

    it("dismisses on high velocity even below distance threshold", () => {
      const gesture: GestureInput = { dx: 30, dy: 0, vx: 2, vy: 0 };
      const state = computeDragState(velConfig, gesture);

      expect(state.dismissed).toBe(true);
      expect(state.progress).toBeCloseTo(0.3);
    });

    it("does not dismiss when velocity is below threshold", () => {
      const gesture: GestureInput = { dx: 30, dy: 0, vx: 1, vy: 0 };
      const state = computeDragState(velConfig, gesture);

      expect(state.dismissed).toBe(false);
    });

    it("dismisses when both distance and velocity thresholds are met", () => {
      const gesture: GestureInput = { dx: 150, dy: 0, vx: 3, vy: 0 };
      const state = computeDragState(velConfig, gesture);

      expect(state.dismissed).toBe(true);
    });

    it("ignores velocity threshold when not configured", () => {
      const gesture: GestureInput = { dx: 30, dy: 0, vx: 10, vy: 0 };
      const state = computeDragState(defaultConfig, gesture);

      // defaultConfig has no velocityThreshold, so only distance matters
      expect(state.dismissed).toBe(false);
    });
  });

  describe("zero gesture", () => {
    it("returns zero offsets and not dismissed", () => {
      const gesture: GestureInput = { dx: 0, dy: 0, vx: 0, vy: 0 };
      const state = computeDragState(defaultConfig, gesture);

      expect(state).toEqual({
        active: true,
        offsetX: 0,
        offsetY: 0,
        velocity: 0,
        progress: 0,
        dismissed: false,
      });
    });
  });
});
