"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { LinkPreview } from "@/components/common/LinkPreview";
import { CopyCodeButton } from "@/components/common/CopyCodeButton";

function decodeEncodedCode(encoded: string): string {
  return decodeURIComponent(escape(atob(encoded)));
}

export function useHydrateMarkdownWidgets(container: HTMLElement | null): void {
  const rootsRef = useRef<Root[]>([]);

  useLayoutEffect(() => {
    if (!container) return;

    const roots: Root[] = [];

    container.querySelectorAll(".link-preview-wrapper").forEach((node) => {
      const el = node as HTMLElement;
      const url = el.getAttribute("data-url");
      const linkText = el.getAttribute("data-link-text");
      if (!url || el.hasAttribute("data-rendered")) return;

      const root = createRoot(el);
      root.render(<LinkPreview url={url}>{linkText}</LinkPreview>);
      el.setAttribute("data-rendered", "true");
      roots.push(root);
    });

    container.querySelectorAll(".copy-code-button").forEach((node) => {
      const el = node as HTMLElement;
      const encoded = el.getAttribute("data-code-encoded");
      if (!encoded || el.hasAttribute("data-rendered")) return;

      try {
        const code = decodeEncodedCode(encoded);
        const root = createRoot(el);
        root.render(<CopyCodeButton code={code} />);
        el.setAttribute("data-rendered", "true");
        roots.push(root);
      } catch (error) {
        console.error("코드 디코딩 실패:", error);
      }
    });

    rootsRef.current = roots;

    return () => {
      const pending = rootsRef.current.slice();
      rootsRef.current = [];
      queueMicrotask(() => {
        for (const root of pending) {
          try {
            root.unmount();
          } catch {
            /* ignore */
          }
        }
      });
    };
  }, [container]);
}

export function useMarkdownBodyHydration(): (node: HTMLElement | null) => void {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  useHydrateMarkdownWidgets(container);
  return useCallback((node: HTMLElement | null) => {
    setContainer(node);
  }, []);
}
