import { useAudio } from "@/hooks/useAudio";

export const useGameAudio = (bgmSrc: string, sfxSrc: string) => {
  const bgMusic = useAudio({
    src: bgmSrc,
    loop: true,
    volume: 0.3,
    muteStorageKey: "bgm-muted",
  });

  const sfxSound = useAudio({
    src: sfxSrc,
    loop: false,
    volume: 0.5,
    muteStorageKey: "sfx-muted",
  });

  return { bgMusic, sfxSound };
};
