"use client";

import { useLayoutEffect, type RefObject } from "react";
import { useReducedMotion } from "framer-motion";

type UseScrollRevealOptions = {
  selector?: string;
  initialY?: number;
};

function restoreStyle(element: HTMLElement, style: string | null) {
  if (style === null) element.removeAttribute("style");
  else element.setAttribute("style", style);
}

export function useScrollReveal(
  scopeRef: RefObject<HTMLElement | null>,
  {
    selector = "[data-scroll-reveal]",
    initialY = 28,
  }: UseScrollRevealOptions = {},
): void {
  const shouldReduceMotion = Boolean(useReducedMotion());

  useLayoutEffect(() => {
    const scope = scopeRef.current;
    if (!scope || shouldReduceMotion) return;

    const targets = Array.from(scope.querySelectorAll<HTMLElement>(selector));
    const originalStyles = new Map(
      targets.map((element) => [element, element.getAttribute("style")]),
    );
    const animations: Animation[] = [];
    const hiddenFrame = {
      opacity: 0,
      transform: `translateY(${initialY}px)`,
      visibility: "hidden",
    } as const;

    targets.forEach((element) => Object.assign(element.style, hiddenFrame));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const target = entry.target as HTMLElement;
          const originalStyle = originalStyles.get(target);
          if (originalStyle === undefined) return;

          restoreStyle(target, originalStyle);
          animations.push(
            target.animate(
              [hiddenFrame, { opacity: 1, transform: "translateY(0)" }],
              {
                duration: 720,
                easing: "cubic-bezier(0.165, 0.84, 0.44, 1)",
              },
            ),
          );
          observer.unobserve(target);
        });
      },
      { rootMargin: "0px 0px -12%" },
    );

    targets.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
      targets.forEach((element) =>
        restoreStyle(element, originalStyles.get(element) ?? null),
      );
    };
  }, [scopeRef, selector, initialY, shouldReduceMotion]);
}
