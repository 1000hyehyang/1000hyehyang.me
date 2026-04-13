"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import Image from "next/image";

interface LinkMetadata {
  url: string;
  origin: string;
  siteName?: string;
  title?: string;
  description?: string;
  favicon?: string;
  image?: string;
}

interface LinkPreviewProps {
  url: string;
  children?: React.ReactNode;
}

export const LinkPreview = ({ url, children }: LinkPreviewProps) => {
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [faviconError, setFaviconError] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!url) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/link-metadata?url=${encodeURIComponent(url)}`);

        if (!response.ok) {
          throw new Error("메타데이터를 가져올 수 없습니다.");
        }

        const data = await response.json();
        setMetadata(data);
        setFaviconError(false);
        setThumbnailError(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, [url]);

  if (isLoading) {
    return (
      <motion.div
        className="my-4 grid w-full grid-cols-[minmax(0,1fr)_clamp(96px,30%,200px)] items-stretch overflow-hidden rounded-lg border border-border bg-card animate-pulse"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex min-h-[112px] min-w-0 flex-col justify-center gap-2 overflow-hidden p-4 sm:p-5">
          <div className="h-5 w-48 max-w-full rounded bg-muted" />
          <div className="h-4 w-full max-w-md rounded bg-muted" />
          <div className="mt-1 flex items-center gap-1">
            <div className="h-4 w-4 rounded bg-muted" />
            <div className="h-4 w-32 rounded bg-muted" />
          </div>
        </div>
        <div className="min-h-[112px] bg-muted" />
      </motion.div>
    );
  }

  if (error || !metadata) {
    return (
      <motion.a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="my-4 block rounded-lg border border-border bg-card p-6 hover:bg-accent/10 dark:hover:bg-accent/60 transition-colors no-underline hover:no-underline [text-decoration:none]"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-sm text-muted-foreground">링크 미리보기를 불러오지 못했어요</div>
        <div className="mt-1 line-clamp-1 font-medium text-foreground">
          <span className="no-underline">{children || url}</span>
        </div>
      </motion.a>
    );
  }

  const { title, description, siteName, origin, favicon, image } = metadata;
  const showThumbnail = Boolean(image && !thumbnailError);

  const textColumn = (
    <div
      className={`flex min-h-[112px] min-w-0 flex-col justify-center gap-1 overflow-hidden ${
        showThumbnail ? "p-4 sm:p-5" : "p-6"
      }`}
    >
      <div className="line-clamp-2 text-[15px] font-medium leading-snug text-foreground sm:line-clamp-1">
        <span className="no-underline">{title ?? metadata.url}</span>
      </div>
      {description && (
        <div className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          <span className="no-underline">{description}</span>
        </div>
      )}
      <div className="mt-1 flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground leading-tight">
        <div className="flex h-4 w-4 shrink-0 items-center justify-center">
          {favicon && !faviconError ? (
            <Image
              src={favicon}
              alt=""
              width={16}
              height={16}
              className="h-4 w-4 rounded-sm"
              onError={() => {
                setFaviconError(true);
              }}
              unoptimized
            />
          ) : (
            <Globe className="h-4 w-4" />
          )}
        </div>
        <span className="min-w-0 truncate no-underline">{siteName ?? origin.replace(/^https?:\/\//, "")}</span>
      </div>
    </div>
  );

  return (
    <motion.a
      href={metadata.url}
      target="_blank"
      rel="noreferrer"
      className={
        showThumbnail
          ? "group my-4 grid w-full grid-cols-[minmax(0,1fr)_clamp(104px,30%,200px)] items-stretch overflow-hidden rounded-lg border border-border bg-card hover:bg-accent/10 dark:hover:bg-accent/60 transition-colors no-underline hover:no-underline [text-decoration:none]"
          : "group my-4 block w-full overflow-hidden rounded-lg border border-border bg-card hover:bg-accent/10 dark:hover:bg-accent/60 transition-colors no-underline hover:no-underline [text-decoration:none]"
      }
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {textColumn}
      {showThumbnail && image ? (
        <div className="relative isolate h-full min-h-[112px] min-w-0 self-stretch overflow-hidden bg-muted/30">
          {/* next/image fill은 빈 flex/grid 칸에서 높이가 0으로 무너질 수 있어 썸네일만 일반 img 사용. .markdown-body img 마진 등은 globals.css에서 오버라이드 */}
          {/* eslint-disable-next-line @next/next/no-img-element -- 외부 og:image, 레이아웃 안정성 */}
          <img
            src={image}
            alt=""
            referrerPolicy="no-referrer"
            className="absolute inset-0 box-border m-0 h-full w-full max-w-none rounded-none object-cover object-center shadow-none"
            loading="lazy"
            decoding="async"
            onError={() => setThumbnailError(true)}
          />
        </div>
      ) : null}
    </motion.a>
  );
};
