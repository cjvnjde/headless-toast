import type { ToastCustomOptions, ToastData, ToastState } from "../types.ts";
import { TOAST_STATUS } from "../types.ts";

export function isActiveToast<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
>(toast: ToastState<TData, TCustom>): boolean {
  return (
    toast.status === TOAST_STATUS.ENTERING ||
    toast.status === TOAST_STATUS.VISIBLE
  );
}
