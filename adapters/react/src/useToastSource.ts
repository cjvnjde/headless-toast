import { useContext } from "react";
import type { ToastCustomOptions, ToastData } from "@headless-toast/core";
import { ToastCtx } from "./toastContext";
import type { ReactToastState, ReactToastStore } from "./types";

type ToastSource<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
> = {
  initialToast: ReactToastState<TData, TCustom> | undefined;
  store: ReactToastStore<TData, TCustom>;
  toastId: string;
};

function useToastSource<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
>(): ToastSource<TData, TCustom> {
  const value = useContext(ToastCtx);

  if (!value || (!value.toast && !value.toastId)) {
    throw new Error(
      "useToast() must be used inside a toast component rendered by <Toaster>.",
    );
  }

  const toastId = value.toastId ?? value.toast?.id;

  if (!toastId) {
    throw new Error(
      "useToast() must be used inside a toast component rendered by <Toaster>.",
    );
  }

  return {
    initialToast: value.toast,
    store: value.store,
    toastId,
  };
}

export { useToastSource };
