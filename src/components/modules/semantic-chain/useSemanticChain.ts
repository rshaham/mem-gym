import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type { SemanticChainCategory, SemanticChainDifficulty, SemanticChainSession } from '../../../types';
import { isValidWord, getStartingWord, getWordsStartingWith } from '../../../data/categoryWords';
import { calculateXP } from '../../../utils/scoring';

type GamePhase = 'setup' | 'playing' | 'results';

interface UseSemanticChainOptions {
  onSessionComplete?: (session: SemanticChainSession) => void;
}

export interface UseSemanticChainReturn {
  // State
  phase: GamePhase;
  category: SemanticChainCategory;
  difficulty: SemanticChainDifficulty;
  chain: string[];
  currentInput: string;
  timeRemaining: number; // milliseconds
  maxTime: number; // milliseconds
  lastError: string | null;
  isGameOver: boolean;
  gameOverReason: 'timeout' | 'invalid' | 'no-words' | null;

  // Derived
  lastLetter: string;
  chainLength: number;
  availableWordsCount: number;

  // Actions
  startGame: (category: SemanticChainCategory, difficulty: SemanticChainDifficulty) => void;
  setInput: (input: string) => void;
  submitWord: () => void;
  reset: () => void;
}

// Timer settings per difficulty (longer times for mobile typing)
const DIFFICULTY_SETTINGS = {
  easy: {
    baseTime: 15000, // 15 seconds
    decayPerWord: 0, // No decay
    minTime: 15000,
  },
  medium: {
    baseTime: 12000, // 12 seconds
    decayPerWord: 300, // -300ms per word
    minTime: 6000, // Min 6 seconds
  },
  hard: {
    baseTime: 10000, // 10 seconds
    decayPerWord: 400, // -400ms per word
    minTime: 4000, // Min 4 seconds
  },
};

export function useSemanticChain(
  options: UseSemanticChainOptions = {}
): UseSemanticChainReturn {
  const { onSessionComplete } = options;

  // Core state
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [category, setCategory] = useState<SemanticChainCategory>('animals');
  const [difficulty, setDifficulty] = useState<SemanticChainDifficulty>('easy');
  const [chain, setChain] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(5000);
  const [maxTime, setMaxTime] = useState(5000);
  const [lastError, setLastError] = useState<string | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState<'timeout' | 'invalid' | 'no-words' | null>(null);
  const [startedAt, setStartedAt] = useState<number>(0);

  // Refs
  const timerRef = useRef<number | null>(null);
  const onSessionCompleteRef = useRef(onSessionComplete);

  // Keep callback ref updated
  useEffect(() => {
    onSessionCompleteRef.current = onSessionComplete;
  }, [onSessionComplete]);

  // Derived values
  const lastWord = chain[chain.length - 1] || '';
  const lastLetter = lastWord ? lastWord.slice(-1).toUpperCase() : '';
  const chainLength = chain.length;

  // Count available words that can continue the chain
  const availableWordsCount = useMemo(() => {
    if (!lastWord) return 0;
    const available = getWordsStartingWith(lastWord.slice(-1), category, chain);
    return available.length;
  }, [lastWord, category, chain]);

  // Calculate current max time based on chain length and difficulty
  const calculateMaxTime = useCallback((length: number, diff: SemanticChainDifficulty): number => {
    const settings = DIFFICULTY_SETTINGS[diff];
    const time = settings.baseTime - (length * settings.decayPerWord);
    return Math.max(time, settings.minTime);
  }, []);

  // End the game
  const endGame = useCallback((reason: 'timeout' | 'invalid' | 'no-words') => {
    // Stop the timer
    if (timerRef.current !== null) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }

    setIsGameOver(true);
    setGameOverReason(reason);

    // Calculate XP: base + (chainLength * 3) * difficultyMultiplier
    // The calculateXP function uses "accuracy" parameter for chain length
    const xpEarned = calculateXP('semantic-chain', chainLength, difficulty);

    // Create session
    const session: SemanticChainSession = {
      id: crypto.randomUUID(),
      category,
      difficulty,
      chainLength,
      wordsUsed: chain,
      startedAt,
      completedAt: Date.now(),
      xpEarned,
    };

    // Short delay before showing results
    setTimeout(() => {
      setPhase('results');
      onSessionCompleteRef.current?.(session);
    }, 1000);
  }, [category, difficulty, chainLength, chain, startedAt]);

  // Timer effect
  useEffect(() => {
    if (phase !== 'playing' || isGameOver) {
      return;
    }

    let lastTime = performance.now();

    const tick = (currentTime: number) => {
      const delta = currentTime - lastTime;
      lastTime = currentTime;

      setTimeRemaining(prev => {
        const newTime = prev - delta;
        if (newTime <= 0) {
          endGame('timeout');
          return 0;
        }
        return newTime;
      });

      timerRef.current = requestAnimationFrame(tick);
    };

    timerRef.current = requestAnimationFrame(tick);

    return () => {
      if (timerRef.current !== null) {
        cancelAnimationFrame(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [phase, isGameOver, endGame]);

  // Start a new game
  const startGame = useCallback((cat: SemanticChainCategory, diff: SemanticChainDifficulty) => {
    setCategory(cat);
    setDifficulty(diff);

    // Get a starting word
    const startWord = getStartingWord(cat);
    setChain([startWord]);

    // Set initial timer
    const initialMaxTime = calculateMaxTime(1, diff);
    setMaxTime(initialMaxTime);
    setTimeRemaining(initialMaxTime);

    // Reset other state
    setCurrentInput('');
    setLastError(null);
    setIsGameOver(false);
    setGameOverReason(null);
    setStartedAt(Date.now());

    setPhase('playing');
  }, [calculateMaxTime]);

  // Set input
  const setInputHandler = useCallback((input: string) => {
    setCurrentInput(input.toLowerCase());
    // Clear error when user starts typing
    if (lastError) {
      setLastError(null);
    }
  }, [lastError]);

  // Submit a word
  const submitWord = useCallback(() => {
    if (isGameOver || phase !== 'playing') return;

    const word = currentInput.trim().toLowerCase();

    // Check if empty
    if (!word) {
      setLastError('Enter a word');
      return;
    }

    // Check if starts with correct letter
    const requiredLetter = lastWord.slice(-1).toLowerCase();
    if (!word.startsWith(requiredLetter)) {
      setLastError(`Must start with "${requiredLetter.toUpperCase()}"`);
      endGame('invalid');
      return;
    }

    // Check if already used
    if (chain.includes(word)) {
      setLastError('Already used!');
      endGame('invalid');
      return;
    }

    // Check if valid word in category
    if (!isValidWord(word, category)) {
      setLastError('Not in category');
      endGame('invalid');
      return;
    }

    // Valid word! Add to chain
    const newChain = [...chain, word];
    setChain(newChain);
    setCurrentInput('');
    setLastError(null);

    // Check if there are any possible continuations
    const nextLetter = word.slice(-1);
    const availableNext = getWordsStartingWith(nextLetter, category, newChain);
    if (availableNext.length === 0) {
      // No more words available - game ends but player gets credit
      endGame('no-words');
      return;
    }

    // Reset timer with potentially reduced time
    const newMaxTime = calculateMaxTime(newChain.length, difficulty);
    setMaxTime(newMaxTime);
    setTimeRemaining(newMaxTime);
  }, [currentInput, lastWord, chain, category, isGameOver, phase, calculateMaxTime, difficulty, endGame]);

  // Reset game
  const reset = useCallback(() => {
    if (timerRef.current !== null) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }
    setPhase('setup');
    setChain([]);
    setCurrentInput('');
    setTimeRemaining(5000);
    setMaxTime(5000);
    setLastError(null);
    setIsGameOver(false);
    setGameOverReason(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        cancelAnimationFrame(timerRef.current);
      }
    };
  }, []);

  return {
    phase,
    category,
    difficulty,
    chain,
    currentInput,
    timeRemaining,
    maxTime,
    lastError,
    isGameOver,
    gameOverReason,
    lastLetter,
    chainLength,
    availableWordsCount,
    startGame,
    setInput: setInputHandler,
    submitWord,
    reset,
  };
}
