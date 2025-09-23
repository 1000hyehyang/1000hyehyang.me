"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyCodeButtonProps {
  code: string;
  className?: string;
}

export const CopyCodeButton = ({ code, className = "" }: CopyCodeButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("복사 실패:", error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`absolute top-3 right-3 p-2 rounded-md bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer ${className}`}
      title={copied ? "복사됨!" : "코드 복사"}
      aria-label={copied ? "복사됨!" : "코드 복사"}
    >
      {copied ? (
        <Check className="w-4 h-4 text-orange-200" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  );
};
