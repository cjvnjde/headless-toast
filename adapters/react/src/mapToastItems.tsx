import type { ReactNode } from "react";
import type { ToastCustomOptions, ToastData } from "@headless-toast/core";
import { ToastProvider } from "./ToastProvider";
import type { ReactToastState, ReactToastStore } from "./types";

function mapToastItems<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
  TToast extends ReactToastState<TData, TCustom> = ReactToastState<
    TData,
    TCustom
  >,
>(
  store: ReactToastStore<TData, TCustom>,
  toasts: TToast[],
  render: (toast: TToast) => ReactNode,
): ReactNode[] {
  return toasts.map((toast) => (
    <ToastProvider key={toast.id} toastId={toast.id} store={store}>
      {render(toast)}
    </ToastProvider>
  ));
}

export { mapToastItems };
