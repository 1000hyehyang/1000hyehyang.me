import { useAudio } from "@/hooks/useAudio";

export const useGameAudio = (bgmSrc: string, sfxSrc: string) => {
  const bgMusic = useAudio({
    src: bgmSrc,
    loop: true,
    volume: 0.3,
  });

  const sfxSound = useAudio({
    src: sfxSrc,
    loop: false,
    volume: 0.5,
  });

  return { bgMusic, sfxSound };
};
