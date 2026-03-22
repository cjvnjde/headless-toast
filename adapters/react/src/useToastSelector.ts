import { useRef } from "react";
import type { ToastCustomOptions, ToastData } from "@headless-toast/core";
import { findToastById } from "./toastLookup";
import { useStoreSelector } from "./useStoreSelector";
import { useToastSource } from "./useToastSource";
import type { ReactToastState } from "./types";

function useToastSelector<TData extends ToastData, TSelected>(
  selector: (toast: ReactToastState<TData>) => TSelected,
  isEqual?: (left: TSelected, right: TSelected) => boolean,
): TSelected;

function useToastSelector<
  TData extends ToastData,
  TCustom extends ToastCustomOptions,
  TSelected,
>(
  selector: (toast: ReactToastState<TData, TCustom>) => TSelected,
  isEqual?: (left: TSelected, right: TSelected) => boolean,
): TSelected;

function useToastSelector(
  selector: (toast: ReactToastState) => unknown,
  isEqual?: (left: unknown, right: unknown) => boolean,
) {
  const { initialToast, store, toastId } = useToastSource();
  const toastIdRef = useRef(toastId);
  const lastToastRef = useRef<ReactToastState | undefined>(initialToast);

  if (toastIdRef.current !== toastId) {
    toastIdRef.current = toastId;
    lastToastRef.current = initialToast;
  }

  return useStoreSelector(
    store,
    (toasts) => {
      const toast = findToastById(toasts, toastId);

      if (toast) {
        lastToastRef.current = toast;
        return selector(toast);
      }

      if (lastToastRef.current) {
        return selector(lastToastRef.current);
      }

      throw new Error(`Toast "${toastId}" could not be found.`);
    },
    isEqual,
  );
}

export { useToastSelector };
