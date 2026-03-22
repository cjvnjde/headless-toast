import { useSyncExternalStore, useRef } from "react";
import type { ToastCustomOptions, ToastData } from "@headless-toast/core";
import { toast as sharedToast } from "./toast";
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
  const resolvedStore = store ?? sharedToast;
  const snapshotRef = useRef(resolvedStore.getToasts());
  const storeRef = useRef(resolvedStore);

  if (storeRef.current !== resolvedStore) {
    storeRef.current = resolvedStore;
    snapshotRef.current = resolvedStore.getToasts();
  }

  const subscribe = (onStoreChange: () => void) =>
    resolvedStore.subscribe(() => {
      snapshotRef.current = resolvedStore.getToasts();
      onStoreChange();
    });

  const getSnapshot = () => snapshotRef.current;

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export { useStore };
