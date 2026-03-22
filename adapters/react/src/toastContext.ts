import { createContext } from "react";
import type { ReactToastState, ReactToastStore } from "./types";

type ToastContextValue = {
  toast?: ReactToastState;
  toastId?: string;
  store: ReactToastStore;
};

const ToastCtx = createContext<ToastContextValue | null>(null);

export { ToastCtx };
export type { ToastContextValue };
