import {
  type StackConfig,
  type ToastPlacement,
  type ToastCustomOptions,
  type ToastData,
  STACK_MODE,
  TOAST_PLACEMENT,
} from "@headless-toast/core";
import type { ReactToastState } from "./types";

const DEFAULT_PLACEMENT: ToastPlacement = TOAST_PLACEMENT.TOP_RIGHT;
const DEFAULT_MAX_VISIBLE = 3;
const DEFAULT_STACKED_DECK_ORDER = "newest-first";
const DEFAULT_STACKED_DECK_SCALE_STEP = 0.03;
const DEFAULT_STACKED_DECK_MIN_SCALE = 0.9;
const DEFAULT_STACKED_DECK_OPACITY_STEP = 0.18;
const DEFAULT_STACKED_DECK_MIN_OPACITY = 0.28;

type StackedToast<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
> = ReactToastState<TData, TCustom> & {
  stackIndex: number;
  isCollapsed: boolean;
};

type StackedDeckOrder = "newest-first" | "oldest-first";

type StackedDeckLayoutConfig = {
  expanded: boolean;
  itemHeight: number;
  collapsedGap: number;
  expandedGap?: number;
  maxVisible?: number;
  order?: StackedDeckOrder;
  scaleStep?: number;
  minScale?: number;
  opacityStep?: number;
  minOpacity?: number;
};

type StackedDeckToast<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
> = StackedToast<TData, TCustom> & {
  offset: number;
  scale: number;
  opacity: number;
  zIndex: number;
};

type StackedDeckLayout<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
> = {
  toasts: StackedDeckToast<TData, TCustom>[];
  visibleToasts: StackedDeckToast<TData, TCustom>[];
  expanded: boolean;
  height: number;
  collapsedHeight: number;
  expandedHeight: number;
  totalCount: number;
  visibleCount: number;
  hiddenCount: number;
};

function groupByPlacement<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
>(toasts: ReactToastState<TData, TCustom>[]) {
  const groups = new Map<ToastPlacement, ReactToastState<TData, TCustom>[]>();

  for (const toast of toasts) {
    const placement = toast.options.placement ?? DEFAULT_PLACEMENT;
    const group = groups.get(placement);

    if (group) {
      group.push(toast);
      continue;
    }

    groups.set(placement, [toast]);
  }

  return groups;
}

function computeStackLayout<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
>(
  toasts: ReactToastState<TData, TCustom>[],
  config: StackConfig,
  isExpanded: boolean,
) {
  const maxVisible = config.maxVisible ?? DEFAULT_MAX_VISIBLE;

  return toasts.map((toast, index) => ({
    ...toast,
    stackIndex: index,
    isCollapsed:
      !isExpanded &&
      config.mode === STACK_MODE.COLLAPSED &&
      index >= maxVisible,
  }));
}

function computeStackedDeckLayout<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
>(
  toasts: ReactToastState<TData, TCustom>[],
  config: StackedDeckLayoutConfig,
): StackedDeckLayout<TData, TCustom> {
  const maxVisible = config.maxVisible ?? DEFAULT_MAX_VISIBLE;
  const order = config.order ?? DEFAULT_STACKED_DECK_ORDER;
  const expandedGap = config.expandedGap ?? config.collapsedGap;
  const scaleStep = config.scaleStep ?? DEFAULT_STACKED_DECK_SCALE_STEP;
  const minScale = config.minScale ?? DEFAULT_STACKED_DECK_MIN_SCALE;
  const opacityStep = config.opacityStep ?? DEFAULT_STACKED_DECK_OPACITY_STEP;
  const minOpacity = config.minOpacity ?? DEFAULT_STACKED_DECK_MIN_OPACITY;
  const orderedToasts =
    order === "oldest-first" ? [...toasts] : [...toasts].reverse();
  const stackedToasts = computeStackLayout(
    orderedToasts,
    {
      mode: STACK_MODE.COLLAPSED,
      maxVisible,
    },
    config.expanded,
  );
  const totalCount = stackedToasts.length;
  const collapsedVisibleCount = Math.min(totalCount, maxVisible);
  const collapsedHeight =
    totalCount === 0
      ? 0
      : config.itemHeight +
        Math.max(0, collapsedVisibleCount - 1) * config.collapsedGap;
  const expandedHeight =
    totalCount === 0
      ? 0
      : totalCount * config.itemHeight +
        Math.max(0, totalCount - 1) * expandedGap;
  const deckToasts = stackedToasts.map((toast, index) => ({
    ...toast,
    offset: config.expanded
      ? index * (config.itemHeight + expandedGap)
      : index * config.collapsedGap,
    scale: config.expanded ? 1 : Math.max(1 - index * scaleStep, minScale),
    opacity: toast.isCollapsed
      ? 0
      : config.expanded
        ? 1
        : Math.max(1 - index * opacityStep, minOpacity),
    zIndex: totalCount - index,
  }));
  const visibleToasts = deckToasts.filter((toast) => !toast.isCollapsed);

  return {
    toasts: deckToasts,
    visibleToasts,
    expanded: config.expanded,
    height: config.expanded ? expandedHeight : collapsedHeight,
    collapsedHeight,
    expandedHeight,
    totalCount,
    visibleCount: visibleToasts.length,
    hiddenCount: totalCount - visibleToasts.length,
  };
}

export {
  DEFAULT_PLACEMENT,
  DEFAULT_MAX_VISIBLE,
  groupByPlacement,
  computeStackLayout,
  computeStackedDeckLayout,
};

export type {
  StackedToast,
  StackedDeckOrder,
  StackedDeckLayoutConfig,
  StackedDeckToast,
  StackedDeckLayout,
};
