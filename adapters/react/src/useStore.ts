import type { ToastCustomOptions, ToastData } from "@headless-toast/core";
import { toast as sharedToast } from "./toast";
import { useStoreSelector } from "./useStoreSelector";
import type { ReactToastState, ReactToastStore } from "./types";

function useStore(): ReactToastState[];
function useStore<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
>(store: ReactToastStore<TData, TCustom>): ReactToastState<TData, TCustom>[];
function useStore<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
>(store?: ReactToastStore<TData, TCustom>) {
  const resolvedStore = (store ?? sharedToast) as ReactToastStore<
    TData,
    TCustom
  >;

  return useStoreSelector(resolvedStore, (toasts) => toasts);
}

export { useStore };
