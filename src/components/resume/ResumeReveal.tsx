"use client";

import { useRef, type ReactNode } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

type ResumeRevealProps = {
  children: ReactNode;
};

export function ResumeReveal({ children }: ResumeRevealProps) {
  const scopeRef = useRef<HTMLDivElement>(null);
  useScrollReveal(scopeRef, { initialY: -24 });

  return (
    <div ref={scopeRef}>
      <div data-scroll-reveal>{children}</div>
    </div>
  );
}
