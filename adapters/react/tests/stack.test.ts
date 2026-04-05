import { describe, it, expect } from "vitest";
import type { StackConfig, ToastState } from "core/src";
import {
  DEFAULT_PLACEMENT,
  DEFAULT_MAX_VISIBLE,
  groupByPlacement,
  computeStackLayout,
  computeStackedDeckLayout,
} from "../src/stack.ts";

function makeToast(
  overrides: Partial<ToastState> & { id: string },
): ToastState {
  return {
    status: "visible",
    type: "info",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    remaining: 3000,
    paused: false,
    progress: 0,
    data: {},
    options: {},
    ...overrides,
  };
}

describe("DEFAULT_PLACEMENT", () => {
  it("is top-right", () => {
    expect(DEFAULT_PLACEMENT).toBe("top-right");
  });
});

describe("DEFAULT_MAX_VISIBLE", () => {
  it("is 3", () => {
    expect(DEFAULT_MAX_VISIBLE).toBe(3);
  });
});

describe("groupByPlacement", () => {
  it("returns an empty map for an empty array", () => {
    expect(groupByPlacement([]).size).toBe(0);
  });

  it("groups toasts by their placement option", () => {
    const toasts = [
      makeToast({ id: "t1", options: { placement: "top-left" } }),
      makeToast({ id: "t2", options: { placement: "top-right" } }),
      makeToast({ id: "t3", options: { placement: "top-left" } }),
    ];

    const groups = groupByPlacement(toasts);

    expect(groups.size).toBe(2);
    expect(groups.get("top-left")!.map((toast) => toast.id)).toEqual([
      "t1",
      "t3",
    ]);
    expect(groups.get("top-right")!.map((toast) => toast.id)).toEqual(["t2"]);
  });

  it("uses default placement when placement is not specified", () => {
    const toasts = [
      makeToast({ id: "t1", options: {} }),
      makeToast({ id: "t2", options: { placement: "bottom-center" } }),
    ];

    const groups = groupByPlacement(toasts);

    expect(groups.get("top-right")!.map((toast) => toast.id)).toEqual(["t1"]);
    expect(groups.get("bottom-center")!.map((toast) => toast.id)).toEqual([
      "t2",
    ]);
  });

  it("preserves insertion order within a group", () => {
    const toasts = [
      makeToast({ id: "t1", options: { placement: "top-right" } }),
      makeToast({ id: "t2", options: { placement: "top-right" } }),
      makeToast({ id: "t3", options: { placement: "top-right" } }),
    ];

    const groups = groupByPlacement(toasts);
    expect(groups.get("top-right")!.map((toast) => toast.id)).toEqual([
      "t1",
      "t2",
      "t3",
    ]);
  });
});

describe("computeStackLayout", () => {
  const expandedConfig: StackConfig = { mode: "expanded" };
  const collapsedConfig: StackConfig = { mode: "collapsed", maxVisible: 3 };

  it("assigns sequential stackIndex values", () => {
    const toasts = [
      makeToast({ id: "t1" }),
      makeToast({ id: "t2" }),
      makeToast({ id: "t3" }),
    ];
    expect(
      computeStackLayout(toasts, expandedConfig, false).map(
        (toast) => toast.stackIndex,
      ),
    ).toEqual([0, 1, 2]);
  });

  it("marks no toasts as collapsed in expanded mode", () => {
    const toasts = Array.from({ length: 5 }, (_, index) =>
      makeToast({ id: `t${index}` }),
    );
    expect(
      computeStackLayout(toasts, expandedConfig, false).every(
        (toast) => !toast.isCollapsed,
      ),
    ).toBe(true);
  });

  it("marks toasts beyond maxVisible as collapsed in collapsed mode", () => {
    const toasts = Array.from({ length: 5 }, (_, index) =>
      makeToast({ id: `t${index}` }),
    );
    const result = computeStackLayout(toasts, collapsedConfig, false);

    expect(result[0].isCollapsed).toBe(false);
    expect(result[1].isCollapsed).toBe(false);
    expect(result[2].isCollapsed).toBe(false);
    expect(result[3].isCollapsed).toBe(true);
    expect(result[4].isCollapsed).toBe(true);
  });

  it("does not collapse when isExpanded is true", () => {
    const toasts = Array.from({ length: 5 }, (_, index) =>
      makeToast({ id: `t${index}` }),
    );
    expect(
      computeStackLayout(toasts, collapsedConfig, true).every(
        (toast) => !toast.isCollapsed,
      ),
    ).toBe(true);
  });

  it("uses DEFAULT_MAX_VISIBLE when maxVisible is not specified", () => {
    const config: StackConfig = { mode: "collapsed" };
    const toasts = Array.from({ length: 5 }, (_, index) =>
      makeToast({ id: `t${index}` }),
    );
    const result = computeStackLayout(toasts, config, false);

    expect(result[2].isCollapsed).toBe(false);
    expect(result[3].isCollapsed).toBe(true);
  });
});

describe("computeStackedDeckLayout", () => {
  it("orders deck toasts newest-first by default", () => {
    const toasts = [
      makeToast({ id: "t1" }),
      makeToast({ id: "t2" }),
      makeToast({ id: "t3" }),
      makeToast({ id: "t4" }),
    ];

    const result = computeStackedDeckLayout(toasts, {
      expanded: false,
      itemHeight: 96,
      collapsedGap: 16,
      expandedGap: 12,
      maxVisible: 3,
    });

    expect(result.toasts.map((toast) => toast.id)).toEqual([
      "t4",
      "t3",
      "t2",
      "t1",
    ]);
    expect(result.visibleToasts.map((toast) => toast.id)).toEqual([
      "t4",
      "t3",
      "t2",
    ]);
    expect(result.hiddenCount).toBe(1);
    expect(result.visibleCount).toBe(3);
    expect(result.collapsedHeight).toBe(128);
    expect(result.height).toBe(128);
  });

  it("supports oldest-first ordering", () => {
    const toasts = [
      makeToast({ id: "t1" }),
      makeToast({ id: "t2" }),
      makeToast({ id: "t3" }),
    ];

    const result = computeStackedDeckLayout(toasts, {
      expanded: false,
      itemHeight: 96,
      collapsedGap: 16,
      order: "oldest-first",
    });

    expect(result.toasts.map((toast) => toast.id)).toEqual(["t1", "t2", "t3"]);
  });

  it("computes collapsed offsets and deck styling values", () => {
    const toasts = [
      makeToast({ id: "t1" }),
      makeToast({ id: "t2" }),
      makeToast({ id: "t3" }),
    ];

    const result = computeStackedDeckLayout(toasts, {
      expanded: false,
      itemHeight: 100,
      collapsedGap: 10,
      expandedGap: 20,
      order: "oldest-first",
      maxVisible: 3,
    });

    expect(result.toasts.map((toast) => toast.offset)).toEqual([0, 10, 20]);
    expect(result.toasts.map((toast) => toast.zIndex)).toEqual([3, 2, 1]);
    expect(result.toasts[0].scale).toBe(1);
    expect(result.toasts[1].scale).toBeCloseTo(0.97);
    expect(result.toasts[2].scale).toBeCloseTo(0.94);
    expect(result.toasts[0].opacity).toBe(1);
    expect(result.toasts[1].opacity).toBeCloseTo(0.82);
    expect(result.toasts[2].opacity).toBeCloseTo(0.64);
  });

  it("expands the full deck and restores full opacity and scale", () => {
    const toasts = [
      makeToast({ id: "t1" }),
      makeToast({ id: "t2" }),
      makeToast({ id: "t3" }),
      makeToast({ id: "t4" }),
    ];

    const result = computeStackedDeckLayout(toasts, {
      expanded: true,
      itemHeight: 96,
      collapsedGap: 16,
      expandedGap: 12,
      maxVisible: 3,
      order: "oldest-first",
    });

    expect(result.visibleToasts).toHaveLength(4);
    expect(result.hiddenCount).toBe(0);
    expect(result.expandedHeight).toBe(420);
    expect(result.height).toBe(420);
    expect(result.toasts.map((toast) => toast.offset)).toEqual([
      0, 108, 216, 324,
    ]);
    expect(result.toasts.every((toast) => toast.scale === 1)).toBe(true);
    expect(result.toasts.every((toast) => toast.opacity === 1)).toBe(true);
  });

  it("uses DEFAULT_MAX_VISIBLE when maxVisible is omitted", () => {
    const toasts = Array.from({ length: 5 }, (_, index) =>
      makeToast({ id: `t${index}` }),
    );

    const result = computeStackedDeckLayout(toasts, {
      expanded: false,
      itemHeight: 96,
      collapsedGap: 16,
      order: "oldest-first",
    });

    expect(result.visibleToasts).toHaveLength(DEFAULT_MAX_VISIBLE);
    expect(result.hiddenCount).toBe(2);
  });
});
