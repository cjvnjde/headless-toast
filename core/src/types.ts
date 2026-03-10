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

type EmptyToastData = Record<string, never>;

type ToastReservedOptionKey =
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

type ReservedCustomToastOptionKeys<TCustom extends ToastCustomOptions = {}> =
  Extract<keyof TCustom, ToastReservedOptionKey>;

type NormalizedToastData<TData extends ToastData = ToastData> = {} extends TData
  ? TData | EmptyToastData
  : TData;

type ToastDataField<TData extends ToastData = ToastData> = {} extends TData
  ? { data?: TData }
  : { data: TData };

type ToastCustomOptions = object;

type CustomToastFields<TCustom extends ToastCustomOptions = {}> = Partial<
  Pick<TCustom, Exclude<keyof TCustom, ReservedCustomToastOptionKeys<TCustom>>>
>;

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

type TimerCallbacks = {
  onAutoclose(id: string): void;
  onSafetyTimeout(id: string): void;
  onProgressTick(id: string, progress: number): void;
};

type ProgressConfig = {
  enabled: boolean;
  startValue: number;
};

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

type BaseToastOptions<TData extends ToastData = ToastData> =
  SharedToastOptionFields & {
    type?: ToastType;
  } & ToastDataField<TData>;

type ToastOptions<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
> = BaseToastOptions<TData> & CustomToastFields<TCustom>;

type ResolvedToastOptions<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
> = SharedToastOptionFields &
  CustomToastFields<TCustom> & {
    data: NormalizedToastData<TData>;
    type: ToastType;
  };

type BaseToastUpdate<TData extends ToastData = ToastData> =
  SharedToastOptionFields & {
    type?: ToastType;
    data?: Partial<TData> | NormalizedToastData<TData>;
  };

type ToastUpdate<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
> =
  | BaseToastUpdate<TData>
  | (BaseToastUpdate<TData> & CustomToastFields<TCustom>);

type TypedToastOptions<TCustom extends ToastCustomOptions = {}> =
  SharedToastOptionFields & CustomToastFields<TCustom>;

type ToastMethodOptions<TCustom extends ToastCustomOptions = {}> =
  TypedToastOptions<TCustom>;

type LoadingToastOptions<TCustom extends ToastCustomOptions = {}> = Omit<
  SharedToastOptionFields,
  "duration"
> &
  CustomToastFields<TCustom>;

type PromiseToastData<T, TData extends ToastData = ToastData> =
  | TData
  | ((input: T) => TData);

type PromiseToastOptions<TCustom extends ToastCustomOptions = {}> =
  TypedToastOptions<TCustom>;

type ToastPromiseConfig<T, TData extends ToastData = ToastData> = {
  loading: TData;
  success: PromiseToastData<T, TData>;
  error: PromiseToastData<unknown, TData>;
};

type ToastDefaults<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
> = Partial<ToastOptions<TData, TCustom>>;

type StoreTimingConfig = {
  animationBufferMs?: number;
  animationFallbackMs?: number;
  promiseSuccessDuration?: number;
  promiseErrorDuration?: number;
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

type ToastReference<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
> = string | ToastHandle<TData, TCustom>;

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
  data: NormalizedToastData<TData>;
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
  defaults?: ToastDefaults<TData, TCustom>;
  maxToasts?: number;
  timing?: StoreTimingConfig;
};

type Subscriber<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
> = (toasts: ToastState<TData, TCustom>[]) => void;

interface ToastStore<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
> {
  subscribe(listener: Subscriber<TData, TCustom>): () => void;
  getToasts(): ToastState<TData, TCustom>[];

  add(options: ToastOptions<TData, TCustom>): ToastHandle<TData, TCustom>;
  success(
    data: TData,
    options?: ToastMethodOptions<TCustom>,
  ): ToastHandle<TData, TCustom>;
  error(
    data: TData,
    options?: ToastMethodOptions<TCustom>,
  ): ToastHandle<TData, TCustom>;
  warning(
    data: TData,
    options?: ToastMethodOptions<TCustom>,
  ): ToastHandle<TData, TCustom>;
  info(
    data: TData,
    options?: ToastMethodOptions<TCustom>,
  ): ToastHandle<TData, TCustom>;
  loading(
    data: TData,
    options?: LoadingToastOptions<TCustom>,
  ): ToastHandle<TData, TCustom>;

  dismiss(id: ToastReference<TData, TCustom>, reason?: CloseReason): void;
  dismissAll(): void;
  update(
    id: ToastReference<TData, TCustom>,
    updates: ToastUpdate<TData, TCustom>,
  ): void;
  pause(id: ToastReference<TData, TCustom>): void;
  resume(id: ToastReference<TData, TCustom>): void;

  promise<T>(
    promise: Promise<T>,
    opts: ToastPromiseConfig<T, TData>,
    options?: PromiseToastOptions<TCustom>,
  ): Promise<T>;

  setAnimationDuration(
    id: ToastReference<TData, TCustom>,
    phase: ToastPhase,
    durationMs: number,
  ): void;
  markEntered(id: ToastReference<TData, TCustom>): void;
  markExited(id: ToastReference<TData, TCustom>): void;

  waitForClose(id: ToastReference<TData, TCustom>): Promise<CloseReason>;

  destroy(): void;
}

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
  EmptyToastData,
  NormalizedToastData,
  ToastReservedOptionKey,
  ReservedCustomToastOptionKeys,
  ToastCustomOptions,
  CustomToastFields,
  AnimationConfig,
  DragState,
  DraggableConfig,
  GestureInput,
  StackConfig,
  TimerCallbacks,
  ProgressConfig,
  BaseToastOptions,
  ToastOptions,
  ResolvedToastOptions,
  BaseToastUpdate,
  ToastUpdate,
  TypedToastOptions,
  ToastMethodOptions,
  LoadingToastOptions,
  PromiseToastData,
  ToastPromiseConfig,
  PromiseToastOptions,
  ToastDefaults,
  StoreTimingConfig,
  ToastHandle,
  ToastReference,
  ToastState,
  StoreConfig,
  Subscriber,
  ToastStore,
};
