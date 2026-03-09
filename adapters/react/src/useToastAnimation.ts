import { TOAST_STATUS } from "@headless-toast/core";
import {
  useContext,
  useRef,
  useEffect,
  useCallback,
  type AnimationEvent,
  type TransitionEvent,
} from "react";
import type { AnimationResult } from "./types";
import { ToastCtx, useToast } from "./useToast";
import { getAnimationDuration } from "./utils";

type UseToastAnimationOptions = {
  className?: string;
  swipeDismissed?: boolean;
};

function useToastAnimation<TElement extends HTMLElement = HTMLDivElement>(
  options?: UseToastAnimationOptions,
): AnimationResult<TElement> {
  const ctx = useContext(ToastCtx);
  const { toast, markEntered, markExited } = useToast();
  const ref = useRef<TElement>(null);

  if (!ctx) {
    throw new Error(
      "useToastAnimation() must be used inside a toast component rendered by <Toaster>.",
    );
  }

  const completeCurrentPhase = useCallback(() => {
    if (toast.status === TOAST_STATUS.ENTERING) {
      markEntered();
    } else if (toast.status === TOAST_STATUS.EXITING) {
      markExited();
    }
  }, [toast.status, markEntered, markExited]);

  useEffect(() => {
    const el = ref.current;

    if (!el) {
      return;
    }

    if (
      toast.status === TOAST_STATUS.ENTERING ||
      toast.status === TOAST_STATUS.EXITING
    ) {
      const phase = toast.status === TOAST_STATUS.ENTERING ? "enter" : "exit";

      const rafId = requestAnimationFrame(() => {
        const duration = getAnimationDuration(el);
        if (duration > 0) {
          ctx.store.setAnimationDuration(toast.id, phase, duration);
          return;
        }

        completeCurrentPhase();
      });

      return () => cancelAnimationFrame(rafId);
    }
  }, [toast.status, toast.id, ctx, completeCurrentPhase]);

  const handlePhaseEnd = useCallback(() => {
    completeCurrentPhase();
  }, [completeCurrentPhase]);

  const onAnimationEnd = useCallback(
    (e: AnimationEvent<TElement>) => {
      if (e.target !== e.currentTarget) {
        return;
      }

      handlePhaseEnd();
    },
    [handlePhaseEnd],
  );

  const onTransitionEnd = useCallback(
    (e: TransitionEvent<TElement>) => {
      if (e.target !== e.currentTarget) {
        return;
      }

      handlePhaseEnd();
    },
    [handlePhaseEnd],
  );

  return {
    ref,
    className: options?.className ?? "",
    attributes: {
      "data-toast": "",
      "data-toast-id": toast.id,
      "data-toast-status": toast.status,
      "data-toast-type": toast.type,
      "data-toast-swipe-dismissed": options?.swipeDismissed ? "true" : "false",
    },
    handlers: {
      onAnimationEnd,
      onTransitionEnd,
    },
  };
}

export { useToastAnimation };
