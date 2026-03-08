import {
  useRef,
  useEffect,
  useCallback,
  type AnimationEvent,
  type TransitionEvent,
} from "react";
import { useToast } from "./useToast";
import { getAnimationDuration } from "./utils";

function useToastAnimation(options?: {
  className?: string;
  swipeDismissed?: boolean;
}) {
  const { toast, store } = useToast();
  const ref = useRef<HTMLDivElement>(null);

  const completeCurrentPhase = useCallback(() => {
    if (toast.status === "entering") {
      store.markEntered(toast.id);
      return;
    }

    if (toast.status === "exiting") {
      store.markExited(toast.id);
    }
  }, [toast.status, toast.id, store]);

  useEffect(() => {
    const el = ref.current;

    if (!el) {
      return;
    }

    if (toast.status === "entering" || toast.status === "exiting") {
      const phase = toast.status === "entering" ? "enter" : "exit";

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

  const onAnimationEnd = useCallback(
    (e: AnimationEvent<HTMLDivElement> | TransitionEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) {
        return;
      }

      completeCurrentPhase();
    },
    [completeCurrentPhase],
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
      onTransitionEnd: onAnimationEnd,
    },
  };
}

export { useToastAnimation };
