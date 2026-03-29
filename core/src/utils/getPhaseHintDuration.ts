import type { ToastPhase, ToastState } from "../types.ts";
import { TOAST_PHASE } from "../types.ts";
import { resolveAnimationHintDuration } from "./resolveAnimationHintDuration";

export function getPhaseHintDuration(toast: ToastState, phase: ToastPhase) {
  return resolveAnimationHintDuration(
    phase === TOAST_PHASE.ENTER ? toast.options.enter : toast.options.exit,
  );
}
