import type { ToastCustomOptions, ToastData } from "@headless-toast/core";
import type { ReactToastState } from "./types";

function filterByContainer<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
>(toasts: ReactToastState<TData, TCustom>[], containerId?: string) {
  return toasts.filter(
    (toast) => (toast.options.containerId ?? undefined) === containerId,
  );
}

export { filterByContainer };
