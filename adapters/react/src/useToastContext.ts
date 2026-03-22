import type { ToastCustomOptions, ToastData } from "@headless-toast/core";
import { useToastSelector } from "./useToastSelector";
import { useToastSource } from "./useToastSource";
import type { ReactToastState } from "./types";

function useToastContext<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
>() {
  const { store } = useToastSource<TData, TCustom>();
  const toast = useToastSelector<
    TData,
    TCustom,
    ReactToastState<TData, TCustom>
  >((currentToast) => currentToast);

  return {
    toast,
    store,
  };
}

export { useToastContext };
