import type { ToastCustomOptions, ToastData } from "@headless-toast/core";
import { createToastStore } from "@headless-toast/core";
import type { AdapterToastOptions, AdapterStoreConfig } from "./types";

function createToast<
  TData extends ToastData = ToastData,
  TCustom extends ToastCustomOptions = {},
>(config?: AdapterStoreConfig<TData, TCustom>) {
  const toast = createToastStore<TData, TCustom & AdapterToastOptions>(config);

  return { toast };
}

const { toast } = createToast();

export { toast, createToast };
