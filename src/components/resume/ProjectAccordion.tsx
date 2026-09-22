"use client";

import { useId, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Layers3 } from "lucide-react";

export function ProjectAccordion({ title, context, children }: { title: string; context?: string; children: ReactNode }) {
  const [open, setOpen] = useState(true);
  const id = useId();
  const reduceMotion = useReducedMotion();

  return (
    <div className="mt-6 overflow-hidden rounded-2xl bg-muted/20">
      <button
        data-scroll-reveal
        id={`${id}-trigger`}
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-content`}
        onClick={() => setOpen(!open)}
        className="flex min-h-16 w-full cursor-pointer items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-5"
      >
        <Layers3 className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">{title}</span>
          {context ? <span className="mt-1 block text-xs text-muted-foreground">{context}</span> : null}
        </span>
        <motion.span initial={false} animate={{ rotate: open ? 180 : 0 }} transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 280, damping: 18 }} aria-hidden="true">
          <ChevronDown className="size-4 text-muted-foreground" />
        </motion.span>
      </button>
      <motion.div
        id={`${id}-content`}
        role="region"
        aria-labelledby={`${id}-trigger`}
        aria-hidden={!open}
        inert={!open}
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={reduceMotion ? { duration: 0 } : {
          height: { type: "spring", duration: 0.58, bounce: 0.32 },
          opacity: { duration: 0.18 },
        }}
        className="overflow-hidden"
      >
        <div className="px-4 sm:px-5">{children}</div>
      </motion.div>
    </div>
  );
}
