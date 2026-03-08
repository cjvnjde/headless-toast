import type {
  ToastCustomOptions,
  ToastData,
  ToastPhase,
  ToastState,
} from "../types.ts";
import { TOAST_PHASE, TOAST_STATUS } from "../types.ts";

export function isPhaseStatus<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
>(toast: ToastState<TData, TCustom>, phase: ToastPhase): boolean {
  return phase === TOAST_PHASE.ENTER
    ? toast.status === TOAST_STATUS.ENTERING
    : toast.status === TOAST_STATUS.EXITING;
}
