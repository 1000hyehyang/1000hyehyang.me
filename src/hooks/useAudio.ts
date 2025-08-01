import { useEffect, useRef, useState } from 'react';
import { safeLocalStorage, logger } from '@/lib/utils';

interface UseAudioProps {
  src: string;
  loop?: boolean;
  volume?: number;
}

export const useAudio = ({ src, loop = true, volume = 0.3 }: UseAudioProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // localStorage에서 음소거 상태 불러오기
  useEffect(() => {
    const savedMuted = safeLocalStorage.getBoolean('sfx-muted');
    setIsMuted(savedMuted);
  }, []);

  useEffect(() => {
    audioRef.current = new Audio(src);
    audioRef.current.loop = loop;
    audioRef.current.volume = volume;
    audioRef.current.preload = 'auto';

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [src, loop, volume]);

  const play = () => {
    if (audioRef.current && !isMuted) {
      audioRef.current.play().catch((error) => logger.error('오디오 재생 실패:', error));
      setIsPlaying(true);
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      // localStorage에 음소거 상태 저장
      safeLocalStorage.setBoolean('sfx-muted', !isMuted);
    }
  };

  const setVolume = (newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, newVolume));
    }
  };

  return {
    play,
    pause,
    stop,
    toggleMute,
    setVolume,
    isPlaying,
    isMuted,
  };
}; 