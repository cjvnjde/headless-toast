import type { ToastData } from "../types";

export function resolveData<TData extends ToastData>(
  data: TData | undefined,
): TData {
  return (data ?? {}) as TData;
}
