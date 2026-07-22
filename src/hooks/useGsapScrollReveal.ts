"use client";

import { useLayoutEffect, type RefObject } from "react";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type UseGsapScrollRevealOptions = {
  scrollerRef?: RefObject<HTMLElement | null>;
  scrollerMediaQuery?: string;
  selector?: string;
  initialY?: number;
};

export function useGsapScrollReveal(
  scopeRef: RefObject<HTMLElement | null>,
  {
    scrollerRef,
    scrollerMediaQuery,
    selector = "[data-scroll-reveal]",
    initialY = 28,
  }: UseGsapScrollRevealOptions = {},
): void {
  const shouldReduceMotion = Boolean(useReducedMotion());

  useLayoutEffect(() => {
    const scope = scopeRef.current;
    if (!scope || shouldReduceMotion) return;

    gsap.registerPlugin(ScrollTrigger);
    const mediaQuery = scrollerMediaQuery
      ? window.matchMedia(scrollerMediaQuery)
      : null;
    let context: ReturnType<typeof gsap.context> | undefined;

    const createAnimations = () => {
      context?.revert();

      const scroller =
        !mediaQuery || mediaQuery.matches ? scrollerRef?.current : undefined;

      context = gsap.context(() => {
        const targets = gsap.utils.toArray<HTMLElement>(selector, scope);

        targets.forEach((target) => {
          gsap.fromTo(
            target,
            { autoAlpha: 0, y: initialY },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.72,
              ease: "power3.out",
              clearProps: "opacity,transform,visibility",
              scrollTrigger: {
                trigger: target,
                start: "top 88%",
                once: true,
                ...(scroller ? { scroller } : {}),
              },
            },
          );
        });
      }, scope);

      ScrollTrigger.refresh();
    };

    createAnimations();
    mediaQuery?.addEventListener("change", createAnimations);

    return () => {
      mediaQuery?.removeEventListener("change", createAnimations);
      context?.revert();
    };
  }, [
    scopeRef,
    scrollerMediaQuery,
    scrollerRef,
    selector,
    initialY,
    shouldReduceMotion,
  ]);
}
