import type { AnimationConfig } from "../types.ts";

export function resolveAnimationHintDuration(
  animation: string | AnimationConfig | undefined,
): number | undefined {
  if (!animation) return undefined;
  if (typeof animation === "string") return undefined;
  return animation.duration;
}
