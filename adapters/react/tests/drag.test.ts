import { describe, it, expect } from "vitest";
import type { DraggableConfig } from "@headless-toast/core";
import { DEFAULT_DRAGGABLE_CONFIG, resolveDraggableConfig } from "../src";

describe("DEFAULT_DRAGGABLE_CONFIG", () => {
  it("has threshold of 100 and direction x", () => {
    expect(DEFAULT_DRAGGABLE_CONFIG).toEqual({
      threshold: 100,
      direction: "x",
    });
  });
});

describe("resolveDraggableConfig", () => {
  it("returns null for undefined", () => {
    expect(resolveDraggableConfig(undefined)).toBeNull();
  });

  it("returns null for false", () => {
    expect(resolveDraggableConfig(false)).toBeNull();
  });

  it("returns default config for true", () => {
    expect(resolveDraggableConfig(true)).toEqual(DEFAULT_DRAGGABLE_CONFIG);
  });

  it("returns the config object when a DraggableConfig is passed", () => {
    const config: DraggableConfig = { threshold: 200, direction: "y" };
    expect(resolveDraggableConfig(config)).toBe(config);
  });

  it("returns custom config with direction both", () => {
    const config: DraggableConfig = { threshold: 50, direction: "both" };
    expect(resolveDraggableConfig(config)).toEqual({
      threshold: 50,
      direction: "both",
    });
  });
});
