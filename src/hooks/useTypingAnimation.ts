import { useState, useEffect, useCallback } from "react";
import { TYPING_CONFIG } from "@/lib/intro-data";

export const useTypingAnimation = (items: readonly string[], isInView: boolean) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const moveToNextItem = useCallback(() => {
    setIsDeleting(false);
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const startDeleting = useCallback(() => {
    setIsDeleting(true);
  }, []);

  useEffect(() => {
    if (!isInView) return;

    const currentText = items[currentIndex];
    const typingSpeed = isDeleting 
      ? TYPING_CONFIG.deletingSpeed 
      : TYPING_CONFIG.typingSpeed;
    const pauseTime = isDeleting 
      ? TYPING_CONFIG.pauseAfterDeleting 
      : TYPING_CONFIG.pauseAfterTyping;

    // 텍스트 완성 후 대기
    if (!isDeleting && displayedText === currentText) {
      const timeout = setTimeout(startDeleting, pauseTime);
      return () => clearTimeout(timeout);
    }

    // 텍스트 삭제 완료 후 다음 아이템으로 이동
    if (isDeleting && displayedText === "") {
      moveToNextItem();
      return;
    }

    // 타이핑/삭제 애니메이션
    const timeout = setTimeout(() => {
      if (isDeleting) {
        setDisplayedText((prev) => prev.slice(0, -1));
      } else {
        setDisplayedText((prev) => currentText.slice(0, prev.length + 1));
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayedText, currentIndex, isDeleting, isInView, items, startDeleting, moveToNextItem]);

  return displayedText;
};
