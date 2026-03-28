import type {
  CloseReason,
  ToastCustomOptions,
  ToastData,
} from "@headless-toast/core";
import { useToastSelector } from "./useToastSelector";
import { useToastSource } from "./useToastSource";
import type { ReactToastUpdate, UseToastActionsResult } from "./types";

function useToastActions<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
>(): UseToastActionsResult<TData, TCustom> {
  const { store, toastId } = useToastSource<TData, TCustom>();
  const pauseOnHover = useToastSelector<
    TData,
    TCustom,
    boolean | "individual" | undefined
  >((toast) => toast.options.pauseOnHover);

  const dismiss = (reason?: Exclude<CloseReason, "timeout">) =>
    store.dismiss(toastId, reason);

  const pause = () => store.pause(toastId);

  const resume = () => store.resume(toastId);

  const update = (updates: ReactToastUpdate<TData, TCustom>) =>
    store.update(toastId, updates);

  const waitForClose = () => store.waitForClose(toastId);

  const markEntered = () => store.markEntered(toastId);

  const markExited = () => store.markExited(toastId);

  const onMouseEnter = () => {
    if (pauseOnHover === "individual") {
      pause();
    }
  };

  const onMouseLeave = () => {
    if (pauseOnHover === "individual") {
      resume();
    }
  };

  return {
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

export { useToastActions };
