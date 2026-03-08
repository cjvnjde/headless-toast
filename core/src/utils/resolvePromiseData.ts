import type {
  NormalizedToastData,
  PromiseToastData,
  ToastData,
} from "../types";
import { normalizeData } from "./normalizeData";

export function resolvePromiseData<T, TData extends ToastData>(
  value: PromiseToastData<T, TData>,
  input: T,
): NormalizedToastData<TData>;

export function resolvePromiseData<T, TData extends ToastData>(
  value: PromiseToastData<T, TData>,
  input: T,
): ToastData {
  if (typeof value === "function") {
    return normalizeData(value(input));
  }

  return normalizeData(value);
}
