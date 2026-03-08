import { describe, expectTypeOf, it } from "vitest";
import { createToastStore } from "../src";
import { normalizeData, resolvePromiseData } from "../src/utils";
import type {
  AnimationConfig,
  CloseReason,
  LoadingToastOptions,
  NormalizedToastData,
  PromiseToastOptions,
  ResolvedToastOptions,
  StoreConfig,
  ToastDefaults,
  ToastMethodOptions,
  ToastOptions,
  ToastPromiseConfig,
  ToastState,
  ToastStore,
  ToastUpdate,
} from "../src/types";

type MessageData = {
  title: string;
  body?: string;
};

type CustomOptions = {
  placement?: "top-right" | "bottom-center";
  pauseOnHover?: boolean;
  theme?: "warm" | "cool";
  type?: "should-not-leak";
  duration?: "should-not-leak";
};

describe("type ergonomics", () => {
  it("models normalized data for empty and required data shapes", () => {
    expectTypeOf<
      NormalizedToastData<MessageData>
    >().toEqualTypeOf<MessageData>();
    expectTypeOf<NormalizedToastData<Record<string, unknown>>>().toMatchTypeOf<
      Record<string, unknown>
    >();

    const normalized = normalizeData<MessageData>({ title: "Hello" });
    const normalizedEmpty = normalizeData<Record<string, unknown>>(undefined);

    expectTypeOf(normalized).toEqualTypeOf<MessageData>();
    expectTypeOf(normalizedEmpty).toMatchTypeOf<Record<string, unknown>>();
  });

  it("keeps reserved keys out of custom option surfaces", () => {
    expectTypeOf<ToastMethodOptions<CustomOptions>>().toMatchTypeOf<{
      id?: string;
      duration?: number;
      enter?: string | AnimationConfig;
      exit?: string | AnimationConfig;
      progress?: boolean;
      onClose?: (reason: CloseReason) => void;
      onAutoClose?: () => void;
      onOpen?: () => void;
      placement?: "top-right" | "bottom-center";
      pauseOnHover?: boolean;
      theme?: "warm" | "cool";
    }>();

    expectTypeOf<
      keyof LoadingToastOptions<CustomOptions>
    >().not.toEqualTypeOf<"duration">();
  });

  it("separates public options from resolved internal options", () => {
    expectTypeOf<ToastOptions<MessageData, CustomOptions>>().toMatchTypeOf<{
      data: MessageData;
      type?: string;
      placement?: "top-right" | "bottom-center";
    }>();

    expectTypeOf<
      ResolvedToastOptions<MessageData, CustomOptions>
    >().toMatchTypeOf<{
      data: MessageData;
      type: string;
      placement?: "top-right" | "bottom-center";
    }>();
  });

  it("provides ergonomic aliases for store config and promise config", () => {
    expectTypeOf<ToastDefaults<MessageData, CustomOptions>>().toEqualTypeOf<
      Partial<ToastOptions<MessageData, CustomOptions>>
    >();

    expectTypeOf<StoreConfig<MessageData, CustomOptions>>().toMatchTypeOf<{
      defaults?: ToastDefaults<MessageData, CustomOptions>;
      timing?: {
        promiseSuccessDuration?: number;
        promiseErrorDuration?: number;
      };
    }>();

    expectTypeOf<ToastPromiseConfig<string, MessageData>>().toMatchTypeOf<{
      loading: MessageData;
      success: MessageData | ((result: string) => MessageData);
      error: MessageData | ((error: unknown) => MessageData);
    }>();

    expectTypeOf<PromiseToastOptions<CustomOptions>>().toEqualTypeOf<
      ToastMethodOptions<CustomOptions>
    >();
  });

  it("preserves typed store APIs for custom options and updates", () => {
    const store = createToastStore<MessageData, CustomOptions>({
      defaults: {
        placement: "top-right",
        pauseOnHover: true,
      },
    });

    const handle = store.success(
      { title: "Saved" },
      { theme: "warm", placement: "bottom-center" },
    );

    store.update(handle, {
      data: { body: "Done" },
      pauseOnHover: false,
      theme: "cool",
    });

    expectTypeOf(store).toEqualTypeOf<ToastStore<MessageData, CustomOptions>>();
    expectTypeOf(handle.closed).toEqualTypeOf<Promise<CloseReason>>();
    expectTypeOf(store.getToasts()[0]).toEqualTypeOf<
      ToastState<MessageData, CustomOptions>
    >();
    expectTypeOf(store.getToasts()[0].options).toEqualTypeOf<
      ResolvedToastOptions<MessageData, CustomOptions>
    >();
    expectTypeOf(store.getToasts()[0].options.type).toMatchTypeOf<
      ResolvedToastOptions<MessageData, CustomOptions>["type"]
    >();
  });

  it("resolves promise data to normalized toast data", () => {
    const successData = resolvePromiseData<string, MessageData>(
      (result) => ({ title: result }),
      "done",
    );
    const errorData = resolvePromiseData<unknown, Record<string, unknown>>(
      () => ({ message: "fail" }),
      new Error("fail"),
    );

    expectTypeOf(successData).toEqualTypeOf<MessageData>();
    expectTypeOf(errorData).toMatchTypeOf<Record<string, unknown>>();
  });

  it("keeps update payloads partial while allowing normalized promise results", () => {
    expectTypeOf<ToastUpdate<MessageData, CustomOptions>>().toMatchTypeOf<{
      data?: Partial<MessageData> | MessageData;
      theme?: "warm" | "cool";
      type?: string;
    }>();
  });
});
