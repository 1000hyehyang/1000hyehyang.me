"use client";

import { useRef, type ReactNode } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

type ResumeRevealProps = {
  children: ReactNode;
};

export function ResumeReveal({ children }: ResumeRevealProps) {
  const scopeRef = useRef<HTMLDivElement>(null);
  useScrollReveal(scopeRef);

  return (
    <div ref={scopeRef} className="w-full pb-8 pt-8 sm:pt-12 lg:pt-16">
      {children}
    </div>
  );
}
