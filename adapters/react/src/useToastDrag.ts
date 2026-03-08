import {
  useState,
  useRef,
  useCallback,
  type PointerEvent,
  type CSSProperties,
} from "react";
import { computeDragState } from "@headless-toast/core";
import { resolveDraggableConfig } from "./drag";
import { useToast } from "./useToast";

function useToastDrag() {
  const { toast, store } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const [swipeDismissed, setSwipeDismissed] = useState(false);

  const isDraggingRef = useRef(false);

  const startPos = useRef({ x: 0, y: 0 });
  const lastPos = useRef({ x: 0, y: 0 });
  const lastTime = useRef(0);
  const pointerIdRef = useRef<number | null>(null);

  const config = resolveDraggableConfig(toast.options.draggable);

  const stopDragging = useCallback(
    (shouldResume: boolean) => {
      if (!isDraggingRef.current) return;

      isDraggingRef.current = false;
      pointerIdRef.current = null;
      setIsDragging(false);

      if (!swipeDismissed) {
        setOffset({ x: 0, y: 0 });
      }

      if (shouldResume) {
        store.resume(toast.id);
      }
    },
    [store, swipeDismissed, toast.id],
  );

  const onPointerDown = useCallback(
    (e: PointerEvent) => {
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
      setIsDragging(true);
      setSwipeDismissed(false);

      store.pause(toast.id);
    },
    [config, store, toast.id],
  );

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
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

      setOffset({ x: dragState.offsetX, y: dragState.offsetY });

      if (dragState.dismissed) {
        isDraggingRef.current = false;
        pointerIdRef.current = null;
        setIsDragging(false);
        setSwipeDismissed(true);

        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }

        store.dismiss(toast.id, "swipe");
      }
    },
    [config, store, toast.id],
  );

  const onPointerUp = useCallback(
    (e: PointerEvent) => {
      if (pointerIdRef.current !== e.pointerId) {
        return;
      }

      stopDragging(true);
    },
    [stopDragging],
  );

  const onPointerCancel = useCallback(
    (e: PointerEvent) => {
      if (pointerIdRef.current !== e.pointerId) {
        return;
      }

      stopDragging(true);
    },
    [stopDragging],
  );

  const onLostPointerCapture = useCallback(
    (e: PointerEvent) => {
      if (pointerIdRef.current !== e.pointerId) {
        return;
      }

      stopDragging(true);
    },
    [stopDragging],
  );

  let style: CSSProperties;

  if (swipeDismissed) {
    style = {
      transform: `translate(${offset.x}px, ${offset.y}px)`,
      transition: "none",
    };
  } else if (isDragging || offset.x !== 0 || offset.y !== 0) {
    style = {
      transform: `translate(${offset.x}px, ${offset.y}px)`,
      transition: isDragging ? "none" : "transform 200ms ease-out",
      cursor: isDragging ? "grabbing" : undefined,
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
