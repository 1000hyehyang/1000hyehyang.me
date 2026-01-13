"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { GAMES } from "@/lib/game-data";

export default function GamePage() {
  return (
    <div className="w-full">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold mb-2">
          Playground.
        </h1>
        <p className="text-muted-foreground">
          우리 함께 놀아요!
        </p>
      </div>

      {/* 게임 목록 */}
      <div className="grid gap-6 md:grid-cols-2">
        {GAMES.map((game, index) => {
          const IconComponent = game.icon;
          return (
            <motion.article
              key={game.href}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-card border border-border overflow-hidden cursor-pointer rounded-lg hover:bg-accent/10 dark:hover:bg-accent/60 transition-colors"
            >
              <Link 
                href={game.href}
                tabIndex={0}
                aria-label={`${game.title} 게임하기`}
                className="flex flex-col h-full p-4 focus:outline-none"
              >
                {game.thumbnail && (
                  <Image
                    src={game.thumbnail}
                    alt={`${game.title} 썸네일`}
                    width={1920}
                    height={1080}
                    className="w-full aspect-[16/9] object-cover rounded-lg mb-3"
                    unoptimized
                    priority
                  />
                )}
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 rounded-lg bg-muted">
                      <IconComponent className="w-4 h-4 text-foreground" />
                    </div>
                    <h2 className="font-semibold text-lg line-clamp-1">{game.title}</h2>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1 line-clamp-2">{game.description}</p>
                </div>
              </Link>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
} 