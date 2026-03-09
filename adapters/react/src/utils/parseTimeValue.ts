export function parseTimeValue(value: string) {
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
