import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { safeLocalStorage, logger } from '@/lib/utils';

interface UseAudioProps {
  src: string;
  loop?: boolean;
  volume?: number;
  muteStorageKey?: string;
}

const waitForAudioReady = (audio: HTMLAudioElement): Promise<void> => {
  if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const onReady = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error(`Audio load failed: ${audio.src}`));
    };
    const cleanup = () => {
      audio.removeEventListener('canplay', onReady);
      audio.removeEventListener('error', onError);
    };

    audio.addEventListener('canplay', onReady, { once: true });
    audio.addEventListener('error', onError, { once: true });
  });
};

export const useAudio = ({
  src,
  loop = true,
  volume = 0.3,
  muteStorageKey,
}: UseAudioProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const baseVolumeRef = useRef(volume);
  const fadeFrameRef = useRef<number | null>(null);
  const isMutedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const cancelFade = useCallback(() => {
    if (fadeFrameRef.current !== null) {
      cancelAnimationFrame(fadeFrameRef.current);
      fadeFrameRef.current = null;
    }
  }, []);

  const restoreVolume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.volume = baseVolumeRef.current;
    }
  }, []);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    if (!muteStorageKey) return;
    const savedMuted = safeLocalStorage.getBoolean(muteStorageKey);
    setIsMuted(savedMuted);
    isMutedRef.current = savedMuted;
  }, [muteStorageKey]);

  useEffect(() => {
    baseVolumeRef.current = volume;
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = loop;
    audio.volume = volume;
    audio.preload = 'auto';
    audioRef.current = audio;
    baseVolumeRef.current = volume;

    const onError = () => {
      logger.error('오디오 로드 실패:', src);
    };
    audio.addEventListener('error', onError);

    return () => {
      cancelFade();
      audio.removeEventListener('error', onError);
      audio.pause();
      audio.src = '';
      if (audioRef.current === audio) {
        audioRef.current = null;
      }
    };
  }, [src, loop, cancelFade]);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || isMutedRef.current) return;

    cancelFade();
    restoreVolume();

    try {
      await waitForAudioReady(audio);
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      logger.error('오디오 재생 실패:', error);
      setIsPlaying(false);
    }
  }, [cancelFade, restoreVolume]);

  const pause = useCallback(() => {
    cancelFade();
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [cancelFade]);

  const stop = useCallback(() => {
    cancelFade();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      restoreVolume();
      setIsPlaying(false);
    }
  }, [cancelFade, restoreVolume]);

  const fadeOut = useCallback((durationMs: number) => {
    if (!audioRef.current || isMutedRef.current) return;

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
  }, [cancelFade, restoreVolume]);

  const setMuted = useCallback((muted: boolean) => {
    isMutedRef.current = muted;
    if (audioRef.current) {
      audioRef.current.muted = muted;
    }
    setIsMuted(muted);
  }, []);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;

    const nextMuted = !isMutedRef.current;
    audioRef.current.muted = nextMuted;
    isMutedRef.current = nextMuted;
    setIsMuted(nextMuted);

    if (muteStorageKey) {
      safeLocalStorage.setBoolean(muteStorageKey, nextMuted);
    }
  }, [muteStorageKey]);

  const setVolume = useCallback((newVolume: number) => {
    baseVolumeRef.current = newVolume;
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, newVolume));
    }
  }, []);

  return useMemo(
    () => ({
      play,
      pause,
      stop,
      fadeOut,
      setMuted,
      toggleMute,
      setVolume,
      isPlaying,
      isMuted,
    }),
    [play, pause, stop, fadeOut, setMuted, toggleMute, setVolume, isPlaying, isMuted]
  );
};
