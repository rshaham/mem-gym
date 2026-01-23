/**
 * Reverse Recall game state hook.
 * Manages the complete game flow for the Reverse Recall memory training module.
 * Users log daily events in reverse chronological order to strengthen episodic memory.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  ReverseRecallSession,
  ReverseRecallEvent,
} from '../../../types';

// ============ TYPES ============

export type ReverseRecallPhase = 'setup' | 'entry' | 'results';
export type ChainLevel = 1 | 2 | 3;

export type SensoryKey = 'sight' | 'sound' | 'smell' | 'touch' | 'taste';

export interface SensoryDetails {
  sight?: string;
  sound?: string;
  smell?: string;
  touch?: string;
  taste?: string;
}

interface UseReverseRecallOptions {
  onSessionComplete?: (session: ReverseRecallSession) => void;
}

export interface UseReverseRecallReturn {
  // State
  phase: ReverseRecallPhase;
  chainLevel: ChainLevel;
  events: ReverseRecallEvent[];
  session: ReverseRecallSession | null;

  // Derived state
  targetEventCount: number;
  canFinish: boolean;
  sensoryEnabled: boolean;

  // Actions
  startSession: (level: ChainLevel) => void;
  addEvent: (description: string) => void;
  updateEventSensory: (eventId: string, sense: SensoryKey, value: string) => void;
  removeEvent: (eventId: string) => void;
  finishEntry: () => void;
  reset: () => void;
}

// ============ CONSTANTS ============

const POINTS = {
  baseEvent: 10,
  sensoryDetail: 5,
  chainBonus: (length: number): number => length * 2,
};

const TARGET_EVENTS_BY_LEVEL: Record<ChainLevel, number> = {
  1: 3,
  2: 5,
  3: 5,
};

// ============ HELPER FUNCTIONS ============

/**
 * Counts the number of non-empty sensory details in an event.
 */
function countSensoryDetails(event: ReverseRecallEvent): number {
  if (!event.sensoryDetails) return 0;

  const details = event.sensoryDetails;
  let count = 0;

  if (details.sight && details.sight.trim()) count++;
  if (details.sound && details.sound.trim()) count++;
  if (details.smell && details.smell.trim()) count++;
  if (details.touch && details.touch.trim()) count++;
  if (details.taste && details.taste.trim()) count++;

  return count;
}

/**
 * Calculates the score for a session.
 * XP = (events * 10) + (sensoryDetails * 5) + (chainLength * 2)
 */
function calculateScore(events: ReverseRecallEvent[]): number {
  const eventCount = events.length;
  const baseEventPoints = eventCount * POINTS.baseEvent;

  const totalSensoryDetails = events.reduce(
    (sum, event) => sum + countSensoryDetails(event),
    0
  );
  const sensoryPoints = totalSensoryDetails * POINTS.sensoryDetail;

  const chainBonus = POINTS.chainBonus(eventCount);

  return baseEventPoints + sensoryPoints + chainBonus;
}

/**
 * Gets the current date in ISO format (YYYY-MM-DD).
 */
function getCurrentDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// ============ HOOK ============

export function useReverseRecall({
  onSessionComplete,
}: UseReverseRecallOptions = {}): UseReverseRecallReturn {
  // Session configuration
  const [phase, setPhase] = useState<ReverseRecallPhase>('setup');
  const [chainLevel, setChainLevel] = useState<ChainLevel>(1);

  // Event state
  const [events, setEvents] = useState<ReverseRecallEvent[]>([]);

  // Session result
  const [session, setSession] = useState<ReverseRecallSession | null>(null);

  // Keep callback ref updated to avoid stale closures
  const onSessionCompleteRef = useRef(onSessionComplete);

  useEffect(() => {
    onSessionCompleteRef.current = onSessionComplete;
  }, [onSessionComplete]);

  // Derived state
  const targetEventCount = TARGET_EVENTS_BY_LEVEL[chainLevel];
  const canFinish = events.length >= targetEventCount;
  const sensoryEnabled = chainLevel === 3;

  /**
   * Starts a new session with the selected chain level.
   */
  const startSession = useCallback((level: ChainLevel) => {
    setChainLevel(level);
    setEvents([]);
    setSession(null);
    setPhase('entry');
  }, []);

  /**
   * Adds a new event to the chain.
   * Events are added in reverse chronological order (most recent first).
   */
  const addEvent = useCallback((description: string) => {
    if (!description.trim()) return;

    const newEvent: ReverseRecallEvent = {
      id: crypto.randomUUID(),
      description: description.trim(),
      timestamp: Date.now(),
      orderIndex: 0, // Will be updated when calculating final order
      sensoryDetails: undefined,
    };

    setEvents((prev) => {
      const updated = [...prev, newEvent];
      // Update order indices (reverse chronological: first added = most recent = highest index)
      return updated.map((event, index) => ({
        ...event,
        orderIndex: updated.length - 1 - index,
      }));
    });
  }, []);

  /**
   * Updates a sensory detail for a specific event.
   * Only applicable for Level 3 sessions.
   */
  const updateEventSensory = useCallback(
    (eventId: string, sense: SensoryKey, value: string) => {
      setEvents((prev) =>
        prev.map((event) => {
          if (event.id !== eventId) return event;

          const currentSensory = event.sensoryDetails || {};
          const updatedSensory: SensoryDetails = {
            ...currentSensory,
            [sense]: value.trim() || undefined,
          };

          // Clean up empty sensory object
          const hasAnySensory = Object.values(updatedSensory).some(
            (v) => v && v.trim()
          );

          return {
            ...event,
            sensoryDetails: hasAnySensory ? updatedSensory : undefined,
          };
        })
      );
    },
    []
  );

  /**
   * Removes an event from the chain.
   */
  const removeEvent = useCallback((eventId: string) => {
    setEvents((prev) => {
      const filtered = prev.filter((event) => event.id !== eventId);
      // Re-index remaining events
      return filtered.map((event, index) => ({
        ...event,
        orderIndex: filtered.length - 1 - index,
      }));
    });
  }, []);

  /**
   * Finishes entry phase, calculates score, and transitions to results.
   */
  const finishEntry = useCallback(() => {
    if (events.length === 0) return;

    const score = calculateScore(events);

    const completedSession: ReverseRecallSession = {
      id: crypto.randomUUID(),
      date: getCurrentDateString(),
      events: [...events],
      chainLevel,
      score,
      completedAt: Date.now(),
    };

    setSession(completedSession);
    setPhase('results');
    onSessionCompleteRef.current?.(completedSession);
  }, [events, chainLevel]);

  /**
   * Resets the game to the setup phase.
   */
  const reset = useCallback(() => {
    setPhase('setup');
    setChainLevel(1);
    setEvents([]);
    setSession(null);
  }, []);

  return {
    // State
    phase,
    chainLevel,
    events,
    session,

    // Derived state
    targetEventCount,
    canFinish,
    sensoryEnabled,

    // Actions
    startSession,
    addEvent,
    updateEventSensory,
    removeEvent,
    finishEntry,
    reset,
  };
}
