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

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!url) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/link-metadata?url=${encodeURIComponent(url)}`);
        
        if (!response.ok) {
          throw new Error('메타데이터를 가져올 수 없습니다.');
        }
        
        const data = await response.json();
        setMetadata(data);
        setFaviconError(false); // 새로운 메타데이터 로드 시 파비콘 에러 상태 리셋
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, [url]);

  if (isLoading) {
    return (
      <motion.div
        className="my-4 flex w-full items-center gap-4 rounded-lg border border-border bg-card p-6 animate-pulse"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
         <div className="flex min-w-0 flex-col">
           <div>
             <div className="h-5 w-48 rounded bg-muted" />
             <div className="mt-2 h-4 w-72 rounded bg-muted" />
           </div>
           <div className="mt-2 flex items-center gap-1">
             <div className="flex h-4 w-4 items-center justify-center">
               <div className="h-4 w-4 rounded bg-muted" />
             </div>
             <div className="h-4 w-24 rounded bg-muted" />
           </div>
         </div>
      </motion.div>
    );
  }

  if (error || !metadata) {
    // 메타데이터를 가져올 수 없는 경우 기본 링크로 표시
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

  const { title, description, siteName, origin, favicon } = metadata;

  return (
    <motion.a
      href={metadata.url}
      target="_blank"
      rel="noreferrer"
      className="group my-4 flex w-full items-center gap-4 rounded-lg border border-border bg-card p-6 hover:bg-accent/10 dark:hover:bg-accent/60 transition-colors no-underline hover:no-underline [text-decoration:none]"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >

      {/* 텍스트 영역 */}
      <div className="min-w-0 flex-1">
        <div className="line-clamp-1 text-[15px] font-medium text-foreground">
          <span className="no-underline">{title ?? metadata.url}</span>
        </div>
        {description && (
          <div className="mt-1 line-clamp-1 text-sm text-muted-foreground">
            <span className="no-underline">{description}</span>
          </div>
        )}
        <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground leading-tight">
          <div className="flex h-4 w-4 items-center justify-center">
            {favicon && !faviconError ? (
              <Image 
                src={favicon} 
                alt="favicon" 
                width={16}
                height={16}
                className="h-4 w-4 rounded-sm" 
                onError={() => {
                  // 파비콘 로드 실패 시 Globe 아이콘으로 대체
                  setFaviconError(true);
                }}
                unoptimized
              />
            ) : (
              <Globe className="h-4 w-4" />
            )}
          </div>
          <span className="truncate no-underline">{siteName ?? origin.replace(/^https?:\/\//, "")}</span>
        </div>
      </div>
    </motion.a>
  );
};
