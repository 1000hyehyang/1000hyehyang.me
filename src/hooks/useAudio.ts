import { useEffect, useRef, useState } from 'react';
import { safeLocalStorage, logger } from '@/lib/utils';

interface UseAudioProps {
  src: string;
  loop?: boolean;
  volume?: number;
}

export const useAudio = ({ src, loop = true, volume = 0.3 }: UseAudioProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const baseVolumeRef = useRef(volume);
  const fadeFrameRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const cancelFade = () => {
    if (fadeFrameRef.current !== null) {
      cancelAnimationFrame(fadeFrameRef.current);
      fadeFrameRef.current = null;
    }
  };

  const restoreVolume = () => {
    if (audioRef.current) {
      audioRef.current.volume = baseVolumeRef.current;
    }
  };

  // localStorage에서 음소거 상태 불러오기
  useEffect(() => {
    const savedMuted = safeLocalStorage.getBoolean('sfx-muted');
    setIsMuted(savedMuted);
  }, []);

  useEffect(() => {
    baseVolumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    audioRef.current = new Audio(src);
    audioRef.current.loop = loop;
    audioRef.current.volume = volume;
    audioRef.current.preload = 'auto';
    baseVolumeRef.current = volume;

    return () => {
      cancelFade();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [src, loop, volume]);

  const play = () => {
    if (audioRef.current && !isMuted) {
      cancelFade();
      restoreVolume();
      audioRef.current.play().catch((error) => logger.error('오디오 재생 실패:', error));
      setIsPlaying(true);
    }
  };

  const pause = () => {
    cancelFade();
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const stop = () => {
    cancelFade();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      restoreVolume();
      setIsPlaying(false);
    }
  };

  const fadeOut = (durationMs: number) => {
    if (!audioRef.current || isMuted) return;

    const audio = audioRef.current;
    const startVolume = audio.volume;
    const startTime = performance.now();

    cancelFade();

    const step = (now: number) => {
      const progress = Math.min(1, (now - startTime) / durationMs);
      audio.volume = startVolume * (1 - progress);

      if (progress < 1) {
        fadeFrameRef.current = requestAnimationFrame(step);
        return;
      }

      audio.pause();
      audio.currentTime = 0;
      restoreVolume();
      setIsPlaying(false);
      fadeFrameRef.current = null;
    };

    fadeFrameRef.current = requestAnimationFrame(step);
  };

  const setMuted = (muted: boolean) => {
    if (audioRef.current) {
      audioRef.current.muted = muted;
    }
    setIsMuted(muted);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const nextMuted = !isMuted;
      audioRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
      safeLocalStorage.setBoolean('sfx-muted', nextMuted);
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
    fadeOut,
    setMuted,
    toggleMute,
    setVolume,
    isPlaying,
    isMuted,
  };
}; 