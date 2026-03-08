import { useStore } from "@headless-toast/react";
import type { ReactToastStore } from "@headless-toast/react";

type ToastCounterProps = {
  store: ReactToastStore;
};

function ToastCounter({ store }: ToastCounterProps) {
  const toasts = useStore(store);

  return (
    <div style={{ margin: "8px 0", fontSize: 13, color: "#6b7280" }}>
      Active toasts: <strong>{toasts.length}</strong>
    </div>
  );
}

export { ToastCounter };
