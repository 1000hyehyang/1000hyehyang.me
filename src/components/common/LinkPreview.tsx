"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Globe } from "lucide-react";

interface LinkMetadata {
  title?: string;
  description?: string;
  image?: string;
  url: string;
  domain?: string;
}

interface LinkPreviewProps {
  url: string;
  children?: React.ReactNode;
}

export const LinkPreview = ({ url, children }: LinkPreviewProps) => {
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, [url]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <motion.div
        className="my-4 p-4 border border-border rounded-lg bg-muted/30"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-muted rounded-lg animate-pulse" />
          <div className="flex-1">
            <div className="h-4 bg-muted rounded animate-pulse mb-2" />
            <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
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
        className="inline-flex items-center gap-1 text-orange-300 hover:text-orange-400 underline transition-colors"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children || url}
        <ExternalLink className="w-3 h-3" />
      </motion.a>
    );
  }

  return (
    <motion.div
      className="my-4 border border-border rounded-lg overflow-hidden bg-card hover:bg-accent/5 transition-colors cursor-pointer group h-24 md:h-32"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      }}
      aria-label={`${metadata.title || metadata.domain} 링크 열기`}
    >
      <div className="flex h-full">
        {/* 텍스트 영역 */}
        <div className="flex-1 p-3 md:p-4 min-w-0 flex flex-col justify-between h-full">
          <div className="flex flex-col">
            {metadata.title && (
              <h3 className="font-medium text-foreground mb-2 md:mb-3 group-hover:text-orange-300 transition-colors line-clamp-2 text-sm md:text-base">
                {metadata.title}
              </h3>
            )}
            <div className="h-3 md:h-5 mb-2 md:mb-3 flex items-center">
              {metadata.description && (
                <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">
                  {metadata.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Globe className="w-3 h-3" />
            <span className="truncate">{metadata.domain}</span>
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
