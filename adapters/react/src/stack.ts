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

type StackedToast<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
> = ReactToastState<TData, TCustom> & {
  stackIndex: number;
  isCollapsed: boolean;
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

export {
  DEFAULT_PLACEMENT,
  DEFAULT_MAX_VISIBLE,
  groupByPlacement,
  computeStackLayout,
};

export type { StackedToast };
