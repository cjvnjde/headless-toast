import type {
  ToastCustomOptions,
  ToastData,
  CloseReason,
  DraggableConfig,
  LoadingToastOptions,
  ResolvedToastOptions,
  StackConfig,
  StoreConfig,
  ToastHandle,
  ToastMethodOptions,
  ToastState,
  ToastStore,
  ToastOptions,
  ToastPromiseConfig,
  PromiseToastOptions,
  ToastReference,
  ToastUpdate,
  ToastPlacement,
} from "@headless-toast/core";
import type {
  ReactNode,
  PointerEvent,
  CSSProperties,
  AnimationEvent,
  Ref,
  TransitionEvent,
} from "react";

type ToastComponent = () => ReactNode;

type AdapterToastOptions = {
  placement?: ToastPlacement;
  containerId?: string;
  dismissible?: boolean;
  pauseOnHover?: boolean;
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

type ReactResolvedToastOptions<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
> = ResolvedToastOptions<TData, ReactToastCustomOptions<TCustom>> &
  AdapterToastOptions;

type ReactToastState<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
> = Omit<ToastState<TData, ReactToastCustomOptions<TCustom>>, "options"> & {
  options: ReactResolvedToastOptions<TData, TCustom>;
};

type PlacementClassNameContext<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
> = {
  placement: ToastPlacement;
  toasts: ReactToastState<TData, TCustom>[];
  expanded: boolean;
  stack: StackConfig | undefined;
};

type PlacementClassName<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
> =
  | string
  | ((
      context: PlacementClassNameContext<TData, TCustom>,
    ) => string | undefined);

type ReactToastOptions<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
> = ToastOptions<TData, ReactToastCustomOptions<TCustom>> &
  Partial<AdapterToastOptions>;

type ReactToastUpdate<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
> = ToastUpdate<TData, ReactToastCustomOptions<TCustom>> &
  Partial<AdapterToastOptions>;

type ReactToastMethodOptions<TCustom extends ToastCustomOptions = {}> =
  ToastMethodOptions<ReactToastCustomOptions<TCustom>> &
    Partial<AdapterToastOptions>;

type ReactLoadingToastOptions<TCustom extends ToastCustomOptions = {}> =
  LoadingToastOptions<ReactToastCustomOptions<TCustom>> &
    Partial<AdapterToastOptions>;

type ReactToastPromiseOptions<TCustom extends ToastCustomOptions = {}> =
  PromiseToastOptions<ReactToastCustomOptions<TCustom>> &
    Partial<AdapterToastOptions>;

type ReactToastPromiseConfig<
  T,
  TData extends ToastData = ToastData,
> = ToastPromiseConfig<T, TData>;

type ToasterProps<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
> = {
  store?: ReactToastStore<TData, TCustom>;
  component: ToastComponent;
  placements?: ToastPlacement[];
  className?: string;
  placementClassName?: PlacementClassName<TData, TCustom>;
  containerId?: string;
  inline?: boolean;
};

type ToastApi<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
> = {
  add(
    options: ReactToastOptions<TData, TCustom>,
  ): ToastHandle<TData, ReactToastCustomOptions<TCustom>>;
  success(
    data: TData,
    options?: ReactToastMethodOptions<TCustom>,
  ): ToastHandle<TData, ReactToastCustomOptions<TCustom>>;
  error(
    data: TData,
    options?: ReactToastMethodOptions<TCustom>,
  ): ToastHandle<TData, ReactToastCustomOptions<TCustom>>;
  warning(
    data: TData,
    options?: ReactToastMethodOptions<TCustom>,
  ): ToastHandle<TData, ReactToastCustomOptions<TCustom>>;
  info(
    data: TData,
    options?: ReactToastMethodOptions<TCustom>,
  ): ToastHandle<TData, ReactToastCustomOptions<TCustom>>;
  loading(
    data: TData,
    options?: ReactLoadingToastOptions<TCustom>,
  ): ToastHandle<TData, ReactToastCustomOptions<TCustom>>;
  dismiss(
    reference: ToastReference<TData, ReactToastCustomOptions<TCustom>>,
    reason?: CloseReason,
  ): void;
  dismissAll(): void;
  update(
    reference: ToastReference<TData, ReactToastCustomOptions<TCustom>>,
    updates: ReactToastUpdate<TData, TCustom>,
  ): void;
  promise<T>(
    promise: Promise<T>,
    opts: ReactToastPromiseConfig<T, TData>,
    options?: ReactToastPromiseOptions<TCustom>,
  ): Promise<T>;
};

type UseToastResult<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
> = {
  toast: ReactToastState<TData, TCustom>;
  store: ReactToastStore<TData, TCustom>;
  dismiss: (reason?: "user" | "programmatic" | "swipe") => void;
  pause: () => void;
  resume: () => void;
  update: (updates: ReactToastUpdate<TData, TCustom>) => void;
  waitForClose: () => Promise<CloseReason>;
  pauseOnHoverHandlers: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  };
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

type AnimationResult = {
  ref: Ref<HTMLDivElement | null>;
  className: string;
  attributes: {
    "data-toast": "";
    "data-toast-id": string;
    "data-toast-status": string;
    "data-toast-type": string;
    "data-toast-swipe-dismissed": "true" | "false";
  };
  handlers: {
    onAnimationEnd: (e: AnimationEvent<HTMLDivElement>) => void;
    onTransitionEnd: (e: TransitionEvent<HTMLDivElement>) => void;
  };
};

export type {
  AdapterToastOptions,
  ToastComponent,
  ToasterProps,
  ToastApi,
  ReactToastStore,
  ReactResolvedToastOptions,
  ReactToastState,
  PlacementClassNameContext,
  PlacementClassName,
  ReactToastOptions,
  ReactToastUpdate,
  ReactLoadingToastOptions,
  UseToastResult,
  DragHandlers,
  DragResult,
  AnimationResult,
  AdapterStoreConfig,
  ReactToastMethodOptions,
  ReactToastPromiseOptions,
  ReactToastPromiseConfig,
};
