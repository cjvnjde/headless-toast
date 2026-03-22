import { useContext } from "react";
import type { ToastCustomOptions, ToastData } from "@headless-toast/core";
import { ToastCtx } from "./toastContext";
import type { ReactToastState, ReactToastStore } from "./types";

function useToastSource<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
>() {
  const value = useContext(ToastCtx);

  if (!value || (!value.toast && !value.toastId)) {
    throw new Error(
      "useToast() must be used inside a toast component rendered by <Toaster>.",
    );
  }

  return {
    initialToast: value.toast as ReactToastState<TData, TCustom> | undefined,
    store: value.store as ReactToastStore<TData, TCustom>,
    toastId: (value.toastId ?? value.toast?.id) as string,
  };
}

export { useToastSource };
