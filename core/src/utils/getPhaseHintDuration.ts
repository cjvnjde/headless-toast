import type {
  ToastCustomOptions,
  ToastData,
  ToastPhase,
  ToastState,
} from "../types.ts";
import { TOAST_PHASE } from "../types.ts";
import { resolveAnimationHintDuration } from "./resolveAnimationHintDuration";

export function getPhaseHintDuration<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
>(toast: ToastState<TData, TCustom>, phase: ToastPhase) {
  return resolveAnimationHintDuration(
    phase === TOAST_PHASE.ENTER ? toast.options.enter : toast.options.exit,
  );
}
