import type { ReactToastState } from "./types";

function findToastById<T extends ReactToastState>(
  toasts: T[],
  toastId: string,
) {
  return toasts.find((toast) => toast.id === toastId);
}

export { findToastById };
