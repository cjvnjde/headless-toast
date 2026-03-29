import type { ToastPhase, ToastState } from "../types.ts";
import { TOAST_PHASE, TOAST_STATUS } from "../types.ts";

export function isPhaseStatus(toast: ToastState, phase: ToastPhase) {
  return phase === TOAST_PHASE.ENTER
    ? toast.status === TOAST_STATUS.ENTERING
    : toast.status === TOAST_STATUS.EXITING;
}
