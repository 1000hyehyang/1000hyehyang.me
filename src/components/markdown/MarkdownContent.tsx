"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CopyCodeButton } from "@/components/common/CopyCodeButton";
import type { SanitizedMarkdownHtml } from "@/lib/markdown/types";

type MarkdownContentProps = {
  html: SanitizedMarkdownHtml;
};

type CodeCopyTarget = {
  mountPoint: HTMLElement;
  code: string;
};

function findCodeCopyTargets(container: HTMLElement): CodeCopyTarget[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(".copy-code-button"),
  ).flatMap((mountPoint) => {
    const code = mountPoint
      .closest(".code-block-wrapper")
      ?.querySelector("pre code")?.textContent;

    return code === undefined || code === null ? [] : [{ mountPoint, code }];
  });
}

/** The only UI boundary allowed to inject sanitized portfolio markdown. */
export function MarkdownContent({ html }: MarkdownContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copyTargets, setCopyTargets] = useState<CodeCopyTarget[]>([]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    setCopyTargets(container ? findCodeCopyTargets(container) : []);
  }, [html]);

  return (
    <>
      <div
        ref={containerRef}
        className="markdown-body"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {copyTargets.map(({ mountPoint, code }, index) =>
        createPortal(
          <CopyCodeButton code={code} />,
          mountPoint,
          `code-copy-${index}`,
        ),
      )}
    </>
  );
}
