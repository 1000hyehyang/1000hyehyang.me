"use client";

import { Mail, Github, Linkedin, Instagram } from "lucide-react";
import { motion } from "framer-motion";
import { itemVariants } from "@/lib/animations";

export const ContactSection = () => {
  return (
    <motion.section variants={itemVariants} className="w-full max-w-2xl">
      <h2 className="text-xl font-semibold mb-6">Reach.</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 이메일 */}
        <a
          href="mailto:ducogus12@gmail.com"
          className="bg-card border border-border rounded-lg p-4 hover:bg-accent/10 transition-colors"
          tabIndex={0}
          aria-label="이메일 보내기"
        >
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-medium">Email</div>
              <div className="text-sm text-muted-foreground underline truncate">ducogus12@gmail.com</div>
            </div>
          </div>
        </a>

        {/* GitHub */}
        <a
          href="https://github.com/1000hyehyang"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-card border border-border rounded-lg p-4 hover:bg-accent/10 transition-colors"
          tabIndex={0}
          aria-label="GitHub 프로필 보기"
        >
          <div className="flex items-center gap-3">
            <Github className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-medium">GitHub</div>
              <div className="text-sm text-muted-foreground underline truncate">github.com/1000hyehyang</div>
            </div>
          </div>
        </a>

        {/* LinkedIn */}
        <a
          href="https://www.linkedin.com/in/1000hyehyang"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-card border border-border rounded-lg p-4 hover:bg-accent/10 transition-colors"
          tabIndex={0}
          aria-label="LinkedIn 프로필 보기"
        >
          <div className="flex items-center gap-3">
            <Linkedin className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-medium">LinkedIn</div>
              <div className="text-sm text-muted-foreground underline truncate">linkedin.com/in/1000hyehyang</div>
            </div>
          </div>
        </a>

        {/* Instagram */}
        <a
          href="https://www.instagram.com/thousandhyehyang"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-card border border-border rounded-lg p-4 hover:bg-accent/10 transition-colors"
          tabIndex={0}
          aria-label="Instagram 프로필 보기"
        >
          <div className="flex items-center gap-3">
            <Instagram className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-medium">Instagram</div>
              <div className="text-sm text-muted-foreground underline truncate">instagram.com/thousandhyehyang</div>
            </div>
          </div>
        </a>
      </div>
    </motion.section>
  );
}; 