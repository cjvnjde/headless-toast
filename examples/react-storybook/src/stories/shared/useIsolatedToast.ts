import { useRef } from "react";
import { createToast } from "@headless-toast/react";
import type { ReactToastStore } from "@headless-toast/react";

function useIsolatedToast(
  options?: Parameters<typeof createToast>[0],
): ReactToastStore {
  const ref = useRef<ReactToastStore | null>(null);

  if (!ref.current) {
    ref.current = createToast(options).toast;
  }

  return ref.current;
}

export { useIsolatedToast };
