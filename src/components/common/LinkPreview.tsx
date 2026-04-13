"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import Image from "next/image";
import { useLinkMetadata } from "@/hooks/useLinkMetadata";
import { linkPreviewMotion } from "@/lib/animations";
import type { LinkMetadata } from "@/lib/link-metadata/types";

const baseCardLinkClass =
  "no-underline hover:no-underline [text-decoration:none] my-4 rounded-lg border border-border bg-card transition-colors hover:bg-accent/10 dark:hover:bg-accent/60";

const skeletonGridClass =
  "grid w-full grid-cols-[minmax(0,1fr)_clamp(96px,30%,200px)] items-stretch overflow-hidden animate-pulse";

const cardGridWithThumbnailClass =
  "grid w-full grid-cols-[minmax(0,1fr)_clamp(104px,30%,200px)] items-stretch overflow-hidden";

type LinkPreviewProps = {
  url: string;
  children?: ReactNode;
};

export function LinkPreview({ url, children }: LinkPreviewProps) {
  const state = useLinkMetadata(url);

  if (state.status === "loading" || state.status === "idle") {
    return <LinkPreviewSkeleton />;
  }

  if (state.status === "error") {
    return <LinkPreviewError url={url} label={children ?? url} />;
  }

  return <LinkPreviewCard metadata={state.data} />;
}

function LinkPreviewSkeleton() {
  return (
    <motion.div
      className={`${baseCardLinkClass} ${skeletonGridClass}`}
      {...linkPreviewMotion}
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

type LinkPreviewErrorProps = {
  url: string;
  label: ReactNode;
};

function LinkPreviewError({ url, label }: LinkPreviewErrorProps) {
  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseCardLinkClass} block p-6`}
      {...linkPreviewMotion}
    >
      <div className="text-sm text-muted-foreground">링크 미리보기를 불러오지 못했어요</div>
      <div className="mt-1 line-clamp-1 font-medium text-foreground">
        <span className="no-underline">{label}</span>
      </div>
    </motion.a>
  );
}

type LinkPreviewCardProps = {
  metadata: LinkMetadata;
};

function LinkPreviewCard({ metadata }: LinkPreviewCardProps) {
  const [faviconFailed, setFaviconFailed] = useState(false);
  const [thumbnailFailed, setThumbnailFailed] = useState(false);

  const { title, description, siteName, origin, favicon, image } = metadata;
  const showThumbnail = Boolean(image && !thumbnailFailed);
  const displayTitle = title ?? metadata.url;
  const siteLabel = siteName ?? origin.replace(/^https?:\/\//, "");

  const textBlock = (
    <div
      className={`flex min-h-[112px] min-w-0 flex-col justify-center gap-1 overflow-hidden ${
        showThumbnail ? "p-4 sm:p-5" : "p-6"
      }`}
    >
      <div className="line-clamp-2 text-[15px] font-medium leading-snug text-foreground sm:line-clamp-1">
        <span className="no-underline">{displayTitle}</span>
      </div>
      {description ? (
        <div className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          <span className="no-underline">{description}</span>
        </div>
      ) : null}
      <div className="mt-1 flex min-w-0 items-center gap-1.5 text-sm leading-tight text-muted-foreground">
        <span className="flex h-4 w-4 shrink-0 items-center justify-center">
          {favicon && !faviconFailed ? (
            <Image
              src={favicon}
              alt=""
              width={16}
              height={16}
              className="h-4 w-4 rounded-sm"
              onError={() => setFaviconFailed(true)}
              unoptimized
            />
          ) : (
            <Globe className="h-4 w-4" />
          )}
        </span>
        <span className="min-w-0 truncate no-underline">{siteLabel}</span>
      </div>
    </div>
  );

  return (
    <motion.a
      href={metadata.url}
      target="_blank"
      rel="noopener noreferrer"
      className={
        showThumbnail
          ? `${baseCardLinkClass} ${cardGridWithThumbnailClass}`
          : `${baseCardLinkClass} block w-full overflow-hidden`
      }
      {...linkPreviewMotion}
    >
      {textBlock}
      {showThumbnail && image ? (
        <div className="relative isolate h-full min-h-[112px] min-w-0 self-stretch overflow-hidden bg-muted/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt=""
            referrerPolicy="no-referrer"
            className="absolute inset-0 box-border m-0 h-full w-full max-w-none rounded-none object-cover object-center shadow-none"
            loading="lazy"
            decoding="async"
            onError={() => setThumbnailFailed(true)}
          />
        </div>
      ) : null}
    </motion.a>
  );
}
