"use client";

import { useLayoutEffect, type RefObject } from "react";

type UseScrollRevealOptions = {
  selector?: string;
  initialY?: number;
  stagger?: number;
};

export function useScrollReveal(
  scopeRef: RefObject<HTMLElement | null>,
  {
    selector = "[data-scroll-reveal]",
    initialY = 28,
    stagger = 0,
  }: UseScrollRevealOptions = {},
): void {
  useLayoutEffect(() => {
    const scope = scopeRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!scope || reducedMotion.matches) return;

    const targets = Array.from(scope.querySelectorAll<HTMLElement>(selector));
    const pending = new Map(
      targets.map((element) => [element, {
        opacity: element.style.opacity,
        priority: element.style.getPropertyPriority("opacity"),
      }]),
    );
    const animations = new Map<HTMLElement, Animation>();
    const hiddenFrame = {
      opacity: 0,
      transform: `translateY(${initialY}px)`,
    } as const;

    targets.forEach((element) => { element.style.opacity = "0"; });

    const show = (target: HTMLElement) => {
      const original = pending.get(target);
      if (!original) return false;
      target.style.setProperty("opacity", original.opacity, original.priority);
      pending.delete(target);
      observer.unobserve(target);
      return true;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) =>
          entry.isIntersecting && pending.has(entry.target as HTMLElement),
        );
        visible.forEach((entry, index) => {
          const target = entry.target as HTMLElement;
          if (!show(target)) return;

          const animation = target.animate(
            [hiddenFrame, { opacity: 1, transform: "translateY(0)" }],
            {
              duration: 720,
              delay: Math.min(index * stagger, 280),
              easing: "cubic-bezier(0.165, 0.84, 0.44, 1)",
              fill: "backwards",
            },
          );
          animations.set(target, animation);
          animation.onfinish = () => {
            animation.cancel();
            animations.delete(target);
          };
        });
      },
      { rootMargin: "0px 0px -12%" },
    );

    targets.forEach((element) => observer.observe(element));

    const handleFocus = (event: FocusEvent) => {
      const target = event.target instanceof Element
        ? event.target.closest<HTMLElement>(selector)
        : null;
      if (!target || !scope.contains(target)) return;
      show(target);
      animations.get(target)?.cancel();
      animations.delete(target);
    };
    scope.addEventListener("focusin", handleFocus);

    const stop = () => {
      scope.removeEventListener("focusin", handleFocus);
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
      animations.clear();
      pending.forEach((_, element) => show(element));
    };
    const handleMotionChange = () => { if (reducedMotion.matches) stop(); };
    reducedMotion.addEventListener("change", handleMotionChange);

    return () => {
      reducedMotion.removeEventListener("change", handleMotionChange);
      stop();
    };
  }, [scopeRef, selector, initialY, stagger]);
}
