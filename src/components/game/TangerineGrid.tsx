"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useTangerineGameStore, type Tangerine } from "@/lib/tangerine-game";
import { handleKeyDown } from "@/lib/utils";

interface TangerineGridProps {
  onTangerineClick: (tangerine: Tangerine) => void;
}

export const TangerineGrid = ({ onTangerineClick }: TangerineGridProps) => {
  const { tangerines } = useTangerineGameStore();

  const handleTangerineClick = (tangerine: Tangerine) => {
    onTangerineClick(tangerine);
  };

  const handleTangerineKeyDown = (event: React.KeyboardEvent, tangerine: Tangerine) => {
    handleKeyDown(event, () => handleTangerineClick(tangerine));
  };

  return (
    <div className="relative">
      {/* 천혜향 격자 - 미니멀 디자인 */}
      <div className="grid grid-cols-20 gap-1 p-4 bg-muted/30 rounded-lg max-w-full overflow-x-auto">
        {tangerines.map((row, rowIndex) =>
          row.map((tangerine, colIndex) => (
            <motion.div
              key={tangerine.id}
              className={`
                relative w-8 h-8 rounded cursor-pointer select-none
                transition-all duration-200 ease-in-out flex items-center justify-center
                touch-manipulation hover:bg-muted active:bg-muted/80
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTangerineClick(tangerine)}
              onKeyDown={(e) => handleTangerineKeyDown(e, tangerine)}
              tabIndex={0}
              role="button"
              aria-label={`천혜향 ${tangerine.value} (${rowIndex + 1}행 ${colIndex + 1}열)`}
            >
              {/* 천혜향 이미지 */}
              <Image
                src="/orange-game/tangerine.svg"
                alt={`천혜향 ${tangerine.value}`}
                width={32}
                height={32}
                className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-200 ${
                  tangerine.isSelected ? 'opacity-100' : 'opacity-60'
                }`}
                unoptimized
              />
              
              {/* 천혜향 값 표시 - 이미지 위에 가운데 정렬 */}
              <div className="relative z-10 flex items-center justify-center w-full h-full">
                <span className={`
                  text-xs font-medium
                  ${tangerine.isSelected 
                    ? 'text-background' 
                    : 'text-foreground'
                  }
                `}>
                  {tangerine.value}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}; 