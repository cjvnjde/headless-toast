/**
 * Ambient declarations for globals that may or may not exist at runtime.
 *
 * Core's tsconfig uses `"lib": ["ES2022"]` with no DOM types.
 * These globals are available in browsers and some server runtimes,
 * but not guaranteed — callers must feature-detect before use.
 */

declare function requestAnimationFrame(
  callback: (time: number) => void,
): number;
declare function cancelAnimationFrame(id: number): void;
