import type { PromiseToastData, ToastData } from "../types";

export function resolvePromiseData<T, TData extends ToastData>(
  value: PromiseToastData<T, TData>,
  input: T,
): TData {
  if (typeof value === "function") {
    return value(input);
  }

  return value;
}
