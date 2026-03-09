import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  STACK_EXPAND_ON,
  STACK_MODE,
  TOAST_PLACEMENT,
  TOAST_STATUS,
  type ToastPlacement,
} from "@headless-toast/core";
import { filterByContainer } from "./filter";
import { computeStackLayout, groupByPlacement } from "./stack";
import { toast as sharedToast } from "./toast";
import { useStore } from "./useStore";
import { ToastProvider } from "./useToast";
import type {
  ReactToastState,
  ReactToastStore,
  ToasterListProps,
  ToasterProps,
} from "./types";

const ALL_PLACEMENTS = Object.values(TOAST_PLACEMENT);

type ToasterContextValue = {
  containerId?: string;
  inline: boolean;
  store: ReactToastStore;
  toasts: ReactToastState[];
};

const ToasterCtx = createContext<ToasterContextValue | null>(null);

function usePauseOnFocusLoss(
  toasts: ReactToastState[],
  store: ReactToastStore,
) {
  const focusPausedIdsRef = useRef<Set<string>>(new Set());
  const toastsRef = useRef(toasts);

  useEffect(() => {
    toastsRef.current = toasts;
  }, [toasts]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const pauseEligibleToasts = () => {
      for (const toast of toastsRef.current) {
        if (!toast.options.pauseOnFocusLoss) {
          continue;
        }

        if (toast.status !== TOAST_STATUS.VISIBLE) {
          continue;
        }

        if (toast.paused) {
          continue;
        }

        focusPausedIdsRef.current.add(toast.id);
        store.pause(toast.id);
      }
    };

    const resumePausedToasts = () => {
      for (const id of focusPausedIdsRef.current) {
        store.resume(id);
      }

      focusPausedIdsRef.current.clear();
    };

    if (!document.hasFocus()) {
      pauseEligibleToasts();
    }

    window.addEventListener("blur", pauseEligibleToasts);
    window.addEventListener("focus", resumePausedToasts);

    return () => {
      window.removeEventListener("blur", pauseEligibleToasts);
      window.removeEventListener("focus", resumePausedToasts);
      resumePausedToasts();
    };
  }, [store]);
}

function ToastListGroup({
  placement,
  toasts,
  inline,
  store,
  className,
  children,
}: {
  placement: ToastPlacement;
  toasts: ReactToastState[];
  inline: boolean;
  store: ReactToastStore;
  className?: string;
  children?: ReactNode;
}) {
  const stackConfig = toasts.find((toast) => toast.options.stack !== undefined)
    ?.options.stack;
  const [isHoverExpanded, setIsHoverExpanded] = useState(false);
  const [isClickExpanded, setIsClickExpanded] = useState(false);
  const isExpanded =
    stackConfig?.expandOn === STACK_EXPAND_ON.ALWAYS ||
    (stackConfig?.expandOn === STACK_EXPAND_ON.HOVER && isHoverExpanded) ||
    (stackConfig?.expandOn === STACK_EXPAND_ON.CLICK && isClickExpanded);
  const visibleToasts = stackConfig
    ? computeStackLayout(toasts, stackConfig, isExpanded).filter(
        (toast) => !toast.isCollapsed,
      )
    : toasts;

  if (toasts.length === 0 || children === undefined) {
    return null;
  }

  const containerHandlers =
    stackConfig?.expandOn === STACK_EXPAND_ON.HOVER
      ? {
          onMouseEnter: () => setIsHoverExpanded(true),
          onMouseLeave: () => setIsHoverExpanded(false),
        }
      : stackConfig?.expandOn === STACK_EXPAND_ON.CLICK
        ? { onClick: () => setIsClickExpanded((value) => !value) }
        : {};

  return (
    <div
      className={className}
      data-toast-list=""
      data-placement={placement}
      data-stack-mode={stackConfig?.mode ?? STACK_MODE.EXPANDED}
      data-stack-expand-on={stackConfig?.expandOn}
      data-stack-expanded={isExpanded ? "true" : "false"}
      data-inline={inline ? "true" : "false"}
      {...containerHandlers}
    >
      {visibleToasts.map((toast) => (
        <ToastProvider key={toast.id} toast={toast} store={store}>
          {children}
        </ToastProvider>
      ))}
    </div>
  );
}

function ToasterList({ className, children }: ToasterListProps) {
  const ctx = useContext(ToasterCtx);

  if (!ctx) {
    throw new Error("<Toaster.List> must be rendered inside <Toaster>.");
  }

  const groups = groupByPlacement(ctx.toasts);

  return (
    <>
      {ALL_PLACEMENTS.map((placement) => (
        <ToastListGroup
          key={placement}
          placement={placement}
          toasts={groups.get(placement) ?? []}
          inline={ctx.inline}
          store={ctx.store}
          className={className}
        >
          {children}
        </ToastListGroup>
      ))}
    </>
  );
}

function Toaster({
  store,
  className,
  containerId,
  inline,
  children,
}: ToasterProps) {
  const resolvedStore = store ?? sharedToast;
  const allToasts = useStore(resolvedStore);
  const toasts = filterByContainer(allToasts, containerId);
  const [isMounted, setIsMounted] = useState(false);

  usePauseOnFocusLoss(toasts, resolvedStore);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const content = (
    <ToasterCtx.Provider
      value={{
        containerId,
        inline: inline ?? false,
        store: resolvedStore,
        toasts,
      }}
    >
      <div
        className={className}
        aria-live="polite"
        data-toast-region=""
        data-inline={inline ? "true" : "false"}
        {...(containerId ? { "data-container-id": containerId } : {})}
      >
        {children}
      </div>
    </ToasterCtx.Provider>
  );

  if (!inline && !isMounted) {
    return null;
  }

  if (!inline && typeof document !== "undefined") {
    return createPortal(content, document.body);
  }

  return content;
}

Toaster.List = ToasterList;

export { Toaster };
