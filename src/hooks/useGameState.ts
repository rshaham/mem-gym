import { useState, useCallback } from 'react';
import type { GamePhase } from '../types';

interface UseGameStateOptions<TSession> {
  onSessionComplete?: (session: TSession) => void;
}

interface UseGameStateReturn<TSession> {
  phase: GamePhase;
  session: TSession | null;
  setPhase: (phase: GamePhase) => void;
  startSession: (initialSession: TSession) => void;
  updateSession: (updater: (session: TSession) => TSession) => void;
  endSession: () => TSession | null;
  resetGame: () => void;
}

export function useGameState<TSession>({
  onSessionComplete,
}: UseGameStateOptions<TSession> = {}): UseGameStateReturn<TSession> {
  const [phase, setPhase] = useState<GamePhase>('ready');
  const [session, setSession] = useState<TSession | null>(null);

  const startSession = useCallback((initialSession: TSession) => {
    setSession(initialSession);
    setPhase('active');
  }, []);

  const updateSession = useCallback(
    (updater: (session: TSession) => TSession) => {
      setSession((prev) => {
        if (prev === null) return null;
        return updater(prev);
      });
    },
    []
  );

  const endSession = useCallback((): TSession | null => {
    setPhase('complete');
    if (session !== null) {
      onSessionComplete?.(session);
    }
    return session;
  }, [session, onSessionComplete]);

  const resetGame = useCallback(() => {
    setPhase('ready');
    setSession(null);
  }, []);

  return {
    phase,
    session,
    setPhase,
    startSession,
    updateSession,
    endSession,
    resetGame,
  };
}
