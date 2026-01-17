"use client";

import Image from "next/image";
import { GITHUB_CONFIG } from "@/lib/config";
import { motion } from "framer-motion";
import { itemVariants } from "@/lib/animations";

export const ProfileSection = () => {
  return (
    <motion.div variants={itemVariants}>
      <Image
        src={`https://avatars.githubusercontent.com/u/${GITHUB_CONFIG.userId}?v=4`}
        alt="프로필"
        width={72}
        height={72}
        className="rounded-full mb-2"
        priority
        unoptimized
      />
    </motion.div>
  );
}; 