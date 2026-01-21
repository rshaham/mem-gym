import { useState, useRef, useCallback, useEffect } from 'react';
import type { DualNBackTrial, DualNBackSession } from '../../../types';

// ============ CONSTANTS ============

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L'] as const;
const GRID_POSITIONS = 9; // 3x3 grid, positions 0-8
const STIMULUS_DURATION = 500; // ms
const RESPONSE_WINDOW = 2000; // ms
const TARGET_MATCH_RATE = 0.3; // ~30% matches

// ============ TYPES ============

type TrialPhase = 'stimulus' | 'response' | 'idle';

interface UseDualNBackOptions {
  onTrialStart?: (trial: DualNBackTrial, index: number) => void;
  onStimulusEnd?: () => void;
  onTrialEnd?: (trial: DualNBackTrial, index: number) => void;
  onSessionComplete?: (session: DualNBackSession) => void;
}

export interface SessionResults {
  positionHits: number;
  positionMisses: number;
  positionFalseAlarms: number;
  positionCorrectRejections: number;
  audioHits: number;
  audioMisses: number;
  audioFalseAlarms: number;
  audioCorrectRejections: number;
  positionAccuracy: number;
  audioAccuracy: number;
  overallAccuracy: number;
  xpEarned: number;
  scoredTrials: number;
}

interface UseDualNBackReturn {
  trials: DualNBackTrial[];
  currentTrialIndex: number;
  isRunning: boolean;
  phase: TrialPhase;
  start: (trialCount: number, nLevel: number) => void;
  recordPositionResponse: () => void;
  recordAudioResponse: () => void;
  getResults: () => SessionResults;
}

// ============ HELPER FUNCTIONS ============

/**
 * Generates a random integer in range [0, max)
 */
function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

/**
 * Picks a random element from an array, optionally excluding certain values
 */
function pickRandom<T>(array: readonly T[], exclude?: T[]): T {
  if (exclude && exclude.length > 0) {
    const filtered = array.filter(item => !exclude.includes(item));
    if (filtered.length === 0) {
      // Fallback: just pick randomly from original if all excluded
      return array[randomInt(array.length)];
    }
    return filtered[randomInt(filtered.length)];
  }
  return array[randomInt(array.length)];
}

/**
 * Generates all trials for a dual n-back session
 * - First N trials cannot have matches
 * - Targets ~30% match rate for position and audio independently
 * - When not a match, excludes the N-back value (avoid lures)
 */
function generateTrials(nLevel: number, trialCount: number): DualNBackTrial[] {
  const trials: DualNBackTrial[] = [];

  for (let i = 0; i < trialCount; i++) {
    const canHaveMatch = i >= nLevel;

    let position: number;
    let letter: string;
    let positionMatch = false;
    let audioMatch = false;

    if (canHaveMatch) {
      const nBackTrial = trials[i - nLevel];

      // Decide if this trial should have a position match (~30% chance)
      positionMatch = Math.random() < TARGET_MATCH_RATE;

      if (positionMatch) {
        position = nBackTrial.position;
      } else {
        // Pick a position that's NOT the n-back position (avoid lures)
        const positions = Array.from({ length: GRID_POSITIONS }, (_, idx) => idx);
        position = pickRandom(positions, [nBackTrial.position]);
      }

      // Decide if this trial should have an audio match (~30% chance)
      audioMatch = Math.random() < TARGET_MATCH_RATE;

      if (audioMatch) {
        letter = nBackTrial.letter;
      } else {
        // Pick a letter that's NOT the n-back letter (avoid lures)
        letter = pickRandom(LETTERS, [nBackTrial.letter]);
      }
    } else {
      // First N trials: no matches possible, just random values
      position = randomInt(GRID_POSITIONS);
      letter = pickRandom(LETTERS);
    }

    trials.push({
      position,
      letter,
      positionMatch,
      audioMatch,
      userPositionResponse: false,
      userAudioResponse: false,
      responseTime: null,
    });
  }

  return trials;
}

/**
 * Calculates session results including accuracy and XP
 */
function calculateResults(trials: DualNBackTrial[], nLevel: number): SessionResults {
  // Only score trials after first N (where matches are possible)
  const scoredTrials = trials.slice(nLevel);
  const scoredCount = scoredTrials.length;

  let positionHits = 0;
  let positionMisses = 0;
  let positionFalseAlarms = 0;
  let positionCorrectRejections = 0;

  let audioHits = 0;
  let audioMisses = 0;
  let audioFalseAlarms = 0;
  let audioCorrectRejections = 0;

  for (const trial of scoredTrials) {
    // Position scoring
    if (trial.positionMatch && trial.userPositionResponse) {
      positionHits++;
    } else if (trial.positionMatch && !trial.userPositionResponse) {
      positionMisses++;
    } else if (!trial.positionMatch && trial.userPositionResponse) {
      positionFalseAlarms++;
    } else {
      positionCorrectRejections++;
    }

    // Audio scoring
    if (trial.audioMatch && trial.userAudioResponse) {
      audioHits++;
    } else if (trial.audioMatch && !trial.userAudioResponse) {
      audioMisses++;
    } else if (!trial.audioMatch && trial.userAudioResponse) {
      audioFalseAlarms++;
    } else {
      audioCorrectRejections++;
    }
  }

  // Accuracy = (hits + correctRejections) / scoredTrials
  const positionAccuracy = scoredCount > 0
    ? (positionHits + positionCorrectRejections) / scoredCount
    : 0;
  const audioAccuracy = scoredCount > 0
    ? (audioHits + audioCorrectRejections) / scoredCount
    : 0;
  const overallAccuracy = (positionAccuracy + audioAccuracy) / 2;

  // XP calculation
  // baseXP = 10 * trialCount
  // accuracyBonus = floor(overallAccuracy * 50)
  // nLevelBonus = currentN * 20
  const baseXP = 10 * trials.length;
  const accuracyBonus = Math.floor(overallAccuracy * 50);
  const nLevelBonus = nLevel * 20;
  const xpEarned = baseXP + accuracyBonus + nLevelBonus;

  return {
    positionHits,
    positionMisses,
    positionFalseAlarms,
    positionCorrectRejections,
    audioHits,
    audioMisses,
    audioFalseAlarms,
    audioCorrectRejections,
    positionAccuracy,
    audioAccuracy,
    overallAccuracy,
    xpEarned,
    scoredTrials: scoredCount,
  };
}

// ============ HOOK ============

export function useDualNBack({
  onTrialStart,
  onStimulusEnd,
  onTrialEnd,
  onSessionComplete,
}: UseDualNBackOptions): UseDualNBackReturn {
  const [trials, setTrials] = useState<DualNBackTrial[]>([]);
  const [currentTrialIndex, setCurrentTrialIndex] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<TrialPhase>('idle');

  // Refs for timing and callbacks
  const stimulusTimerRef = useRef<number | null>(null);
  const responseTimerRef = useRef<number | null>(null);
  const trialStartTimeRef = useRef<number | null>(null);
  const sessionStartTimeRef = useRef<number | null>(null);

  // Ref to track trials with user responses (avoids stale closure in recursive callbacks)
  const trialsRef = useRef<DualNBackTrial[]>([]);
  // Ref to track the N level for the current session
  const nLevelRef = useRef<number>(1);

  // Keep callback refs updated to avoid stale closures
  const onTrialStartRef = useRef(onTrialStart);
  const onStimulusEndRef = useRef(onStimulusEnd);
  const onTrialEndRef = useRef(onTrialEnd);
  const onSessionCompleteRef = useRef(onSessionComplete);

  useEffect(() => {
    onTrialStartRef.current = onTrialStart;
  }, [onTrialStart]);

  useEffect(() => {
    onStimulusEndRef.current = onStimulusEnd;
  }, [onStimulusEnd]);

  useEffect(() => {
    onTrialEndRef.current = onTrialEnd;
  }, [onTrialEnd]);

  useEffect(() => {
    onSessionCompleteRef.current = onSessionComplete;
  }, [onSessionComplete]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (stimulusTimerRef.current !== null) {
        window.clearTimeout(stimulusTimerRef.current);
      }
      if (responseTimerRef.current !== null) {
        window.clearTimeout(responseTimerRef.current);
      }
    };
  }, []);

  /**
   * Advances to the next trial or completes the session
   */
  const advanceToNextTrial = useCallback((totalTrials: number, nextIndex: number) => {
    if (nextIndex >= totalTrials) {
      // Session complete - read from refs to get trials with user responses
      const finalTrials = trialsRef.current;
      const sessionNLevel = nLevelRef.current;
      setIsRunning(false);
      setPhase('idle');

      const results = calculateResults(finalTrials, sessionNLevel);

      const session: DualNBackSession = {
        id: crypto.randomUUID(),
        nLevel: sessionNLevel,
        trials: finalTrials,
        positionHits: results.positionHits,
        positionMisses: results.positionMisses,
        positionFalseAlarms: results.positionFalseAlarms,
        audioHits: results.audioHits,
        audioMisses: results.audioMisses,
        audioFalseAlarms: results.audioFalseAlarms,
        overallAccuracy: results.overallAccuracy,
        startedAt: sessionStartTimeRef.current ?? Date.now(),
        completedAt: Date.now(),
      };

      onSessionCompleteRef.current?.(session);
      return;
    }

    // Start next trial
    setCurrentTrialIndex(nextIndex);
    setPhase('stimulus');
    trialStartTimeRef.current = Date.now();

    const trial = trialsRef.current[nextIndex];
    onTrialStartRef.current?.(trial, nextIndex);

    // After stimulus duration, switch to response phase
    stimulusTimerRef.current = window.setTimeout(() => {
      setPhase('response');
      onStimulusEndRef.current?.();

      // After response window, end trial
      responseTimerRef.current = window.setTimeout(() => {
        onTrialEndRef.current?.(trialsRef.current[nextIndex], nextIndex);
        advanceToNextTrial(totalTrials, nextIndex + 1);
      }, RESPONSE_WINDOW);
    }, STIMULUS_DURATION);
  }, []);

  /**
   * Starts a new session with the specified number of trials and N level
   */
  const start = useCallback((numTrials: number, sessionNLevel: number) => {
    // Store N level in ref for use during session
    nLevelRef.current = sessionNLevel;

    // Generate fresh trials
    const newTrials = generateTrials(sessionNLevel, numTrials);
    setTrials(newTrials);
    trialsRef.current = newTrials;
    setIsRunning(true);
    sessionStartTimeRef.current = Date.now();

    // Start first trial (pass count, not array - we read from ref)
    advanceToNextTrial(newTrials.length, 0);
  }, [advanceToNextTrial]);

  /**
   * Records a position match response from the user
   */
  const recordPositionResponse = useCallback(() => {
    if (!isRunning || currentTrialIndex < 0) return;

    // Update the ref immediately (used by session completion)
    const trial = trialsRef.current[currentTrialIndex];
    if (!trial.userPositionResponse) {
      trial.userPositionResponse = true;
      if (trial.responseTime === null && trialStartTimeRef.current !== null) {
        trial.responseTime = Date.now() - trialStartTimeRef.current;
      }
    }

    // Also update state for UI consistency
    setTrials(prevTrials => {
      const newTrials = [...prevTrials];
      newTrials[currentTrialIndex] = { ...trial };
      return newTrials;
    });
  }, [isRunning, currentTrialIndex]);

  /**
   * Records an audio match response from the user
   */
  const recordAudioResponse = useCallback(() => {
    if (!isRunning || currentTrialIndex < 0) return;

    // Update the ref immediately (used by session completion)
    const trial = trialsRef.current[currentTrialIndex];
    if (!trial.userAudioResponse) {
      trial.userAudioResponse = true;
      if (trial.responseTime === null && trialStartTimeRef.current !== null) {
        trial.responseTime = Date.now() - trialStartTimeRef.current;
      }
    }

    // Also update state for UI consistency
    setTrials(prevTrials => {
      const newTrials = [...prevTrials];
      newTrials[currentTrialIndex] = { ...trial };
      return newTrials;
    });
  }, [isRunning, currentTrialIndex]);

  /**
   * Returns the current session results
   */
  const getResults = useCallback((): SessionResults => {
    return calculateResults(trials, nLevelRef.current);
  }, [trials]);

  return {
    trials,
    currentTrialIndex,
    isRunning,
    phase,
    start,
    recordPositionResponse,
    recordAudioResponse,
    getResults,
  };
}
