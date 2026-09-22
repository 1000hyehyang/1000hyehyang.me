"use client";

import { useRef, type ComponentPropsWithoutRef } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function RevealContent({ children, ...props }: ComponentPropsWithoutRef<"div">) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollReveal(ref, { selector: "[data-content-reveal], .markdown-body > *" });

  return <div {...props} ref={ref}>{children}</div>;
}
