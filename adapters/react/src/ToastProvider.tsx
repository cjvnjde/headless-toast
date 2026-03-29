import { useRef } from "react";
import type { ToastCustomOptions, ToastData } from "@headless-toast/core";
import { ToastCtx } from "./toastContext";
import type { ToastContextValue } from "./toastContext";
import type { ToastProviderProps } from "./types";

function ToastProvider<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
>({ children, toast, toastId, store }: ToastProviderProps<TData, TCustom>) {
  const resolvedToastId = toastId ?? toast?.id;
  const valueRef = useRef<ToastContextValue<TData, TCustom> | null>(null);

  if (!resolvedToastId) {
    throw new Error(
      "ToastProvider requires either a toast snapshot or a toastId.",
    );
  }

  if (
    valueRef.current === null ||
    valueRef.current.store !== store ||
    valueRef.current.toastId !== resolvedToastId ||
    valueRef.current.toast !== toast
  ) {
    valueRef.current = toast
      ? { store, toast, toastId: resolvedToastId }
      : { store, toastId: resolvedToastId };
  }

  return (
    <ToastCtx.Provider value={valueRef.current}>{children}</ToastCtx.Provider>
  );
}

export { ToastProvider };
