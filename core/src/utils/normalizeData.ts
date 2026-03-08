import type { EmptyToastData, NormalizedToastData, ToastData } from "../types";

const EMPTY_TOAST_DATA: EmptyToastData = {};

export function normalizeData<TData extends ToastData>(data: TData): TData;
export function normalizeData<TData extends ToastData>(
  data: TData | undefined,
): NormalizedToastData<TData>;

export function normalizeData<TData extends ToastData>(
  data: TData | undefined,
): ToastData {
  return data ?? EMPTY_TOAST_DATA;
}
