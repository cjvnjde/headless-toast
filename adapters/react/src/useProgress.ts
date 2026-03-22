import { useToastSelector } from "./useToastSelector";

function useProgress() {
  return useToastSelector((toast) => toast.progress);
}

export { useProgress };
