"use client";

import { PortfolioFrontmatter } from "@/types";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export const PortfolioCard = ({ title, period, tech, role, images, summary, slug }: PortfolioFrontmatter) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-border bg-card shadow-sm p-4 flex flex-col gap-2 hover:shadow-md transition-shadow"
    >
      <Link href={`/portfolio/${slug}`} tabIndex={0} aria-label={`${title} 상세 보기`} className="flex flex-col h-full focus:outline-none focus:ring-2 focus:ring-ring">
        <div className="text-xs text-muted-foreground mb-2">
          {period} · {role}
        </div>
        {images && images[0] && (
          <Image
            src={images[0]}
            alt={title}
            width={600}
            height={300}
            className="w-full aspect-[3/1.5] object-cover rounded-xl mb-3"
            priority
          />
        )}
        <div className="flex-1 flex flex-col gap-1">
          <h2 className="font-bold text-lg mb-1">{title}</h2>
          <p className="text-sm text-muted-foreground mb-1">{summary}</p>
        </div>
      </Link>
    </motion.article>
  );
}; 