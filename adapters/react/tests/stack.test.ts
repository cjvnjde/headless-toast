import { describe, it, expect } from "vitest";
import type { StackConfig, ToastState } from "core/src";
import {
  DEFAULT_PLACEMENT,
  DEFAULT_MAX_VISIBLE,
  groupByPlacement,
  computeStackLayout,
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
