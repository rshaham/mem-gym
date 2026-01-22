/**
 * Echo Chamber game state hook.
 * Manages the complete game flow for the Echo Chamber memory training module.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import type {
  EchoChamberDifficulty,
  EchoChamberMode,
  EchoChamberRound,
  EchoChamberSession,
} from '../../../types';
import { calculateSimilarity, wordLevelComparison } from '../../../utils/levenshtein';
import { getSessionSentences, getSilenceDuration } from '../../../utils/echoChamberService';

// ============ TYPES ============

export type EchoChamberPhase =
  | 'setup'
  | 'presenting'
  | 'silence'
  | 'recall'
  | 'feedback'
  | 'results';

interface UseEchoChamberOptions {
  onSessionComplete?: (session: EchoChamberSession) => void;
}

export interface UseEchoChamberReturn {
  phase: EchoChamberPhase;
  difficulty: EchoChamberDifficulty;
  mode: EchoChamberMode;
  currentRound: number;
  totalRounds: number;
  currentSentence: string;
  silenceTimeLeft: number;
  recallTimeLeft: number;
  lastRoundResult: EchoChamberRound | null;
  rounds: EchoChamberRound[];

  startSession: (
    difficulty: EchoChamberDifficulty,
    mode: EchoChamberMode,
    sessionLength: number
  ) => void;
  finishPresenting: () => void;
  submitRecall: (text: string) => void;
  nextRound: () => void;
  reset: () => void;
}

// ============ CONSTANTS ============

const RECALL_TIME_LIMIT = 30000; // 30 seconds in milliseconds
const TIMER_INTERVAL = 100; // Update timer every 100ms
const SPEED_BONUS_THRESHOLD = 10000; // 10 seconds in milliseconds
const SPEED_BONUS_XP = 5;

const DIFFICULTY_MULTIPLIER: Record<EchoChamberDifficulty, number> = {
  easy: 1,
  medium: 1.5,
  hard: 2,
  expert: 3,
};

// ============ HELPER FUNCTIONS ============

/**
 * Calculates XP earned for a session.
 * Base XP = average score * difficulty multiplier
 * Speed bonus: +5 XP per round if recalled under 10 seconds
 */
function calculateXP(
  rounds: EchoChamberRound[],
  difficulty: EchoChamberDifficulty
): number {
  if (rounds.length === 0) return 0;

  const averageScore =
    rounds.reduce((sum, round) => sum + round.score, 0) / rounds.length;

  const multiplier = DIFFICULTY_MULTIPLIER[difficulty];
  const baseXP = Math.round(averageScore * multiplier);

  const speedBonuses = rounds.filter(
    (round) => round.timeToRecall < SPEED_BONUS_THRESHOLD
  ).length;
  const speedBonusXP = speedBonuses * SPEED_BONUS_XP;

  return baseXP + speedBonusXP;
}

/**
 * Speaks a sentence using Web Speech API (TTS).
 * Returns a promise that resolves when speech is complete.
 */
function speakSentence(sentence: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Speech synthesis not supported'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(event.error);

    window.speechSynthesis.speak(utterance);
  });
}

// ============ HOOK ============

export function useEchoChamber({
  onSessionComplete,
}: UseEchoChamberOptions = {}): UseEchoChamberReturn {
  // Session configuration
  const [phase, setPhase] = useState<EchoChamberPhase>('setup');
  const [difficulty, setDifficulty] = useState<EchoChamberDifficulty>('easy');
  const [mode, setMode] = useState<EchoChamberMode>('visual');
  const [totalRounds, setTotalRounds] = useState(0);

  // Round state
  const [currentRound, setCurrentRound] = useState(0);
  const [currentSentence, setCurrentSentence] = useState('');
  const [silenceTimeLeft, setSilenceTimeLeft] = useState(0);
  const [recallTimeLeft, setRecallTimeLeft] = useState(0);
  const [lastRoundResult, setLastRoundResult] = useState<EchoChamberRound | null>(null);
  const [rounds, setRounds] = useState<EchoChamberRound[]>([]);

  // Internal refs
  const sentencesRef = useRef<string[]>([]);
  const recallStartTimeRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const recallTimerRef = useRef<number | null>(null);
  const onSessionCompleteRef = useRef(onSessionComplete);

  // Keep callback ref updated
  useEffect(() => {
    onSessionCompleteRef.current = onSessionComplete;
  }, [onSessionComplete]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current !== null) {
        window.clearInterval(silenceTimerRef.current);
      }
      if (recallTimerRef.current !== null) {
        window.clearInterval(recallTimerRef.current);
      }
      // Cancel any ongoing speech
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  /**
   * Clears all active timers.
   */
  const clearTimers = useCallback(() => {
    if (silenceTimerRef.current !== null) {
      window.clearInterval(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recallTimerRef.current !== null) {
      window.clearInterval(recallTimerRef.current);
      recallTimerRef.current = null;
    }
  }, []);

  /**
   * Starts the silence phase countdown.
   */
  const startSilencePhase = useCallback(() => {
    const silenceDuration = getSilenceDuration(difficulty) * 1000; // Convert to ms
    const startTime = Date.now();

    setSilenceTimeLeft(silenceDuration);
    setPhase('silence');

    silenceTimerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, silenceDuration - elapsed);
      setSilenceTimeLeft(remaining);

      if (remaining <= 0) {
        if (silenceTimerRef.current !== null) {
          window.clearInterval(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
        // Start recall phase
        startRecallPhase();
      }
    }, TIMER_INTERVAL);
  }, [difficulty]);

  /**
   * Starts the recall phase countdown.
   */
  const startRecallPhase = useCallback(() => {
    const startTime = Date.now();
    recallStartTimeRef.current = startTime;

    setRecallTimeLeft(RECALL_TIME_LIMIT);
    setPhase('recall');

    recallTimerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, RECALL_TIME_LIMIT - elapsed);
      setRecallTimeLeft(remaining);

      if (remaining <= 0) {
        if (recallTimerRef.current !== null) {
          window.clearInterval(recallTimerRef.current);
          recallTimerRef.current = null;
        }
        // Time's up - auto-submit empty response
        submitRecallInternal('');
      }
    }, TIMER_INTERVAL);
  }, []);

  /**
   * Completes the current session and calls the completion callback.
   */
  const completeSession = useCallback((finalRounds: EchoChamberRound[]) => {
    const totalScore =
      finalRounds.length > 0
        ? Math.round(
            finalRounds.reduce((sum, round) => sum + round.score, 0) /
              finalRounds.length
          )
        : 0;

    const xpEarned = calculateXP(finalRounds, difficulty);

    const session: EchoChamberSession = {
      id: crypto.randomUUID(),
      difficulty,
      mode,
      sessionLength: totalRounds,
      rounds: finalRounds,
      totalScore,
      xpEarned,
      completedAt: Date.now(),
    };

    setPhase('results');
    onSessionCompleteRef.current?.(session);
  }, [difficulty, mode, totalRounds]);

  /**
   * Internal function to handle recall submission.
   */
  const submitRecallInternal = useCallback(
    (text: string) => {
      // Clear recall timer
      if (recallTimerRef.current !== null) {
        window.clearInterval(recallTimerRef.current);
        recallTimerRef.current = null;
      }

      const sentence = sentencesRef.current[currentRound];
      const timeToRecall = recallStartTimeRef.current
        ? Date.now() - recallStartTimeRef.current
        : RECALL_TIME_LIMIT;

      const score = calculateSimilarity(sentence, text);
      const wordComparison = wordLevelComparison(sentence, text);

      const roundResult: EchoChamberRound = {
        sentence,
        recalledText: text,
        score,
        timeToRecall,
        wordComparison,
      };

      setLastRoundResult(roundResult);
      setRounds((prev) => [...prev, roundResult]);
      setPhase('feedback');
    },
    [currentRound]
  );

  /**
   * Starts a new game session.
   */
  const startSession = useCallback(
    (
      newDifficulty: EchoChamberDifficulty,
      newMode: EchoChamberMode,
      sessionLength: number
    ) => {
      // Reset all state
      clearTimers();
      setDifficulty(newDifficulty);
      setMode(newMode);
      setTotalRounds(sessionLength);
      setCurrentRound(0);
      setRounds([]);
      setLastRoundResult(null);

      // Get sentences for the session
      const sentences = getSessionSentences(newDifficulty, sessionLength);
      sentencesRef.current = sentences;

      // Start first round
      setCurrentSentence(sentences[0]);
      setPhase('presenting');

      // If audio mode, speak the sentence
      if (newMode === 'audio') {
        speakSentence(sentences[0])
          .then(() => {
            // Start silence phase after speech completes
            startSilencePhase();
          })
          .catch((error) => {
            console.error('Speech synthesis error:', error);
            // Fallback: just start silence phase
            startSilencePhase();
          });
      }
    },
    [clearTimers, startSilencePhase]
  );

  /**
   * Called when sentence presentation is complete (for visual mode).
   */
  const finishPresenting = useCallback(() => {
    if (phase !== 'presenting') return;

    // In audio mode, this is handled by speech completion
    if (mode === 'audio') return;

    startSilencePhase();
  }, [phase, mode, startSilencePhase]);

  /**
   * Submits the user's recall attempt.
   */
  const submitRecall = useCallback(
    (text: string) => {
      if (phase !== 'recall') return;
      submitRecallInternal(text);
    },
    [phase, submitRecallInternal]
  );

  /**
   * Advances to the next round or completes the session.
   */
  const nextRound = useCallback(() => {
    if (phase !== 'feedback') return;

    const nextRoundIndex = currentRound + 1;

    if (nextRoundIndex >= totalRounds) {
      // Session complete
      completeSession([...rounds, lastRoundResult!]);
      return;
    }

    // Start next round
    setCurrentRound(nextRoundIndex);
    const nextSentence = sentencesRef.current[nextRoundIndex];
    setCurrentSentence(nextSentence);
    setLastRoundResult(null);
    setPhase('presenting');

    // If audio mode, speak the sentence
    if (mode === 'audio') {
      speakSentence(nextSentence)
        .then(() => {
          startSilencePhase();
        })
        .catch((error) => {
          console.error('Speech synthesis error:', error);
          startSilencePhase();
        });
    }
  }, [
    phase,
    currentRound,
    totalRounds,
    rounds,
    lastRoundResult,
    mode,
    startSilencePhase,
    completeSession,
  ]);

  /**
   * Resets the game to the setup phase.
   */
  const reset = useCallback(() => {
    clearTimers();

    // Cancel any ongoing speech
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setPhase('setup');
    setDifficulty('easy');
    setMode('visual');
    setTotalRounds(0);
    setCurrentRound(0);
    setCurrentSentence('');
    setSilenceTimeLeft(0);
    setRecallTimeLeft(0);
    setLastRoundResult(null);
    setRounds([]);
    sentencesRef.current = [];
  }, [clearTimers]);

  return {
    phase,
    difficulty,
    mode,
    currentRound,
    totalRounds,
    currentSentence,
    silenceTimeLeft,
    recallTimeLeft,
    lastRoundResult,
    rounds,

    startSession,
    finishPresenting,
    submitRecall,
    nextRound,
    reset,
  };
}
