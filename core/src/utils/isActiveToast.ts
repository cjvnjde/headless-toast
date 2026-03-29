import type { ToastState } from "../types.ts";
import { TOAST_STATUS } from "../types.ts";

export function isActiveToast(toast: ToastState) {
  return (
    toast.status === TOAST_STATUS.ENTERING ||
    toast.status === TOAST_STATUS.VISIBLE
  );
}
