import { getLongestTimeline } from "./getLongestTimeline";

export function getAnimationDuration(element: HTMLElement) {
  const animations = element.getAnimations?.() ?? [];

  if (animations.length > 0) {
    const endTimes = animations.flatMap((animation) => {
      const timing = animation.effect?.getComputedTiming();

      return typeof timing?.endTime === "number" ? [timing.endTime] : [];
    });

    if (endTimes.length > 0) {
      return Math.max(...endTimes);
    }

    return 0;
  }

  const style = getComputedStyle(element);
  const animationDuration = getLongestTimeline(
    style.animationDuration,
    style.animationDelay,
  );
  const transitionDuration = getLongestTimeline(
    style.transitionDuration,
    style.transitionDelay,
  );

  return Math.max(animationDuration, transitionDuration);
}
