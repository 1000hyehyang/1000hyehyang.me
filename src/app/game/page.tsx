"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Citrus, Shield } from "lucide-react";

const games = [
  {
    title: "천혜향 게임",
    description: "연속된 천혜향들을 선택해서 합이 10이 되는 조합을 찾아보세요",
    href: "/game/orange-game",
    icon: Citrus
  },
  {
    title: "귤림고수",
    description: "날아오는 귤들을 피해서 최대한 오래 살아남아보세요",
    href: "/game/tangerine-master",
    icon: Shield
  }
  // 추후 다른 게임들 추가 가능
];

export default function GamePage() {
  return (
    <div className="w-full">
      {/* 헤더 */}
      <div className="mb-12">
        <h1 className="text-xl font-semibold mb-2">
          Playground.
        </h1>
        <p className="text-muted-foreground">
          다양한 미니게임들을 즐겨보세요
        </p>
      </div>

      {/* 게임 목록 */}
      <div className="grid gap-6 md:grid-cols-2">
        {games.map((game, index) => {
          const IconComponent = game.icon;
          return (
            <motion.div
              key={game.href}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link href={game.href}>
                <motion.div
                  className="p-6 bg-card border border-border overflow-hidden cursor-pointer rounded-lg hover:bg-accent/10 dark:hover:bg-accent/60 transition-colors h-36 flex flex-col"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-muted">
                      <IconComponent className="w-4 h-4 text-foreground" />
                    </div>
                    <h3 className="text-base font-semibold">{game.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                    {game.description}
                  </p>
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
} 