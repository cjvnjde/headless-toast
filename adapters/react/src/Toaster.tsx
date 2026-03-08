import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ToastPlacement } from "@headless-toast/core";
import type {
  PlacementClassName,
  ReactToastState,
  ReactToastStore,
  ToasterProps,
  ToastComponent,
} from "./types";
import { filterByContainer } from "./filter";
import { computeStackLayout, groupByPlacement } from "./stack";
import { toast as sharedToast } from "./toast";
import { useStore } from "./useStore";
import { ToastCtx } from "./useToast";

const ALL_PLACEMENTS: ToastPlacement[] = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

type PlacementContainerProps = {
  placement: ToastPlacement;
  toasts: ReactToastState[];
  store: ReactToastStore;
  Component: ToastComponent;
  className?: PlacementClassName;
  inline: boolean;
};

function resolvePlacementClassName(
  className: PlacementClassName | undefined,
  placement: ToastPlacement,
  toasts: ReactToastState[],
  expanded: boolean,
  stack: ReactToastState["options"]["stack"],
) {
  if (!className) {
    return undefined;
  }

  if (typeof className === "function") {
    return className({
      placement,
      toasts,
      expanded,
      stack,
    });
  }

  return className;
}

function PlacementContainer({
  placement,
  toasts,
  store,
  Component,
  className,
  inline,
}: PlacementContainerProps) {
  const stackConfig = toasts.find((toast) => toast.options.stack !== undefined)
    ?.options.stack;
  const [isHoverExpanded, setIsHoverExpanded] = useState(false);
  const [isClickExpanded, setIsClickExpanded] = useState(false);
  const isExpanded =
    stackConfig?.expandOn === "always" ||
    (stackConfig?.expandOn === "hover" && isHoverExpanded) ||
    (stackConfig?.expandOn === "click" && isClickExpanded);
  const visibleToasts = stackConfig
    ? computeStackLayout(toasts, stackConfig, isExpanded).filter(
        (toast) => !toast.isCollapsed,
      )
    : toasts;
  const placementClassName = resolvePlacementClassName(
    className,
    placement,
    toasts,
    isExpanded,
    stackConfig,
  );

  if (toasts.length === 0) {
    return null;
  }

  const containerHandlers =
    stackConfig?.expandOn === "hover"
      ? {
          onMouseEnter: () => setIsHoverExpanded(true),
          onMouseLeave: () => setIsHoverExpanded(false),
        }
      : stackConfig?.expandOn === "click"
        ? { onClick: () => setIsClickExpanded((value) => !value) }
        : {};

  return (
    <div
      className={placementClassName}
      data-toast-placement-container=""
      data-placement={placement}
      data-stack-mode={stackConfig?.mode}
      data-stack-expand-on={stackConfig?.expandOn}
      data-stack-expanded={isExpanded ? "true" : "false"}
      data-inline={inline ? "true" : "false"}
      {...containerHandlers}
    >
      {visibleToasts.map((toast) => (
        <ToastCtx.Provider key={toast.id} value={{ toast, store }}>
          <Component />
        </ToastCtx.Provider>
      ))}
    </div>
  );
}

function Toaster({
  store,
  component,
  placements = ALL_PLACEMENTS,
  className,
  placementClassName,
  containerId,
  inline,
}: ToasterProps) {
  const resolvedStore = store ?? sharedToast;
  const allToasts = useStore(resolvedStore);
  const [isMounted, setIsMounted] = useState(false);
  const focusPausedIdsRef = useRef<Set<string>>(new Set());
  const toastsRef = useRef(allToasts);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toasts = filterByContainer(allToasts, containerId);

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

        if (toast.status !== "visible") {
          continue;
        }

        if (toast.paused) {
          continue;
        }

        focusPausedIdsRef.current.add(toast.id);
        resolvedStore.pause(toast.id);
      }
    };

    const resumePausedToasts = () => {
      for (const id of focusPausedIdsRef.current) {
        resolvedStore.resume(id);
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
  }, [resolvedStore]);

  const groups = groupByPlacement(toasts);

  const content = (
    <div
      className={className}
      aria-live="polite"
      data-toast-region=""
      data-inline={inline ? "true" : "false"}
      {...(containerId ? { "data-container-id": containerId } : {})}
    >
      {placements.map((placement) => (
        <PlacementContainer
          key={placement}
          placement={placement}
          toasts={groups.get(placement) ?? []}
          store={resolvedStore}
          Component={component}
          className={placementClassName}
          inline={inline ?? false}
        />
      ))}
    </div>
  );

  if (!inline && !isMounted) {
    return null;
  }

  if (!inline && typeof document !== "undefined") {
    return createPortal(content, document.body);
  }

  return content;
}

export { Toaster };
