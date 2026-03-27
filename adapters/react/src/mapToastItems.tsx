import type { ReactNode } from "react";
import type { ToastCustomOptions, ToastData } from "@headless-toast/core";
import { ToastProvider } from "./ToastProvider";
import type { ReactToastState, ReactToastStore } from "./types";

function mapToastItems<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
>(
  store: ReactToastStore<TData, TCustom>,
  toasts: ReactToastState<TData, TCustom>[],
  render: (toast: ReactToastState<TData, TCustom>) => ReactNode,
): ReactNode[] {
  return toasts.map((toast) => (
    <ToastProvider key={toast.id} toastId={toast.id} store={store}>
      {render(toast)}
    </ToastProvider>
  ));
}

export { mapToastItems };
