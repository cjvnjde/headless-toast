import { parseTimeValue } from "./parseTimeValue";

export function getLongestTimeline(durationList: string, delayList: string) {
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
