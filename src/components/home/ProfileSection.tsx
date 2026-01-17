"use client";

import Image from "next/image";
import { GITHUB_CONFIG } from "@/lib/config";
import { motion } from "framer-motion";
import { itemVariants } from "@/lib/animations";
import { useState } from "react";

export const ProfileSection = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  const avatarUrl = `https://avatars.githubusercontent.com/u/${GITHUB_CONFIG.userId}?v=4`;
  const hoverAvatarUrl = "https://eaalkymxyfskjojh.public.blob.vercel-storage.com/1000hyehyang%20%EC%A6%9D%EB%AA%85%EC%82%AC%EC%A7%84.png";

  return (
    <motion.div 
      variants={itemVariants}
      className="relative mb-2 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-[72px] h-[72px] rounded-full overflow-hidden">
        {/* 기본 이미지 */}
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: isHovered ? 0 : 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Image
            src={avatarUrl}
            alt="프로필"
            width={72}
            height={72}
            className="rounded-full w-full h-full object-cover"
            priority
            unoptimized
          />
        </motion.div>
        
        {/* 호버 시 이미지 */}
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Image
            src={hoverAvatarUrl}
            alt="프로필 (호버)"
            width={72}
            height={72}
            className="rounded-full w-full h-full object-cover"
            unoptimized
          />
        </motion.div>
      </div>
    </motion.div>
  );
}; 