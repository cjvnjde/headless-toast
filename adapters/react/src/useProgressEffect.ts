import { useEffect, useRef } from "react";
import { findToastById } from "./toastLookup";
import { useToastSource } from "./useToastSource";

function useProgressEffect(listener: (progress: number) => void) {
  const { initialToast, store, toastId } = useToastSource();
  const listenerRef = useRef(listener);
  const lastProgressRef = useRef<number | undefined>(initialToast?.progress);

  listenerRef.current = listener;

  useEffect(() => {
    const currentProgress =
      findToastById(store.getToasts(), toastId)?.progress ??
      lastProgressRef.current;

    if (currentProgress !== undefined) {
      lastProgressRef.current = currentProgress;
      listenerRef.current(currentProgress);
    }

    return store.subscribe((toasts) => {
      const nextProgress = findToastById(toasts, toastId)?.progress;

      if (nextProgress === undefined) {
        return;
      }

      if (lastProgressRef.current === nextProgress) {
        return;
      }

      lastProgressRef.current = nextProgress;
      listenerRef.current(nextProgress);
    });
  }, [store, toastId]);
}

export { useProgressEffect };
