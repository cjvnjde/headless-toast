import { createContext, createElement, useContext, useCallback } from "react";
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

function useToastContext() {
  const ctx = useContext(ToastCtx);

  if (!ctx) {
    throw new Error(
      "useToast() must be used inside a toast component rendered by <Toaster>.",
    );
  }

  return ctx;
}

function useToast<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
>() {
  const { toast, store } = useToastContext();

  const dismiss = useCallback(
    (reason?: Exclude<CloseReason, "timeout">) => {
      store.dismiss(toast.id, reason);
    },
    [store, toast.id],
  );

  const pause = useCallback(() => {
    store.pause(toast.id);
  }, [store, toast.id]);

  const resume = useCallback(() => {
    store.resume(toast.id);
  }, [store, toast.id]);

  const update = useCallback(
    (updates: ReactToastUpdate<TData, TCustom>) => {
      store.update(toast.id, updates);
    },
    [store, toast.id],
  );

  const waitForClose = useCallback((): Promise<CloseReason> => {
    return store.waitForClose(toast.id);
  }, [store, toast.id]);

  const markEntered = useCallback(() => {
    store.markEntered(toast.id);
  }, [store, toast.id]);

  const markExited = useCallback(() => {
    store.markExited(toast.id);
  }, [store, toast.id]);

  const onMouseEnter = useCallback(() => {
    if (toast.options.pauseOnHover) {
      pause();
    }
  }, [toast.options.pauseOnHover, pause]);

  const onMouseLeave = useCallback(() => {
    if (toast.options.pauseOnHover) {
      resume();
    }
  }, [toast.options.pauseOnHover, resume]);

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
