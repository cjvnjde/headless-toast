import { TOAST_STATUS } from "@headless-toast/core";
import {
  useEffect,
  useRef,
  type AnimationEvent,
  type TransitionEvent,
} from "react";
import type { AnimationResult } from "./types";
import { useToastActions } from "./useToastActions";
import { useToastSelector } from "./useToastSelector";
import { useToastSource } from "./useToastSource";
import { getAnimationDuration } from "./utils";

type UseToastAnimationOptions = {
  className?: string;
  swipeDismissed?: boolean;
};

function useToastAnimation<TElement extends HTMLElement = HTMLDivElement>(
  options?: UseToastAnimationOptions,
): AnimationResult<TElement> {
  const { store, toastId } = useToastSource();
  const status = useToastSelector((toast) => toast.status);
  const type = useToastSelector((toast) => toast.type);
  const { markEntered, markExited } = useToastActions();
  const ref = useRef<TElement>(null);

  const completeCurrentPhase = () => {
    if (status === TOAST_STATUS.ENTERING) {
      markEntered();
      return;
    }

    if (status === TOAST_STATUS.EXITING) {
      markExited();
    }
  };

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    if (status === TOAST_STATUS.ENTERING || status === TOAST_STATUS.EXITING) {
      const phase = status === TOAST_STATUS.ENTERING ? "enter" : "exit";

      if (typeof requestAnimationFrame === "undefined") {
        completeCurrentPhase();
        return;
      }

      const frameId = requestAnimationFrame(() => {
        const duration = getAnimationDuration(element);

        if (duration > 0) {
          store.setAnimationDuration(toastId, phase, duration);
          return;
        }

        completeCurrentPhase();
      });

      return () => cancelAnimationFrame(frameId);
    }
  }, [status, store, toastId]);

  const onAnimationEnd = (event: AnimationEvent<TElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    completeCurrentPhase();
  };

  const onTransitionEnd = (event: TransitionEvent<TElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    completeCurrentPhase();
  };

  return {
    ref,
    className: options?.className ?? "",
    attributes: {
      "data-toast": "",
      "data-toast-id": toastId,
      "data-toast-status": status,
      "data-toast-type": type,
      "data-toast-swipe-dismissed": options?.swipeDismissed ? "true" : "false",
    },
    handlers: {
      onAnimationEnd,
      onTransitionEnd,
    },
  };
}

export { useToastAnimation };
