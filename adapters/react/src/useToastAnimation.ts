import { TOAST_STATUS } from "@headless-toast/core";
import {
  useRef,
  useEffect,
  type AnimationEvent,
  type TransitionEvent,
} from "react";
import type { AnimationResult } from "./types";
import { useToastContext, useToast } from "./useToast";
import { getAnimationDuration } from "./utils";

type UseToastAnimationOptions = {
  className?: string;
  swipeDismissed?: boolean;
};

function useToastAnimation<TElement extends HTMLElement = HTMLDivElement>(
  options?: UseToastAnimationOptions,
): AnimationResult<TElement> {
  const { store } = useToastContext();
  const { toast, markEntered, markExited } = useToast();
  const ref = useRef<TElement>(null);

  const completeCurrentPhase = () => {
    if (toast.status === TOAST_STATUS.ENTERING) {
      markEntered();
    } else if (toast.status === TOAST_STATUS.EXITING) {
      markExited();
    }
  };

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

      if (typeof requestAnimationFrame === "undefined") {
        completeCurrentPhase();
        return;
      }

      const rafId = requestAnimationFrame(() => {
        const duration = getAnimationDuration(el);

        if (duration > 0) {
          store.setAnimationDuration(toast.id, phase, duration);
          return;
        }

        completeCurrentPhase();
      });

      return () => cancelAnimationFrame(rafId);
    }
  }, [toast.status, toast.id, store, completeCurrentPhase]);

  const handlePhaseEnd = () => completeCurrentPhase();

  const onAnimationEnd = (e: AnimationEvent<TElement>) => {
    if (e.target !== e.currentTarget) {
      return;
    }

    handlePhaseEnd();
  };

  const onTransitionEnd = (e: TransitionEvent<TElement>) => {
    if (e.target !== e.currentTarget) {
      return;
    }

    handlePhaseEnd();
  };

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
