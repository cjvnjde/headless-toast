export function mergeObjects<TLeft extends object, TRight extends object>(
  left: TLeft,
  right: TRight,
): TLeft & TRight {
  return {
    ...left,
    ...right,
  };
}
