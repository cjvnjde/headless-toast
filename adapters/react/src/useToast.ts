import { createContext, createElement, useContext } from "react";
import type {
  CloseReason,
  ToastCustomOptions,
  ToastData,
} from "@headless-toast/core";
import type {
  ReactToastState,
  ReactToastStore,
  ReactToastUpdate,
  ToastProviderProps,
} from "./types";

type ToastContextValue = {
  toast: ReactToastState;
  store: ReactToastStore;
};

const ToastCtx = createContext<ToastContextValue | null>(null);

function ToastProvider<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
>({ children, toast, store }: ToastProviderProps<TData, TCustom>) {
  return createElement(
    ToastCtx.Provider,
    { value: { toast, store } },
    children,
  );
}

function useToastContext<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
>() {
  const ctx = useContext(ToastCtx);

  if (!ctx) {
    throw new Error(
      "useToast() must be used inside a toast component rendered by <Toaster>.",
    );
  }

  return ctx as {
    toast: ReactToastState<TData, TCustom>;
    store: ReactToastStore<TData, TCustom>;
  };
}

function useToast<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
>() {
  const { toast, store } = useToastContext<TData, TCustom>();

  const dismiss = (reason?: Exclude<CloseReason, "timeout">) =>
    store.dismiss(toast.id, reason);

  const pause = () => store.pause(toast.id);

  const resume = () => store.resume(toast.id);

  const update = (updates: ReactToastUpdate<TData, TCustom>) =>
    store.update(toast.id, updates);

  const waitForClose = () => store.waitForClose(toast.id);

  const markEntered = () => store.markEntered(toast.id);

  const markExited = () => store.markExited(toast.id);

  const onMouseEnter = () => {
    if (toast.options.pauseOnHover) {
      pause();
    }
  };

  const onMouseLeave = () => {
    if (toast.options.pauseOnHover) {
      resume();
    }
  };

  return {
    toast,
    dismiss,
    pause,
    resume,
    update,
    waitForClose,
    markEntered,
    markExited,
    pauseOnHoverHandlers: {
      onMouseEnter,
      onMouseLeave,
    },
  };
}

export { ToastCtx, ToastProvider, useToastContext, useToast };
