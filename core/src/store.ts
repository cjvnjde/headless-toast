import type {
  LoadingToastOptions,
  NormalizedToastData,
  PromiseToastOptions,
  ToastDefaults,
  ToastMethodOptions,
  ToastPromiseConfig,
  ToastOptions,
  ResolvedToastOptions,
  ToastUpdate,
  ToastState,
  ToastStore,
  ToastHandle,
  ToastReference,
  StoreConfig,
  Subscriber,
  CloseReason,
  ToastData,
  ToastCustomOptions,
  ToastType,
  ToastPhase,
  TypedToastOptions,
} from "./types";
import { CLOSE_REASON, TOAST_PHASE, TOAST_STATUS, TOAST_TYPE } from "./types";
import { TimerManager } from "./timers";
import {
  normalizeData,
  resolvePromiseData,
  isActiveToast,
  isPhaseStatus,
  getPhaseHintDuration,
} from "./utils";

const DEFAULT_STORE_CONFIG = {
  defaults: {
    type: TOAST_TYPE.INFO,
  },
  maxToasts: 0,
  timing: {
    animationBufferMs: 100,
    animationFallbackMs: 5000,
    promiseSuccessDuration: 3000,
    promiseErrorDuration: 5000,
  },
} satisfies Required<StoreConfig>;

class Store<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
> implements ToastStore<TData, TCustom> {
  private nextId = 1;
  private toasts: Map<string, ToastState<TData, TCustom>> = new Map();
  private subscribers: Set<Subscriber<TData, TCustom>> = new Set();
  private timerManager: TimerManager;
  private closePromises: Map<
    string,
    {
      promise: Promise<CloseReason>;
      resolve: (reason: CloseReason) => void;
    }
  > = new Map();
  private closeReasons: Map<string, CloseReason> = new Map();
  private readonly defaults: ToastDefaults<TData, TCustom>;
  private readonly maxToasts: number;
  private readonly timing: Required<NonNullable<StoreConfig["timing"]>>;

  constructor(config: StoreConfig<TData, TCustom> = {}) {
    this.defaults = this.mergeDefaults(config.defaults ?? {});
    this.maxToasts = config.maxToasts ?? DEFAULT_STORE_CONFIG.maxToasts;
    this.timing = {
      ...DEFAULT_STORE_CONFIG.timing,
      ...(config.timing ?? {}),
    };

    this.timerManager = new TimerManager({
      onAutoclose: (id) => {
        this.dismiss(id, CLOSE_REASON.TIMEOUT);
      },
      onSafetyTimeout: (id) => {
        const toast = this.toasts.get(id);

        if (!toast) {
          return;
        }

        if (toast.status === TOAST_STATUS.ENTERING) {
          this.markEntered(id);
        } else if (toast.status === TOAST_STATUS.EXITING) {
          this.markExited(id);
        }
      },
      onProgressTick: (id, progress) => {
        const toast = this.toasts.get(id);

        if (!toast || toast.paused) {
          return;
        }

        this.patchToast(id, { progress });
        this.notify();
      },
    });
  }

  public subscribe(listener: Subscriber<TData, TCustom>) {
    this.subscribers.add(listener);

    return () => this.subscribers.delete(listener);
  }

  public getToasts() {
    return Array.from(this.toasts.values());
  }

  public add(options: ToastOptions<TData, TCustom>) {
    const toastOptions = this.resolveOptions({
      ...this.defaults,
      ...options,
    });
    const id = toastOptions.id ?? this.generateId();

    const existing = this.toasts.get(id);

    if (existing && existing.status !== TOAST_STATUS.REMOVED) {
      this.update(id, toastOptions);

      return this.createHandle(id);
    }

    const toast = Object.freeze({
      id,
      status: TOAST_STATUS.ENTERING,
      type: toastOptions.type,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      remaining: toastOptions.duration,
      paused: false,
      progress: 0,
      data: toastOptions.data,
      options: toastOptions,
    } satisfies ToastState<TData, TCustom>);

    this.getOrCreateClosePromise(id);
    this.toasts.set(id, toast);

    this.startEnterPhase(id);
    this.notify();
    toastOptions.onOpen?.();

    this.enforceMaxToasts();

    return this.createHandle(id);
  }

  public success(data: TData, options?: ToastMethodOptions<TCustom>) {
    return this.addTypedToast(TOAST_TYPE.SUCCESS, data, options);
  }

  public error(data: TData, options?: ToastMethodOptions<TCustom>) {
    return this.addTypedToast(TOAST_TYPE.ERROR, data, options);
  }

  public warning(data: TData, options?: ToastMethodOptions<TCustom>) {
    return this.addTypedToast(TOAST_TYPE.WARNING, data, options);
  }

  public info(data: TData, options?: ToastMethodOptions<TCustom>) {
    return this.addTypedToast(TOAST_TYPE.INFO, data, options);
  }

  public loading(data: TData, options?: LoadingToastOptions<TCustom>) {
    const baseOptions: LoadingToastOptions<TCustom> = options ?? {};

    return this.addTypedToast(TOAST_TYPE.LOADING, data, {
      ...baseOptions,
      duration: 0,
    });
  }

  public dismiss(
    reference: ToastReference<TData, TCustom>,
    reason: CloseReason = CLOSE_REASON.PROGRAMMATIC,
  ) {
    const id = this.getId(reference);
    const toast = this.toasts.get(id);

    if (!toast) {
      return;
    }

    if (!isActiveToast(toast)) {
      return;
    }

    this.timerManager.clearAutoclose(id);
    this.timerManager.clearSafetyTimeout(id);

    this.patchToast(id, {
      status: TOAST_STATUS.EXITING,
      updatedAt: Date.now(),
    });

    this.closeReasons.set(id, reason);

    this.startExitPhase(id);
    this.notify();
  }

  public dismissAll() {
    for (const [id, toast] of this.toasts) {
      if (isActiveToast(toast)) {
        this.dismiss(id, CLOSE_REASON.PROGRAMMATIC);
      }
    }
  }

  public update(
    reference: ToastReference<TData, TCustom>,
    updates: ToastUpdate<TData, TCustom>,
  ) {
    const id = this.getId(reference);
    const toast = this.toasts.get(id);

    if (!toast) {
      return;
    }

    if (toast.status === TOAST_STATUS.REMOVED) {
      return;
    }

    let patch: Partial<ToastState<TData, TCustom>> = {};

    if (toast.status === TOAST_STATUS.EXITING) {
      patch.status = TOAST_STATUS.VISIBLE;
      patch.remaining = 0;

      this.timerManager.clearSafetyTimeout(id);
      this.closeReasons.delete(id);
    }

    if (updates.data) {
      patch.data = { ...toast.data, ...updates.data };
    }

    if (updates.type) {
      patch.type = updates.type;
    }

    if (updates.duration !== undefined) {
      this.resetTimer(id, updates.duration, patch);
    }

    patch.updatedAt = Date.now();
    patch.options = this.mergeOptions(toast.options, updates);

    this.patchToast(id, patch);
    this.notify();
  }

  public pause(reference: ToastReference<TData, TCustom>) {
    const id = this.getId(reference);
    const toast = this.toasts.get(id);

    if (!toast) {
      return;
    }

    if (toast.paused) {
      return;
    }

    if (toast.status !== TOAST_STATUS.VISIBLE) {
      return;
    }

    const remaining = this.timerManager.getRemainingTime(id);

    this.timerManager.clearAutoclose(id);

    this.patchToast(id, {
      paused: true,
      remaining,
      updatedAt: Date.now(),
    });

    this.notify();
  }

  public resume(reference: ToastReference<TData, TCustom>) {
    const id = this.getId(reference);
    const toast = this.toasts.get(id);

    if (!toast) {
      return;
    }

    if (!toast.paused) {
      return;
    }

    this.patchToast(id, {
      paused: false,
      updatedAt: Date.now(),
    });

    const remaining = toast.remaining;

    if (remaining !== undefined && remaining > 0) {
      this.timerManager.startAutoclose(id, remaining, {
        enabled: toast.options.progress ?? false,
        startValue: toast.progress,
      });
    }

    this.notify();
  }

  public promise<T>(
    promise: Promise<T>,
    opts: ToastPromiseConfig<T, TData>,
    options?: PromiseToastOptions<TCustom>,
  ) {
    const baseOptions: PromiseToastOptions<TCustom> = options ?? {};
    const loadingOptions = this.createTypedOptions(
      TOAST_TYPE.LOADING,
      opts.loading,
      { ...baseOptions, duration: 0 },
    );
    const handle = this.add(loadingOptions);

    promise
      .then((result) => {
        const updates = this.createUpdate(
          TOAST_TYPE.SUCCESS,
          resolvePromiseData(opts.success, result),
          options?.duration ?? this.timing.promiseSuccessDuration,
        );

        this.update(handle, updates);
      })
      .catch((err: unknown) => {
        const updates = this.createUpdate(
          TOAST_TYPE.ERROR,
          resolvePromiseData(opts.error, err),
          options?.duration ?? this.timing.promiseErrorDuration,
        );

        this.update(handle, updates);
      });

    return promise;
  }

  public setAnimationDuration(
    reference: ToastReference<TData, TCustom>,
    phase: ToastPhase,
    durationMs: number,
  ) {
    const id = this.getId(reference);
    const toast = this.toasts.get(id);
    if (!toast) {
      return;
    }

    if (!isPhaseStatus(toast, phase)) {
      return;
    }

    this.startPhaseSafetyTimeout(id, phase, durationMs);
  }

  public markEntered(reference: ToastReference<TData, TCustom>) {
    const id = this.getId(reference);
    const toast = this.toasts.get(id);

    if (!toast || toast.status !== TOAST_STATUS.ENTERING) {
      return;
    }

    this.timerManager.clearSafetyTimeout(id);

    this.patchToast(id, { status: TOAST_STATUS.VISIBLE });

    this.startAutocloseTimer(id);
    this.notify();
  }

  public markExited(reference: ToastReference<TData, TCustom>) {
    const id = this.getId(reference);
    const toast = this.toasts.get(id);

    if (!toast || toast.status !== TOAST_STATUS.EXITING) {
      return;
    }

    this.timerManager.clearSafetyTimeout(id);

    this.removeToast(id);
  }

  public waitForClose(reference: ToastReference<TData, TCustom>) {
    const id = this.getId(reference);
    const toast = this.toasts.get(id);

    if (!toast) {
      return Promise.resolve(CLOSE_REASON.PROGRAMMATIC);
    }

    return this.getOrCreateClosePromise(id).promise;
  }

  public destroy() {
    this.timerManager.destroyAll();
    this.subscribers.clear();
    this.toasts.clear();
    this.closePromises.clear();
    this.closeReasons.clear();
  }

  private generateId() {
    return `toast-${this.nextId++}`;
  }

  private getId(reference: ToastReference<TData, TCustom>) {
    return typeof reference === "string" ? reference : reference.id;
  }

  private patchToast(id: string, patch: Partial<ToastState<TData, TCustom>>) {
    const toast = this.toasts.get(id);

    if (!toast) {
      return;
    }

    this.toasts.set(id, Object.freeze({ ...toast, ...patch }));
  }

  private createHandle(id: string): ToastHandle<TData, TCustom> {
    return {
      id,
      update: (updates) => {
        this.update(id, updates);
      },
      dismiss: (reason) => {
        this.dismiss(id, reason);
      },
      closed: this.waitForClose(id),
    };
  }

  private getOrCreateClosePromise(id: string) {
    const existing = this.closePromises.get(id);

    if (existing) {
      return existing;
    }

    let resolve!: (reason: CloseReason) => void;
    const promise = new Promise<CloseReason>((resolvePromise) => {
      resolve = resolvePromise;
    });

    const entry = { promise, resolve };

    this.closePromises.set(id, entry);

    return entry;
  }

  private notify() {
    const toasts = this.getToasts();

    for (const subscriber of this.subscribers) {
      subscriber(toasts);
    }
  }

  private addTypedToast(
    type: ToastType,
    data: TData,
    options?: ToastMethodOptions<TCustom>,
  ) {
    const baseOptions: ToastMethodOptions<TCustom> = options ?? {};
    const toastOptions = this.createTypedOptions(type, data, baseOptions);

    return this.add(toastOptions);
  }

  private mergeDefaults(
    defaults: ToastDefaults<TData, TCustom>,
  ): ToastDefaults<TData, TCustom> {
    return {
      ...DEFAULT_STORE_CONFIG.defaults,
      ...defaults,
    };
  }

  private createTypedOptions(
    type: ToastType,
    data: TData,
    options: TypedToastOptions<TCustom>,
  ) {
    return {
      ...options,
      type,
      data: normalizeData(data),
    };
  }

  private createUpdate(
    type: ToastType,
    data: Partial<TData> | NormalizedToastData<TData>,
    duration: number,
  ) {
    return {
      type,
      data,
      duration,
    };
  }

  private resolveOptions(
    options: ToastOptions<TData, TCustom>,
  ): ResolvedToastOptions<TData, TCustom> {
    return {
      ...options,
      type:
        options.type ??
        this.defaults.type ??
        DEFAULT_STORE_CONFIG.defaults.type,
      data: normalizeData(options.data),
    };
  }

  private mergeOptions(
    current: ResolvedToastOptions<TData, TCustom>,
    updates: ToastUpdate<TData, TCustom>,
  ): ResolvedToastOptions<TData, TCustom> {
    const data =
      updates.data === undefined
        ? current.data
        : { ...current.data, ...updates.data };

    return {
      ...current,
      ...updates,
      id: updates.id ?? current.id,
      duration: updates.duration ?? current.duration,
      enter: updates.enter ?? current.enter,
      exit: updates.exit ?? current.exit,
      progress: updates.progress ?? current.progress,
      onClose: updates.onClose ?? current.onClose,
      onAutoClose: updates.onAutoClose ?? current.onAutoClose,
      onOpen: updates.onOpen ?? current.onOpen,
      type: updates.type ?? current.type,
      data,
    };
  }

  private startEnterPhase(id: string) {
    this.startPhaseSafetyTimeout(id, TOAST_PHASE.ENTER);
  }

  private startExitPhase(id: string) {
    this.startPhaseSafetyTimeout(id, TOAST_PHASE.EXIT);
  }

  private startPhaseSafetyTimeout(
    id: string,
    phase: ToastPhase,
    durationMs?: number,
  ) {
    const toast = this.toasts.get(id);

    if (!toast) {
      return;
    }

    const resolvedDuration = durationMs ?? getPhaseHintDuration(toast, phase);
    const safetyMs =
      resolvedDuration === undefined
        ? this.timing.animationFallbackMs
        : resolvedDuration + this.timing.animationBufferMs;
    this.timerManager.startSafetyTimeout(id, safetyMs);
  }

  private startAutocloseTimer(id: string) {
    const toast = this.toasts.get(id);

    if (!toast) {
      return;
    }

    const duration = toast.remaining;
    if (duration === undefined || duration === 0) {
      return;
    }

    this.timerManager.startAutoclose(id, duration, {
      enabled: toast.options.progress ?? false,
      startValue: toast.progress,
    });
  }

  private resetTimer(
    id: string,
    newDuration: number,
    patch: Partial<ToastState<TData, TCustom>>,
  ) {
    const toast = this.toasts.get(id);

    if (!toast) {
      return;
    }

    this.timerManager.clearAutoclose(id);

    patch.remaining = newDuration;
    patch.progress = 0;

    if (newDuration === 0) {
      return;
    }

    const isPaused = patch.paused ?? toast.paused;
    if (isPaused) {
      return;
    }

    const status = patch.status ?? toast.status;
    if (status !== TOAST_STATUS.VISIBLE) {
      return;
    }

    this.timerManager.startAutoclose(id, newDuration, {
      enabled: toast.options.progress ?? false,
      startValue: 0,
    });
  }

  private enforceMaxToasts() {
    if (this.maxToasts <= 0) {
      return;
    }

    const activeToasts = this.getToasts().filter(isActiveToast);

    if (activeToasts.length <= this.maxToasts) {
      return;
    }

    const excess = activeToasts.length - this.maxToasts;

    for (let i = 0; i < excess; i++) {
      this.dismiss(activeToasts[i].id, CLOSE_REASON.PROGRAMMATIC);
    }
  }

  private removeToast(id: string) {
    const toast = this.toasts.get(id);

    if (!toast) {
      return;
    }

    const reason = this.closeReasons.get(id) ?? CLOSE_REASON.PROGRAMMATIC;

    this.timerManager.clearAll(id);
    this.closeReasons.delete(id);

    this.toasts.delete(id);

    const closePromise = this.closePromises.get(id);

    if (closePromise) {
      closePromise.resolve(reason);
      this.closePromises.delete(id);
    }

    toast.options.onClose?.(reason);

    if (reason === CLOSE_REASON.TIMEOUT) {
      toast.options.onAutoClose?.();
    }

    this.notify();
  }
}

function createToastStore<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
>(config?: StoreConfig<TData, TCustom>): ToastStore<TData, TCustom> {
  return new Store(config);
}

export { createToastStore };
