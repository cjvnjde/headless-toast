function parseTimeValue(value: string) {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return 0;
  }

  const parsed = Number.parseFloat(trimmed);
  if (Number.isNaN(parsed)) {
    return 0;
  }

  if (trimmed.endsWith("ms")) {
    return parsed;
  }

  return parsed * 1000;
}

function getLongestTimeline(durationList: string, delayList: string) {
  const durations = durationList.split(",").map(parseTimeValue);
  const delays = delayList.split(",").map(parseTimeValue);
  const count = Math.max(durations.length, delays.length);

  let longest = 0;

  for (let index = 0; index < count; index += 1) {
    const duration = durations[index] ?? durations[durations.length - 1] ?? 0;
    const delay = delays[index] ?? delays[delays.length - 1] ?? 0;
    longest = Math.max(longest, duration + delay);
  }

  return longest;
}

function getAnimationDuration(element: HTMLElement) {
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

export { getAnimationDuration };
