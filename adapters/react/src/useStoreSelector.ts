import { useRef, useSyncExternalStore } from "react";
import type { ToastCustomOptions, ToastData } from "@headless-toast/core";
import type { ReactToastState, ReactToastStore } from "./types";

type EqualityFn<T> = (left: T, right: T) => boolean;

type SelectionState<T> = { hasValue: false } | { hasValue: true; value: T };

type StoreSelector<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
  TSelected = ReactToastState<TData, TCustom>[],
> = (toasts: ReactToastState<TData, TCustom>[]) => TSelected;

function useStoreSelector<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
  TSelected = ReactToastState<TData, TCustom>[],
>(
  store: ReactToastStore<TData, TCustom>,
  selector: StoreSelector<TData, TCustom, TSelected>,
  isEqual?: EqualityFn<TSelected>,
) {
  const storeRef = useRef(store);
  const selectorRef = useRef(selector);
  const isEqualRef = useRef(isEqual);
  const toastsRef = useRef(store.getToasts());
  const selectionRef = useRef<SelectionState<TSelected>>({
    hasValue: false,
  });

  selectorRef.current = selector;
  isEqualRef.current = isEqual;

  if (storeRef.current !== store) {
    storeRef.current = store;
    toastsRef.current = store.getToasts();
    selectionRef.current = {
      hasValue: false,
    };
  }

  const subscribe = (onStoreChange: () => void) =>
    store.subscribe((toasts) => {
      toastsRef.current = toasts;
      onStoreChange();
    });

  const getSnapshot = () => {
    const nextSelection = selectorRef.current(toastsRef.current);

    if (selectionRef.current.hasValue) {
      const previousSelection = selectionRef.current.value;
      const selectionsAreEqual = isEqualRef.current
        ? isEqualRef.current(previousSelection, nextSelection)
        : Object.is(previousSelection, nextSelection);

      if (selectionsAreEqual) {
        return previousSelection;
      }
    }

    selectionRef.current = {
      hasValue: true,
      value: nextSelection,
    };

    return nextSelection;
  };

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export { useStoreSelector };
