import type { CSSProperties } from "react";
import type { ToastPlacement } from "@headless-toast/core";

const toastBaseStyle: CSSProperties = {
  pointerEvents: "auto",
  position: "relative",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  padding: "12px 16px",
  borderRadius: 8,
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  fontFamily: '"IBM Plex Sans", "Avenir Next", "Segoe UI", sans-serif',
  fontSize: 14,
  lineHeight: 1.4,
  color: "#1a1a1a",
  background: "#fff",
  minWidth: 280,
  maxWidth: 400,
  overflow: "hidden",
  userSelect: "none",
  touchAction: "none",
};

const typeColors: Record<string, string> = {
  success: "#22c55e",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
  loading: "#a855f7",
  custom: "#6b7280",
};

const REPOSITIONABLE_TOAST_WIDTH = 340;
const REPOSITIONABLE_TOAST_HEIGHT = 96;
const REPOSITIONABLE_TOAST_GAP = 12;

const toastSlideVariants = {
  initial: { opacity: 0, y: -30, scale: 0.9 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -30, scale: 0.9 },
};

const toastSlideRightVariants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 },
};

const toastFloatVariants = {
  initial: { opacity: 0, y: -10, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.95 },
};

const PLACEMENT_POSITIONS: Record<
  ToastPlacement,
  { top?: number; bottom?: number; left?: number; right?: number }
> = {
  "top-left": { top: 16, left: 16 },
  "top-center": { top: 16 },
  "top-right": { top: 16, right: 16 },
  "bottom-left": { bottom: 16, left: 16 },
  "bottom-center": { bottom: 16 },
  "bottom-right": { bottom: 16, right: 16 },
};

function stripConflictingHandlers(
  handlers: Record<string, unknown>,
): Record<string, unknown> {
  const {
    onDrag: _a,
    onDragStart: _b,
    onDragEnd: _c,
    onDragOver: _d,
    onDragEnter: _e,
    onDragLeave: _f,
    ...rest
  } = handlers;

  return rest;
}

function getToastStyle(type: string): CSSProperties {
  return {
    ...toastBaseStyle,
    borderLeft: `4px solid ${typeColors[type] ?? typeColors.info}`,
  };
}

function getPlacementFromPosition(
  screenX: number,
  screenY: number,
): ToastPlacement {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const row = screenY < height / 2 ? "top" : "bottom";
  const col =
    screenX < width / 3
      ? "left"
      : screenX > (2 * width) / 3
        ? "right"
        : "center";

  return `${row}-${col}` as ToastPlacement;
}

function getPositionStyle(
  placement: ToastPlacement,
  stackIndex = 0,
): { x: number; y: number } {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const position = PLACEMENT_POSITIONS[placement];
  const stackOffset =
    stackIndex * (REPOSITIONABLE_TOAST_HEIGHT + REPOSITIONABLE_TOAST_GAP);

  let x = 0;

  if (position.left !== undefined) x = position.left;
  else if (position.right !== undefined) {
    x = width - position.right - REPOSITIONABLE_TOAST_WIDTH;
  } else {
    x = (width - REPOSITIONABLE_TOAST_WIDTH) / 2;
  }

  const y =
    position.top !== undefined
      ? position.top + stackOffset
      : height -
        (position.bottom ?? 0) -
        REPOSITIONABLE_TOAST_HEIGHT -
        stackOffset;

  return { x, y };
}

function PlacementZoneOverlay({ activeZone }: { activeZone: ToastPlacement }) {
  const zones: ToastPlacement[] = [
    "top-left",
    "top-center",
    "top-right",
    "bottom-left",
    "bottom-center",
    "bottom-right",
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gridTemplateRows: "1fr 1fr",
        pointerEvents: "none",
      }}
    >
      {zones.map((zone) => (
        <div
          key={zone}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px dashed",
            borderColor: zone === activeZone ? "#3b82f6" : "#e5e7eb",
            backgroundColor:
              zone === activeZone ? "rgba(59, 130, 246, 0.06)" : "transparent",
            transition: "all 150ms ease",
            margin: 4,
            borderRadius: 12,
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: zone === activeZone ? "#3b82f6" : "#d1d5db",
              transition: "color 150ms ease",
            }}
          >
            {zone}
          </span>
        </div>
      ))}
    </div>
  );
}

export {
  PlacementZoneOverlay,
  REPOSITIONABLE_TOAST_GAP,
  REPOSITIONABLE_TOAST_HEIGHT,
  REPOSITIONABLE_TOAST_WIDTH,
  getPlacementFromPosition,
  getPositionStyle,
  getToastStyle,
  stripConflictingHandlers,
  toastBaseStyle,
  toastFloatVariants,
  toastSlideRightVariants,
  toastSlideVariants,
  typeColors,
};
