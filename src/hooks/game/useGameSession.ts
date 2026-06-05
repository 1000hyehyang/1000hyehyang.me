import { useState, useRef, useCallback } from "react";

export const useGameSession = (sessionEndpoint: string) => {
  const sessionIdRef = useRef<string | null>(null);
  const [isSessionReady, setIsSessionReady] = useState(false);

  const createSession = useCallback(async (): Promise<boolean> => {
    const sessionId = `game_session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

    try {
      const response = await fetch(sessionEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        console.error("게임 세션 생성 실패");
        sessionIdRef.current = null;
        setIsSessionReady(false);
        return false;
      }

      sessionIdRef.current = sessionId;
      setIsSessionReady(true);
      return true;
    } catch (error) {
      console.error("게임 세션 생성 중 오류:", error);
      sessionIdRef.current = null;
      setIsSessionReady(false);
      return false;
    }
  }, [sessionEndpoint]);

  const clearSession = useCallback(() => {
    sessionIdRef.current = null;
    setIsSessionReady(false);
  }, []);

  const getSessionId = useCallback(() => sessionIdRef.current, []);

  return { createSession, clearSession, getSessionId, isSessionReady };
};
