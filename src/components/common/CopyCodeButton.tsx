"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type CopyCodeButtonProps = {
  code: string;
  className?: string;
};

export function CopyCodeButton({ code, className = "" }: CopyCodeButtonProps) {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("복사 실패:", error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "cursor-pointer rounded-md bg-muted/80 p-2 text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground",
        className,
      )}
      title={copied ? "복사됨!" : "코드 복사"}
      aria-label={copied ? "복사됨!" : "코드 복사"}
    >
      {copied ? (
        <Check className="h-4 w-4 text-brand-pale" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );
}
