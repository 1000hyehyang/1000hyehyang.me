"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { LinkPreview } from "@/components/common/LinkPreview";
import { CopyCodeButton } from "@/components/common/CopyCodeButton";

function decodeEncodedCode(encoded: string): string {
  return decodeURIComponent(escape(atob(encoded)));
}

/**
 * `.link-preview-wrapper`, `.copy-code-button` 플레이스홀더에
 * `markdownToHtml` 이 넣은 마크업을 React 위젯으로 하이드레이션합니다.
 * 언마운트 시 `createRoot` 인스턴스를 정리합니다.
 *
 * @param container 본문을 감싼 DOM 노드(보통 `markdown-body` 부모). `null`이면 스킵.
 */
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
      rootsRef.current.forEach((root) => {
        try {
          root.unmount();
        } catch {
          /* noop */
        }
      });
      rootsRef.current = [];
    };
  }, [container]);
}

/**
 * 본문 래퍼에 넘길 ref 콜백 + 내부에서 하이드레이션까지 처리.
 * `motion.div` 등에 `ref={setMarkdownContainer}` 형태로 연결합니다.
 */
export function useMarkdownBodyHydration(): (node: HTMLElement | null) => void {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  useHydrateMarkdownWidgets(container);
  return useCallback((node: HTMLElement | null) => {
    setContainer(node);
  }, []);
}
