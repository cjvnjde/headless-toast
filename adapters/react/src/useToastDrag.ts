import {
  useState,
  useRef,
  type PointerEvent,
  type CSSProperties,
  type RefObject,
} from "react";
import { CLOSE_REASON, computeDragState } from "@headless-toast/core";
import { resolveDraggableConfig } from "./drag";
import { useToast } from "./useToast";

function useToastDrag(elementRef?: RefObject<HTMLElement | null>) {
  const { toast, pause, resume, dismiss } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDismissed, setSwipeDismissed] = useState(false);
  const [styleOffset, setStyleOffset] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const isDraggingRef = useRef(false);
  const swipeDismissedRef = useRef(false);
  const offsetRef = useRef({ x: 0, y: 0 });

  const startPos = useRef({ x: 0, y: 0 });
  const lastPos = useRef({ x: 0, y: 0 });
  const lastTime = useRef(0);
  const pointerIdRef = useRef<number | null>(null);

  const config = resolveDraggableConfig(toast.options.draggable);

  const applyOffset = (offset: { x: number; y: number }) => {
    offsetRef.current = offset;

    const el = elementRef?.current;

    if (el) {
      const { x, y } = offset;

      el.style.transform =
        x === 0 && y === 0 ? "" : `translate(${x}px, ${y}px)`;
      el.style.transition = isDraggingRef.current ? "none" : "";
      el.style.cursor = isDraggingRef.current ? "grabbing" : "";
    } else {
      setStyleOffset({ ...offset });
    }
  };

  const stopDragging = (shouldResume: boolean) => {
    if (!isDraggingRef.current) return;

    isDraggingRef.current = false;
    pointerIdRef.current = null;
    setIsDragging(false);

    if (!swipeDismissedRef.current) {
      offsetRef.current = { x: 0, y: 0 };

      const el = elementRef?.current;

      if (el) {
        el.style.transition = "transform 200ms ease-out";
        el.style.transform = "";
        el.style.cursor = "";
      } else {
        setStyleOffset(null);
      }
    }

    if (shouldResume) {
      resume();
    }
  };

  const onPointerDown = (e: PointerEvent) => {
    if (!config) {
      return;
    }

    if (pointerIdRef.current !== null) {
      return;
    }

    e.currentTarget.setPointerCapture(e.pointerId);
    pointerIdRef.current = e.pointerId;
    startPos.current = { x: e.clientX, y: e.clientY };
    lastPos.current = { x: e.clientX, y: e.clientY };
    lastTime.current = Date.now();
    isDraggingRef.current = true;
    swipeDismissedRef.current = false;
    offsetRef.current = { x: 0, y: 0 };
    setIsDragging(true);
    setSwipeDismissed(false);
    setStyleOffset(null);

    pause();
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!config || !isDraggingRef.current) {
      return;
    }

    if (pointerIdRef.current !== e.pointerId) {
      return;
    }

    const now = Date.now();
    const dt = Math.max(now - lastTime.current, 1);

    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    const vx = (e.clientX - lastPos.current.x) / dt;
    const vy = (e.clientY - lastPos.current.y) / dt;

    lastPos.current = { x: e.clientX, y: e.clientY };
    lastTime.current = now;

    const dragState = computeDragState(config, { dx, dy, vx, vy });

    applyOffset({ x: dragState.offsetX, y: dragState.offsetY });

    if (dragState.dismissed) {
      isDraggingRef.current = false;
      pointerIdRef.current = null;
      swipeDismissedRef.current = true;
      setIsDragging(false);
      setSwipeDismissed(true);

      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }

      dismiss(CLOSE_REASON.SWIPE);
    }
  };

  const onPointerUp = (e: PointerEvent) => {
    if (pointerIdRef.current !== e.pointerId) {
      return;
    }

    stopDragging(true);
  };

  const onPointerCancel = (e: PointerEvent) => {
    if (pointerIdRef.current !== e.pointerId) {
      return;
    }

    stopDragging(true);
  };

  const onLostPointerCapture = (e: PointerEvent) => {
    if (pointerIdRef.current !== e.pointerId) {
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
