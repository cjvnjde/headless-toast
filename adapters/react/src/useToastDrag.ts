import {
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type RefObject,
} from "react";
import { CLOSE_REASON, computeDragState } from "@headless-toast/core";
import { resolveDraggableConfig } from "./drag";
import { useToastActions } from "./useToastActions";
import { useToastSelector } from "./useToastSelector";

function useToastDrag(elementRef?: RefObject<HTMLElement | null>) {
  const draggable = useToastSelector((toast) => toast.options.draggable);
  const { dismiss, pause, resume } = useToastActions();
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDismissed, setSwipeDismissed] = useState(false);
  const [styleOffset, setStyleOffset] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const isDraggingRef = useRef(false);
  const swipeDismissedRef = useRef(false);
  const offsetRef = useRef({ x: 0, y: 0 });
  const startPositionRef = useRef({ x: 0, y: 0 });
  const lastPositionRef = useRef({ x: 0, y: 0 });
  const lastTimeRef = useRef(0);
  const pointerIdRef = useRef<number | null>(null);

  const config = resolveDraggableConfig(draggable);

  const applyOffset = (offset: { x: number; y: number }) => {
    offsetRef.current = offset;

    const element = elementRef?.current;

    if (element) {
      const { x, y } = offset;

      element.style.transform =
        x === 0 && y === 0 ? "" : `translate(${x}px, ${y}px)`;
      element.style.transition = isDraggingRef.current ? "none" : "";
      element.style.cursor = isDraggingRef.current ? "grabbing" : "";
      return;
    }

    setStyleOffset({ ...offset });
  };

  const stopDragging = (shouldResume: boolean) => {
    if (!isDraggingRef.current) {
      return;
    }

    isDraggingRef.current = false;
    pointerIdRef.current = null;
    setIsDragging(false);

    if (!swipeDismissedRef.current) {
      offsetRef.current = { x: 0, y: 0 };

      const element = elementRef?.current;

      if (element) {
        element.style.transition = "transform 200ms ease-out";
        element.style.transform = "";
        element.style.cursor = "";
      } else {
        setStyleOffset(null);
      }
    }

    if (shouldResume) {
      resume();
    }
  };

  const onPointerDown = (event: PointerEvent) => {
    if (!config) {
      return;
    }

    if (pointerIdRef.current !== null) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    pointerIdRef.current = event.pointerId;
    startPositionRef.current = { x: event.clientX, y: event.clientY };
    lastPositionRef.current = { x: event.clientX, y: event.clientY };
    lastTimeRef.current = Date.now();
    isDraggingRef.current = true;
    swipeDismissedRef.current = false;
    offsetRef.current = { x: 0, y: 0 };
    setIsDragging(true);
    setSwipeDismissed(false);
    setStyleOffset(null);

    pause();
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!config || !isDraggingRef.current) {
      return;
    }

    if (pointerIdRef.current !== event.pointerId) {
      return;
    }

    const now = Date.now();
    const deltaTime = Math.max(now - lastTimeRef.current, 1);

    const dx = event.clientX - startPositionRef.current.x;
    const dy = event.clientY - startPositionRef.current.y;
    const vx = (event.clientX - lastPositionRef.current.x) / deltaTime;
    const vy = (event.clientY - lastPositionRef.current.y) / deltaTime;

    lastPositionRef.current = { x: event.clientX, y: event.clientY };
    lastTimeRef.current = now;

    const dragState = computeDragState(config, { dx, dy, vx, vy });

    applyOffset({ x: dragState.offsetX, y: dragState.offsetY });

    if (!dragState.dismissed) {
      return;
    }

    isDraggingRef.current = false;
    pointerIdRef.current = null;
    swipeDismissedRef.current = true;
    setIsDragging(false);
    setSwipeDismissed(true);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dismiss(CLOSE_REASON.SWIPE);
  };

  const onPointerUp = (event: PointerEvent) => {
    if (pointerIdRef.current !== event.pointerId) {
      return;
    }

    stopDragging(true);
  };

  const onPointerCancel = (event: PointerEvent) => {
    if (pointerIdRef.current !== event.pointerId) {
      return;
    }

    stopDragging(true);
  };

  const onLostPointerCapture = (event: PointerEvent) => {
    if (pointerIdRef.current !== event.pointerId) {
      return;
    }

    stopDragging(true);
  };

  let style: CSSProperties;

  if (swipeDismissed) {
    const { x, y } = offsetRef.current;

    style = {
      transform: `translate(${x}px, ${y}px)`,
      transition: "none",
    };
  } else if (styleOffset && isDragging) {
    style = {
      transform: `translate(${styleOffset.x}px, ${styleOffset.y}px)`,
      transition: "none",
      cursor: "grabbing",
    };
  } else {
    style = {};
  }

  return {
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onLostPointerCapture,
    },
    style,
    isDragging,
    swipeDismissed,
  };
}

export { useToastDrag };
