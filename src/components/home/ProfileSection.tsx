"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { itemVariants } from "@/lib/animations";

export const ProfileSection = () => {
  return (
    <motion.div
      variants={itemVariants}
      className="relative mb-2"
    >
      <Image
        src="/profile.png"
        alt="프로필"
        width={72}
        height={72}
        className="size-[72px] rounded-full object-cover"
        priority
      />
    </motion.div>
  );
};
