import Image from "next/image";
import { getTechIconSrc } from "@/constants/techIconMap";

type TechBadgeProps = {
  tech: string;
};

export const TechBadge = ({
  tech,
}: TechBadgeProps) => {
  const iconSrc = getTechIconSrc(tech);

  return (
    <div
      className="inline-flex items-center gap-2 rounded-md bg-muted/40 px-3 py-1.5 transition-all duration-200 hover:bg-muted/60 dark:bg-muted/60 dark:hover:bg-muted/80"
    >
      {iconSrc && (
        <Image
          src={iconSrc}
          alt={`${tech} 아이콘`}
          width={20}
          height={20}
          className="h-5 w-5 object-contain"
        />
      )}
      <span className="text-sm text-foreground leading-none">{tech}</span>
    </div>
  );
};

