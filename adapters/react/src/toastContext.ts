import { createContext } from "react";
import type { ToastCustomOptions, ToastData } from "@headless-toast/core";
import type { ReactToastState, ReactToastStore } from "./types";

type ToastContextValue<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
> = {
  toast?: ReactToastState<TData, TCustom>;
  toastId?: string;
  store: ReactToastStore<TData, TCustom>;
};

const ToastCtx = createContext<ToastContextValue<any, any> | null>(null);

export { ToastCtx };
export type { ToastContextValue };
