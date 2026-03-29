import type { ToastData } from "../types";

export function resolveData<TData extends ToastData>(data: TData | undefined) {
  return (data ?? {}) as TData;
}
