"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";

const TRANSITION_CLASS_NAME = "theme-circle-transition";

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => {
    finished: Promise<void>;
  };
};

export function useThemeCircleTransition() {
  const { resolvedTheme, setTheme } = useTheme();
  const shouldReduceMotion = Boolean(useReducedMotion());
  const transitionInProgressRef = useRef(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    return () => {
      document.documentElement.classList.remove(TRANSITION_CLASS_NAME);
    };
  }, []);

  const isDark = resolvedTheme === "dark";

  const toggleTheme = useCallback(() => {
    if (transitionInProgressRef.current) {
      return;
    }

    const nextTheme = isDark ? "light" : "dark";
    const viewTransitionDocument = document as ViewTransitionDocument;

    if (shouldReduceMotion || !viewTransitionDocument.startViewTransition) {
      setTheme(nextTheme);
      return;
    }

    transitionInProgressRef.current = true;
    setIsTransitioning(true);
    document.documentElement.classList.add(TRANSITION_CLASS_NAME);

    const finishTransition = () => {
      transitionInProgressRef.current = false;
      setIsTransitioning(false);
      document.documentElement.classList.remove(TRANSITION_CLASS_NAME);
    };

    try {
      const transition = viewTransitionDocument.startViewTransition(() => {
        setTheme(nextTheme);
      });

      void transition.finished.catch(() => undefined).finally(finishTransition);
    } catch {
      finishTransition();
      setTheme(nextTheme);
    }
  }, [isDark, setTheme, shouldReduceMotion]);

  return {
    isDark,
    isMounted,
    isTransitioning,
    shouldReduceMotion,
    toggleTheme,
  };
}
