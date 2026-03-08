import { useRef } from "react";
import { createToast } from "@headless-toast/react";
import type { ToastApi, ReactToastStore } from "@headless-toast/react";

type IsolatedToastContext = {
  store: ReactToastStore;
  toast: ToastApi;
};

function useIsolatedToastContext(
  options?: Parameters<typeof createToast>[0],
): IsolatedToastContext {
  const ref = useRef<IsolatedToastContext | null>(null);

  if (!ref.current) {
    ref.current = createToast(options);
  }

  return ref.current;
}

export { useIsolatedToastContext };
