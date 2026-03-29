type ValueOf<T> = T[keyof T];

const TOAST_PLACEMENT = {
  TOP_LEFT: "top-left",
  TOP_CENTER: "top-center",
  TOP_RIGHT: "top-right",
  BOTTOM_LEFT: "bottom-left",
  BOTTOM_CENTER: "bottom-center",
  BOTTOM_RIGHT: "bottom-right",
} as const;

type ToastPlacement = ValueOf<typeof TOAST_PLACEMENT>;

const CLOSE_REASON = {
  TIMEOUT: "timeout",
  USER: "user",
  PROGRAMMATIC: "programmatic",
  SWIPE: "swipe",
} as const;

type CloseReason = ValueOf<typeof CLOSE_REASON>;

const TOAST_TYPE = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
  LOADING: "loading",
  CUSTOM: "custom",
} as const;

type ToastType = ValueOf<typeof TOAST_TYPE>;

const ANIMATION_EASING = {
  EASE: "ease",
  EASE_IN: "ease-in",
  EASE_OUT: "ease-out",
  LINEAR: "linear",
} as const;

type AnimationEasing = ValueOf<typeof ANIMATION_EASING>;

type ToastData = Record<string, unknown>;

type ReservedToastOptionKey =
  | "id"
  | "type"
  | "duration"
  | "enter"
  | "exit"
  | "progress"
  | "data"
  | "onClose"
  | "onAutoClose"
  | "onOpen";

type ToastDataField<TData extends ToastData = ToastData> = {} extends TData
  ? { data?: TData }
  : { data: TData };

type ToastCustomOptions = object;

type AnimationConfig = {
  name: string;
  duration?: number;
  easing?: AnimationEasing | ((t: number) => number);
};

const DRAG_DIRECTION = {
  X: "x",
  Y: "y",
  BOTH: "both",
} as const;

type DragDirection = ValueOf<typeof DRAG_DIRECTION>;

type DragState = {
  active: boolean;
  offsetX: number;
  offsetY: number;
  velocity: number;
  progress: number;
  dismissed: boolean;
};

type DraggableConfig = {
  threshold: number;
  direction: DragDirection;
  velocityThreshold?: number;
};

type GestureInput = {
  dx: number;
  dy: number;
  vx: number;
  vy: number;
};

const STACK_MODE = {
  EXPANDED: "expanded",
  COLLAPSED: "collapsed",
} as const;

type StackMode = ValueOf<typeof STACK_MODE>;

const STACK_EXPAND_ON = {
  HOVER: "hover",
  CLICK: "click",
  ALWAYS: "always",
} as const;

type StackExpandOn = ValueOf<typeof STACK_EXPAND_ON>;

type StackConfig = {
  mode: StackMode;
  expandOn?: StackExpandOn;
  maxVisible?: number;
};

type TickScheduler = (callback: () => void) => () => void;

type SharedToastOptionFields = {
  id?: string;
  duration?: number;
  enter?: string | AnimationConfig;
  exit?: string | AnimationConfig;
  progress?: boolean;
  onClose?: (reason: CloseReason) => void;
  onAutoClose?: () => void;
  onOpen?: () => void;
};

type ToastMethodOptions<TCustom extends ToastCustomOptions = {}> =
  SharedToastOptionFields & Partial<Omit<TCustom, ReservedToastOptionKey>>;

type ToastOptions<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
> = ToastMethodOptions<TCustom> & {
  type?: ToastType;
} & ToastDataField<TData>;

type ResolvedToastOptions<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
> = Omit<ToastOptions<TData, TCustom>, "data" | "type"> & {
  data: TData;
  type: ToastType;
};

type ToastUpdate<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
> = ToastMethodOptions<TCustom> & {
  type?: ToastType;
  data?: Partial<TData> | TData;
};

type LoadingToastOptions<TCustom extends ToastCustomOptions = {}> = Omit<
  ToastMethodOptions<TCustom>,
  "duration"
>;

type ToastPromiseConfig<T, TData extends ToastData = ToastData> = {
  loading: TData;
  success: TData | ((input: T) => TData);
  error: TData | ((input: unknown) => TData);
};

type ToastHandle<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
> = {
  id: string;
  update(updates: ToastUpdate<TData, TCustom>): void;
  dismiss(reason?: CloseReason): void;
  closed: Promise<CloseReason>;
};

const TOAST_STATUS = {
  ENTERING: "entering",
  VISIBLE: "visible",
  EXITING: "exiting",
  REMOVED: "removed",
} as const;

type ToastStatus = ValueOf<typeof TOAST_STATUS>;

type ToastState<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
> = {
  id: string;
  status: ToastStatus;
  type: ToastType;
  createdAt: number;
  updatedAt: number;
  remaining?: number;
  paused: boolean;
  progress: number;
  data: TData;
  options: ResolvedToastOptions<TData, TCustom>;
};

const TOAST_PHASE = {
  ENTER: "enter",
  EXIT: "exit",
} as const;

type ToastPhase = ValueOf<typeof TOAST_PHASE>;

type StoreConfig<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
> = {
  defaults?: Partial<ToastOptions<TData, TCustom>>;
  maxToasts?: number;
  timing?: {
    animationBufferMs?: number;
    animationFallbackMs?: number;
    promiseSuccessDuration?: number;
    promiseErrorDuration?: number;
  };
  tickScheduler?: TickScheduler;
};

export {
  TOAST_PLACEMENT,
  CLOSE_REASON,
  TOAST_TYPE,
  ANIMATION_EASING,
  DRAG_DIRECTION,
  STACK_MODE,
  STACK_EXPAND_ON,
  TOAST_STATUS,
  TOAST_PHASE,
};

export type {
  ToastPlacement,
  CloseReason,
  ToastType,
  AnimationEasing,
  DragDirection,
  StackMode,
  StackExpandOn,
  ToastStatus,
  ToastPhase,
  ToastData,
  ToastCustomOptions,
  AnimationConfig,
  DragState,
  DraggableConfig,
  GestureInput,
  StackConfig,
  TickScheduler,
  ToastMethodOptions,
  ToastOptions,
  ResolvedToastOptions,
  ToastUpdate,
  LoadingToastOptions,
  ToastPromiseConfig,
  ToastHandle,
  ToastState,
  StoreConfig,
};
