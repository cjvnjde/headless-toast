import type {
  CloseReason,
  DraggableConfig,
  StackConfig,
  StoreConfig,
  ToastCustomOptions,
  ToastData,
  ToastPlacement,
  ToastPromiseConfig,
  ToastStore,
} from "@headless-toast/core";
import type {
  AnimationEvent,
  CSSProperties,
  PointerEvent,
  ReactNode,
  Ref,
  TransitionEvent,
} from "react";

type AdapterToastOptions = {
  placement?: ToastPlacement;
  containerId?: string;
  dismissible?: boolean;
  pauseOnHover?: boolean | "individual";
  pauseOnFocusLoss?: boolean;
  draggable?: boolean | DraggableConfig;
  stack?: StackConfig;
};

type AdapterStoreConfig<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
> = StoreConfig<TData, TCustom & AdapterToastOptions>;

type ReactToastCustomOptions<TCustom extends ToastCustomOptions = {}> =
  TCustom & AdapterToastOptions;

type ReactToastStore<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
> = ToastStore<TData, ReactToastCustomOptions<TCustom>>;

type ReactToastState<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
> = ReturnType<ReactToastStore<TData, TCustom>["getToasts"]>[number];

type ReactResolvedToastOptions<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
> = ReactToastState<TData, TCustom>["options"];

type ReactToastOptions<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
> = Parameters<ReactToastStore<TData, TCustom>["add"]>[0];

type ReactToastUpdate<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
> = Parameters<ReactToastStore<TData, TCustom>["update"]>[1];

type ReactToastMethodOptions<TCustom extends ToastCustomOptions = {}> =
  NonNullable<Parameters<ReactToastStore<ToastData, TCustom>["success"]>[1]>;

type ReactLoadingToastOptions<TCustom extends ToastCustomOptions = {}> =
  NonNullable<Parameters<ReactToastStore<ToastData, TCustom>["loading"]>[1]>;

type ReactToastPromiseOptions<TCustom extends ToastCustomOptions = {}> =
  NonNullable<Parameters<ReactToastStore<ToastData, TCustom>["promise"]>[2]>;

type ReactToastPromiseConfig<
  T,
  TData extends ToastData = ToastData,
> = ToastPromiseConfig<T, TData>;

type ToasterProps<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
> = {
  store?: ReactToastStore<TData, TCustom>;
  children?: ReactNode;
  className?: string;
  containerId?: string;
  inline?: boolean;
};

type ToasterListProps = {
  children?: ReactNode;
  className?: string;
};

type ToastProviderProps<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
> = {
  children: ReactNode;
  toast?: ReactToastState<TData, TCustom>;
  toastId?: string;
  store: ReactToastStore<TData, TCustom>;
};

type UseToastActionsResult<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
> = {
  dismiss: (reason?: Exclude<CloseReason, "timeout">) => void;
  pause: () => void;
  resume: () => void;
  update: (updates: ReactToastUpdate<TData, TCustom>) => void;
  waitForClose: () => Promise<CloseReason>;
  markEntered: () => void;
  markExited: () => void;
  pauseOnHoverHandlers: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  };
};

type UseToastResult<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
> = UseToastActionsResult<TData, TCustom> & {
  toast: ReactToastState<TData, TCustom>;
};

type DragHandlers = {
  onPointerDown: (e: PointerEvent) => void;
  onPointerMove: (e: PointerEvent) => void;
  onPointerUp: (e: PointerEvent) => void;
  onPointerCancel: (e: PointerEvent) => void;
  onLostPointerCapture: (e: PointerEvent) => void;
};

type DragResult = {
  handlers: DragHandlers;
  style: CSSProperties;
  isDragging: boolean;
  swipeDismissed: boolean;
};

type AnimationResult<TElement extends HTMLElement = HTMLDivElement> = {
  ref: Ref<TElement | null>;
  className: string;
  attributes: {
    "data-toast": "";
    "data-toast-id": string;
    "data-toast-status": string;
    "data-toast-type": string;
    "data-toast-placement": string;
    "data-toast-dismissible": "true" | "false";
    "data-toast-swipe-dismissed": "true" | "false";
  };
  handlers: {
    onAnimationEnd: (e: AnimationEvent<TElement>) => void;
    onTransitionEnd: (e: TransitionEvent<TElement>) => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  };
};

export type {
  AdapterToastOptions,
  ToasterProps,
  ToasterListProps,
  ReactToastStore,
  ReactResolvedToastOptions,
  ReactToastState,
  ReactToastOptions,
  ReactToastUpdate,
  ReactLoadingToastOptions,
  UseToastActionsResult,
  UseToastResult,
  DragHandlers,
  DragResult,
  AnimationResult,
  ToastProviderProps,
  AdapterStoreConfig,
  ReactToastMethodOptions,
  ReactToastPromiseOptions,
  ReactToastPromiseConfig,
};
