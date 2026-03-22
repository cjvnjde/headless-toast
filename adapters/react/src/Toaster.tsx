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
  type StackConfig,
  type ToastPlacement,
} from "@headless-toast/core";
import { ToastProvider } from "./ToastProvider";
import { filterByContainer } from "./filter";
import { computeStackLayout, groupByPlacement } from "./stack";
import { toast as sharedToast } from "./toast";
import { useStoreSelector } from "./useStoreSelector";
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

function isStackConfigEqual(left?: StackConfig, right?: StackConfig) {
  if (!left && !right) {
    return true;
  }

  if (!left || !right) {
    return false;
  }

  return (
    left.mode === right.mode &&
    left.expandOn === right.expandOn &&
    left.maxVisible === right.maxVisible
  );
}

function areToasterToastsEqual(
  left: ReactToastState[],
  right: ReactToastState[],
) {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    const leftToast = left[index];
    const rightToast = right[index];

    if (leftToast.id !== rightToast.id) {
      return false;
    }

    if (leftToast.options.containerId !== rightToast.options.containerId) {
      return false;
    }

    if (leftToast.options.placement !== rightToast.options.placement) {
      return false;
    }

    if (
      !isStackConfigEqual(leftToast.options.stack, rightToast.options.stack)
    ) {
      return false;
    }
  }

  return true;
}

function usePauseOnFocusLoss(store: ReactToastStore, containerId?: string) {
  const focusPausedIdsRef = useRef<Set<string>>(new Set());
  const toastsRef = useRef(filterByContainer(store.getToasts(), containerId));

  useEffect(() => {
    toastsRef.current = filterByContainer(store.getToasts(), containerId);

    return store.subscribe((toasts) => {
      toastsRef.current = filterByContainer(toasts, containerId);
    });
  }, [containerId, store]);

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
  const cachedItemsRef = useRef<Map<string, ReactNode>>(new Map());
  const childrenRef = useRef(children);
  const storeRef = useRef(store);
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

  if (childrenRef.current !== children || storeRef.current !== store) {
    childrenRef.current = children;
    storeRef.current = store;
    cachedItemsRef.current.clear();
  }

  const activeToastIds = new Set(toasts.map((toast) => toast.id));

  for (const toastId of cachedItemsRef.current.keys()) {
    if (!activeToastIds.has(toastId)) {
      cachedItemsRef.current.delete(toastId);
    }
  }

  const renderedToasts = visibleToasts.map((toast) => {
    const cachedItem = cachedItemsRef.current.get(toast.id);

    if (cachedItem) {
      return cachedItem;
    }

    const item = (
      <ToastProvider key={toast.id} toastId={toast.id} store={store}>
        {children}
      </ToastProvider>
    );

    cachedItemsRef.current.set(toast.id, item);

    return item;
  });

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
      {renderedToasts}
    </div>
  );
}

function ToasterList({ className, children }: ToasterListProps) {
  const context = useContext(ToasterCtx);

  if (!context) {
    throw new Error("<Toaster.List> must be rendered inside <Toaster>.");
  }

  const groups = groupByPlacement(context.toasts);

  return (
    <>
      {ALL_PLACEMENTS.map((placement) => (
        <ToastListGroup
          key={placement}
          placement={placement}
          toasts={groups.get(placement) ?? []}
          inline={context.inline}
          store={context.store}
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
  const toasts = useStoreSelector(
    resolvedStore,
    (allToasts) => filterByContainer(allToasts, containerId),
    areToasterToastsEqual,
  );
  const [isMounted, setIsMounted] = useState(false);

  usePauseOnFocusLoss(resolvedStore, containerId);

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
