import { describe, expectTypeOf, it } from "vitest";
import { createToastStore } from "../src";
import { resolveData, resolvePromiseData } from "../src/utils";
import type {
  AnimationConfig,
  CloseReason,
  LoadingToastOptions,
  ResolvedToastOptions,
  StoreConfig,
  ToastHandle,
  ToastMethodOptions,
  ToastOptions,
  ToastPromiseConfig,
  ToastState,
  ToastStore,
  ToastUpdate,
} from "../src";

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
  it("resolves optional toast data without widening required shapes", () => {
    expectTypeOf(
      resolveData<MessageData>({ title: "Hello" }),
    ).toEqualTypeOf<MessageData>();
    expectTypeOf(resolveData<Record<string, unknown>>(undefined)).toMatchTypeOf<
      Record<string, unknown>
    >();
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

    type PromiseOptions = NonNullable<
      Parameters<ToastStore<MessageData, CustomOptions>["promise"]>[2]
    >;

    expectTypeOf<PromiseOptions>().toEqualTypeOf<
      ToastMethodOptions<CustomOptions>
    >();
  });

  it("keeps the store API derived from the store class", () => {
    type DismissReference = Parameters<
      ToastStore<MessageData, CustomOptions>["dismiss"]
    >[0];
    type AddHandle = ReturnType<ToastStore<MessageData, CustomOptions>["add"]>;
    type SubscribeListener = Parameters<
      ToastStore<MessageData, CustomOptions>["subscribe"]
    >[0];

    expectTypeOf<DismissReference>().toEqualTypeOf<string | AddHandle>();
    expectTypeOf<AddHandle>().toEqualTypeOf<
      ToastHandle<MessageData, CustomOptions>
    >();
    expectTypeOf<SubscribeListener>().toMatchTypeOf<
      (toasts: ToastState<MessageData, CustomOptions>[]) => void
    >();
  });

  it("preserves the public store API types", () => {
    const store = createToastStore<MessageData, CustomOptions>({
      defaults: {
        placement: "top-right",
        pauseOnHover: true,
      },
    });

    const handle = store.success(
      { title: "Saved" },
      { placement: "bottom-center", theme: "warm" },
    );

    store.update(handle, {
      data: { body: "Done" },
      pauseOnHover: false,
      theme: "cool",
    });

    expectTypeOf(store).toEqualTypeOf<ToastStore<MessageData, CustomOptions>>();
    expectTypeOf(store.getToasts()[0]).toEqualTypeOf<
      ToastState<MessageData, CustomOptions>
    >();
    expectTypeOf(store.getToasts()[0].options).toEqualTypeOf<
      ResolvedToastOptions<MessageData, CustomOptions>
    >();
    expectTypeOf(handle.closed).toEqualTypeOf<Promise<CloseReason>>();
  });

  it("models promise and update payloads the same way the store consumes them", () => {
    expectTypeOf<StoreConfig<MessageData, CustomOptions>>().toMatchTypeOf<{
      defaults?: Partial<ToastOptions<MessageData, CustomOptions>>;
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

    expectTypeOf(
      resolvePromiseData<string, MessageData>(
        (result) => ({ title: result }),
        "done",
      ),
    ).toEqualTypeOf<MessageData>();

    expectTypeOf<ToastUpdate<MessageData, CustomOptions>>().toMatchTypeOf<{
      data?: Partial<MessageData> | MessageData;
      theme?: "warm" | "cool";
      type?: string;
    }>();
  });
});
