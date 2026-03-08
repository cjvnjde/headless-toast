import { useToastAnimation } from "./useToastAnimation";
import type { CSSProperties, ReactNode, PointerEvent } from "react";

type AnimationWrapperProps = {
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
  swipeDismissed?: boolean;
  onPointerDown?: (e: PointerEvent) => void;
  onPointerMove?: (e: PointerEvent) => void;
  onPointerUp?: (e: PointerEvent) => void;
  onPointerCancel?: (e: PointerEvent) => void;
  onLostPointerCapture?: (e: PointerEvent) => void;
};

function AnimationWrapper({
  className: extraClassName,
  children,
  style,
  swipeDismissed,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onLostPointerCapture,
}: AnimationWrapperProps) {
  const { ref, className, attributes, handlers } = useToastAnimation({
    className: extraClassName,
    swipeDismissed,
  });

  return (
    <div
      ref={ref}
      className={className}
      style={style}
      onAnimationEnd={handlers.onAnimationEnd}
      onTransitionEnd={handlers.onTransitionEnd}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onLostPointerCapture={onLostPointerCapture}
      {...attributes}
    >
      {children}
    </div>
  );
}

export { AnimationWrapper };
export type { AnimationWrapperProps };
