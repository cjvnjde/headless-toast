import { createContext, useContext, useCallback } from "react";
import type { ToastCustomOptions, ToastData, CloseReason } from "@headless-toast/core";
import type {
  ReactToastState,
  ReactToastStore,
  ReactToastUpdate,
} from "./types";

type ToastContextValue = {
  toast: ReactToastState;
  store: ReactToastStore;
};

const ToastCtx = createContext<ToastContextValue | null>(null);

function useToast<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
>() {
  const ctx = useContext(ToastCtx);

  if (!ctx) {
    throw new Error(
      "useToast() must be used inside a toast component rendered by <Toaster>.",
    );
  }

  const { toast, store } = ctx;

  const dismiss = useCallback(
    (reason?: "user" | "programmatic" | "swipe") => {
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

  const onMouseEnter = useCallback(() => {
    if (toast.options.pauseOnHover) {
      store.pause(toast.id);
    }
  }, [toast.options.pauseOnHover, toast.id, store]);

  const onMouseLeave = useCallback(() => {
    if (toast.options.pauseOnHover) {
      store.resume(toast.id);
    }
  }, [toast.options.pauseOnHover, toast.id, store]);

  return {
    toast,
    store,
    dismiss,
    pause,
    resume,
    update,
    waitForClose,
    pauseOnHoverHandlers: {
      onMouseEnter,
      onMouseLeave,
    },
  };
}

export { ToastCtx, useToast };
