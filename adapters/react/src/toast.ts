import type { ToastCustomOptions, ToastData } from "@headless-toast/core";
import { createToastStore } from "@headless-toast/core";
import type {
  AdapterToastOptions,
  AdapterStoreConfig,
  ReactToastStore,
} from "./types";

function createToastApi<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
>(store: ReactToastStore<TData, TCustom>) {
  return store;
}

function createToast<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
>(config?: AdapterStoreConfig<TData, TCustom>) {
  const store = createToastStore<TData, TCustom & AdapterToastOptions>(config);
  const toast = createToastApi(store);

  return { store, toast };
}

const { store: defaultStore, toast } = createToast();

export { defaultStore, toast, createToastApi, createToast };
