import { useState, useRef, useCallback } from "react";

export const useGameSession = (sessionEndpoint: string) => {
  const sessionIdRef = useRef<string | null>(null);
  const creatingRef = useRef<Promise<boolean> | null>(null);
  const sessionGenerationRef = useRef(0);
  const [isSessionReady, setIsSessionReady] = useState(false);

  const createSession = useCallback(async (): Promise<boolean> => {
    if (sessionIdRef.current) return true;
    if (creatingRef.current) return creatingRef.current;

    const generation = sessionGenerationRef.current;
    const sessionId = `game_session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

    creatingRef.current = (async () => {
      try {
        const response = await fetch(sessionEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        if (generation !== sessionGenerationRef.current) {
          return false;
        }

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
        if (generation !== sessionGenerationRef.current) {
          return false;
        }
        console.error("게임 세션 생성 중 오류:", error);
        sessionIdRef.current = null;
        setIsSessionReady(false);
        return false;
      } finally {
        creatingRef.current = null;
      }
    })();

    return creatingRef.current;
  }, [sessionEndpoint]);

  const clearSession = useCallback(() => {
    sessionGenerationRef.current += 1;
    sessionIdRef.current = null;
    creatingRef.current = null;
    setIsSessionReady(false);
  }, []);

  const getSessionId = useCallback(() => sessionIdRef.current, []);

  return { createSession, clearSession, getSessionId, isSessionReady };
};
