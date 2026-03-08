import { useSyncExternalStore, useCallback, useRef } from "react";
import type { ToastCustomOptions, ToastData } from "@headless-toast/core";
import { defaultStore } from "./toast";
import type { ReactToastState, ReactToastStore } from "./types";

function useDefaultStore() {
  const snapshotRef = useRef(defaultStore.getToasts());

  const subscribe = useCallback(
    (onStoreChange: () => void) =>
      defaultStore.subscribe(() => {
        snapshotRef.current = defaultStore.getToasts();
        onStoreChange();
      }),
    [],
  );

  const getSnapshot = useCallback(() => snapshotRef.current, []);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

function hasStore<TData extends ToastData, TCustom extends ToastCustomOptions>(
  store: ReactToastStore<TData, TCustom> | undefined,
): store is ReactToastStore<TData, TCustom> {
  return store !== undefined;
}

function useStore(): ReactToastState[];
function useStore<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
>(store: ReactToastStore<TData, TCustom>): ReactToastState<TData, TCustom>[];
function useStore<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
>(store?: ReactToastStore<TData, TCustom>) {
  if (!hasStore(store)) {
    return useDefaultStore();
  }

  const snapshotRef = useRef(store.getToasts());

  const storeRef = useRef(store);

  if (storeRef.current !== store) {
    storeRef.current = store;
    snapshotRef.current = store.getToasts();
  }

  const subscribe = useCallback(
    (onStoreChange: () => void) =>
      store.subscribe(() => {
        snapshotRef.current = store.getToasts();
        onStoreChange();
      }),
    [store],
  );

  const getSnapshot = useCallback(() => snapshotRef.current, []);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export { useStore };
