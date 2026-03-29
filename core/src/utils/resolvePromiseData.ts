import type { ToastData } from "../types";

export function resolvePromiseData<T, TData extends ToastData>(
  value: TData | ((input: T) => TData),
  input: T,
) {
  if (typeof value === "function") {
    return value(input);
  }

  return value;
}
