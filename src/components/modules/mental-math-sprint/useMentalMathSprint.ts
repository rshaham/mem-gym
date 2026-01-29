import { useState, useRef, useCallback, useEffect } from 'react';
import type {
  MentalMathSprintDifficulty,
  MentalMathProblem,
  MentalMathStep,
  MentalMathOperation,
  MentalMathSprintSession,
} from '../../../types';

// ============ CONSTANTS ============

interface DifficultyConfig {
  operations: MentalMathOperation[];
  numberRange: { min: number; max: number };
  chainLength: { min: number; max: number };
  timePerProblem: number; // milliseconds
  allowNegativeResults: boolean;
  useExpressions?: boolean; // For expert mode with PEMDAS
}

const DIFFICULTY_CONFIG: Record<MentalMathSprintDifficulty, DifficultyConfig> = {
  easy: {
    operations: ['+', '-'],
    numberRange: { min: 1, max: 10 },
    chainLength: { min: 2, max: 3 },
    timePerProblem: 15000,
    allowNegativeResults: false,
  },
  medium: {
    operations: ['+', '-', '*'],
    numberRange: { min: 1, max: 15 },
    chainLength: { min: 3, max: 4 },
    timePerProblem: 12000,
    allowNegativeResults: true,
  },
  hard: {
    operations: ['+', '-', '*', '/'],
    numberRange: { min: 1, max: 20 },
    chainLength: { min: 4, max: 5 },
    timePerProblem: 10000,
    allowNegativeResults: true,
  },
  expert: {
    operations: ['+', '-', '*', '/'],
    numberRange: { min: 1, max: 12 },
    chainLength: { min: 3, max: 4 }, // number of terms
    timePerProblem: 12000,
    allowNegativeResults: false,
    useExpressions: true,
  },
};

// ============ TYPES ============

interface UseMentalMathSprintOptions {
  onProblemStart?: (problem: MentalMathProblem, index: number) => void;
  onProblemEnd?: (problem: MentalMathProblem, index: number, correct: boolean) => void;
  onSessionComplete?: (session: MentalMathSprintSession) => void;
}

interface UseMentalMathSprintReturn {
  problems: MentalMathProblem[];
  currentProblemIndex: number;
  currentProblem: MentalMathProblem | null;
  isRunning: boolean;
  timeLeft: number;
  currentStreak: number;
  bestStreak: number;
  userInput: string;
  difficulty: MentalMathSprintDifficulty | null;
  totalCorrect: number;
  start: (difficulty: MentalMathSprintDifficulty, problemCount: number) => void;
  submitAnswer: () => void;
  inputDigit: (digit: number) => void;
  toggleNegative: () => void;
  clearInput: () => void;
  reset: () => void;
}

// ============ HELPER FUNCTIONS ============

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Gets divisors of a number that are within a range
 */
function getDivisors(n: number, min: number, max: number): number[] {
  const divisors: number[] = [];
  for (let i = min; i <= max; i++) {
    if (i !== 0 && n % i === 0) {
      divisors.push(i);
    }
  }
  return divisors;
}

/**
 * Format operation for display (using proper math symbols)
 */
function formatOp(op: MentalMathOperation): string {
  switch (op) {
    case '+': return '+';
    case '-': return '−';
    case '*': return '×';
    case '/': return '÷';
  }
}

/**
 * Evaluate a simple binary operation
 */
function evaluate(a: number, op: MentalMathOperation, b: number): number {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return a / b;
  }
}

/**
 * Generates an expression problem for expert mode (PEMDAS with parentheses)
 */
function generateExpressionProblem(config: DifficultyConfig): MentalMathProblem {
  const { numberRange } = config;
  const maxAttempts = 50;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Pick a pattern: leftGroup "(a op b) op c" or rightGroup "a op (b op c)"
    const useLeftGroup = Math.random() < 0.5;
    const useFourTerms = Math.random() < 0.3; // 30% chance for 4 terms

    // Generate numbers
    const a = randomInt(numberRange.min, numberRange.max);
    const b = randomInt(numberRange.min, numberRange.max);
    const c = randomInt(numberRange.min, numberRange.max);
    const d = useFourTerms ? randomInt(numberRange.min, numberRange.max) : 0;

    // Pick operations (prefer * and / inside parentheses for meaningful PEMDAS)
    const ops: MentalMathOperation[] = ['+', '-', '*', '/'];
    const addSubOps: MentalMathOperation[] = ['+', '-'];
    const innerOp = pickRandom(ops);
    const outerOp = pickRandom(ops.filter(o => o !== innerOp || Math.random() < 0.3));
    const extraOp: MentalMathOperation = useFourTerms ? pickRandom(addSubOps) : '+';

    let result: number;
    let expression: string;
    let displayExpression: string;
    let innerResult: number;

    try {
      if (useLeftGroup) {
        // (a op b) op c [op d]
        innerResult = evaluate(a, innerOp, b);
        if (!Number.isInteger(innerResult) || innerResult <= 0 || innerResult > 100) continue;

        let temp = evaluate(innerResult, outerOp, c);
        if (!Number.isInteger(temp) || temp <= 0 || temp > 100) continue;

        if (useFourTerms) {
          result = evaluate(temp, extraOp, d);
          if (!Number.isInteger(result) || result <= 0 || result > 100) continue;
          expression = `(${a} ${innerOp} ${b}) ${outerOp} ${c} ${extraOp} ${d}`;
          displayExpression = `(${a} ${formatOp(innerOp)} ${b}) ${formatOp(outerOp)} ${c} ${formatOp(extraOp)} ${d}`;
        } else {
          result = temp;
          expression = `(${a} ${innerOp} ${b}) ${outerOp} ${c}`;
          displayExpression = `(${a} ${formatOp(innerOp)} ${b}) ${formatOp(outerOp)} ${c}`;
        }
      } else {
        // a op (b op c) [op d]
        innerResult = evaluate(b, innerOp, c);
        if (!Number.isInteger(innerResult) || innerResult <= 0 || innerResult > 100) continue;

        let temp = evaluate(a, outerOp, innerResult);
        if (!Number.isInteger(temp) || temp <= 0 || temp > 100) continue;

        if (useFourTerms) {
          result = evaluate(temp, extraOp, d);
          if (!Number.isInteger(result) || result <= 0 || result > 100) continue;
          expression = `${a} ${outerOp} (${b} ${innerOp} ${c}) ${extraOp} ${d}`;
          displayExpression = `${a} ${formatOp(outerOp)} (${b} ${formatOp(innerOp)} ${c}) ${formatOp(extraOp)} ${d}`;
        } else {
          result = temp;
          expression = `${a} ${outerOp} (${b} ${innerOp} ${c})`;
          displayExpression = `${a} ${formatOp(outerOp)} (${b} ${formatOp(innerOp)} ${c})`;
        }
      }

      // Avoid trivial results
      if (result === a || result === b || result === c) continue;

      return {
        id: crypto.randomUUID(),
        startValue: 0, // Not used for expressions
        operations: [], // Not used for expressions
        correctAnswer: result,
        userAnswer: null,
        isCorrect: null,
        timeToAnswer: null,
        timedOut: false,
        expression,
        displayExpression,
      };
    } catch {
      continue;
    }
  }

  // Fallback to a simple expression if we couldn't generate a valid one
  const a = randomInt(2, 10);
  const b = randomInt(2, 5);
  const c = randomInt(1, 5);
  const result = (a + b) * c;
  return {
    id: crypto.randomUUID(),
    startValue: 0,
    operations: [],
    correctAnswer: result,
    userAnswer: null,
    isCorrect: null,
    timeToAnswer: null,
    timedOut: false,
    expression: `(${a} + ${b}) * ${c}`,
    displayExpression: `(${a} + ${b}) × ${c}`,
  };
}

/**
 * Generates a single problem with the given difficulty settings
 */
function generateProblem(config: DifficultyConfig): MentalMathProblem {
  const { operations, numberRange, chainLength, allowNegativeResults } = config;
  const numSteps = randomInt(chainLength.min, chainLength.max);

  // Generate start value
  let startValue = randomInt(numberRange.min, numberRange.max);
  const steps: MentalMathStep[] = [];
  let currentResult = startValue;

  for (let i = 0; i < numSteps; i++) {
    let operation: MentalMathOperation;
    let operand: number;
    let nextResult: number;
    let attempts = 0;
    const maxAttempts = 20;

    do {
      attempts++;
      operation = pickRandom(operations);

      if (operation === '/') {
        // For division, pick a valid divisor
        const divisors = getDivisors(currentResult, 2, Math.min(currentResult, numberRange.max));
        if (divisors.length === 0) {
          // Can't divide, try another operation
          operation = pickRandom(operations.filter(op => op !== '/'));
        }
        if (operation === '/') {
          operand = pickRandom(divisors);
        } else {
          operand = randomInt(1, numberRange.max);
        }
      } else {
        // For other operations, avoid trivial ones
        operand = randomInt(1, numberRange.max);
        if (operation === '*' && operand === 1) {
          operand = randomInt(2, numberRange.max);
        }
      }

      // Calculate result
      switch (operation) {
        case '+':
          nextResult = currentResult + operand;
          break;
        case '-':
          nextResult = currentResult - operand;
          break;
        case '*':
          nextResult = currentResult * operand;
          break;
        case '/':
          nextResult = currentResult / operand;
          break;
      }

      // Validate result
      const isValid =
        (allowNegativeResults || nextResult >= 0) &&
        nextResult >= -99 &&
        nextResult <= 999 &&
        Number.isInteger(nextResult);

      if (isValid) break;
    } while (attempts < maxAttempts);

    // If we couldn't find a valid operation, use simple addition
    if (attempts >= maxAttempts) {
      operation = '+';
      operand = randomInt(1, 5);
      nextResult = currentResult + operand;
    }

    steps.push({
      operation,
      operand,
      intermediateResult: nextResult,
    });

    currentResult = nextResult;
  }

  return {
    id: crypto.randomUUID(),
    startValue,
    operations: steps,
    correctAnswer: currentResult,
    userAnswer: null,
    isCorrect: null,
    timeToAnswer: null,
    timedOut: false,
  };
}

/**
 * Generates all problems for a session
 */
function generateProblems(difficulty: MentalMathSprintDifficulty, count: number): MentalMathProblem[] {
  const config = DIFFICULTY_CONFIG[difficulty];
  const problems: MentalMathProblem[] = [];

  for (let i = 0; i < count; i++) {
    if (config.useExpressions) {
      problems.push(generateExpressionProblem(config));
    } else {
      problems.push(generateProblem(config));
    }
  }

  return problems;
}

// ============ HOOK ============

export function useMentalMathSprint({
  onProblemStart,
  onProblemEnd,
  onSessionComplete,
}: UseMentalMathSprintOptions = {}): UseMentalMathSprintReturn {
  const [problems, setProblems] = useState<MentalMathProblem[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [difficulty, setDifficulty] = useState<MentalMathSprintDifficulty | null>(null);
  const [totalCorrect, setTotalCorrect] = useState(0);

  // Refs for timing
  const timerRef = useRef<number | null>(null);
  const problemStartTimeRef = useRef<number | null>(null);
  const sessionStartTimeRef = useRef<number | null>(null);
  const problemsRef = useRef<MentalMathProblem[]>([]);

  // Keep callback refs updated
  const onProblemStartRef = useRef(onProblemStart);
  const onProblemEndRef = useRef(onProblemEnd);
  const onSessionCompleteRef = useRef(onSessionComplete);

  useEffect(() => {
    onProblemStartRef.current = onProblemStart;
  }, [onProblemStart]);

  useEffect(() => {
    onProblemEndRef.current = onProblemEnd;
  }, [onProblemEnd]);

  useEffect(() => {
    onSessionCompleteRef.current = onSessionComplete;
  }, [onSessionComplete]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  /**
   * Complete the current session
   */
  const completeSession = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsRunning(false);

    const currentDifficulty = difficultyRef.current;
    const finalProblems = problemsRef.current;
    const correctAnswers = finalProblems.filter(p => p.isCorrect === true).length;
    const answeredProblems = finalProblems.filter(p => p.isCorrect !== null);
    const totalTime = answeredProblems.reduce((sum, p) => sum + (p.timeToAnswer || 0), 0);
    const averageTime = answeredProblems.length > 0 ? totalTime / answeredProblems.length : 0;

    const accuracy = finalProblems.length > 0 ? (correctAnswers / finalProblems.length) * 100 : 0;

    // Calculate XP
    const baseXP = 10 * correctAnswers;
    const difficultyMultipliers: Record<MentalMathSprintDifficulty, number> = {
      easy: 1,
      medium: 1.5,
      hard: 2,
      expert: 2.5,
    };
    const difficultyMultiplier = difficultyMultipliers[currentDifficulty!];
    const accuracyBonus = Math.floor(accuracy / 5);
    const streakBonus = Math.min(bestStreak * 2, 20);
    const sessionBonus = 25;
    const perfectBonus = accuracy === 100 ? 50 : 0;
    const xpEarned = Math.floor((baseXP + accuracyBonus + streakBonus + sessionBonus + perfectBonus) * difficultyMultiplier);

    const session: MentalMathSprintSession = {
      id: crypto.randomUUID(),
      difficulty: currentDifficulty!,
      problems: finalProblems,
      totalCorrect: correctAnswers,
      totalProblems: finalProblems.length,
      accuracy,
      bestStreak,
      averageTime,
      startedAt: sessionStartTimeRef.current ?? Date.now(),
      completedAt: Date.now(),
      xpEarned,
    };

    onSessionCompleteRef.current?.(session);
  }, [bestStreak]);

  // Ref to store current difficulty for use in callbacks
  const difficultyRef = useRef<MentalMathSprintDifficulty | null>(null);

  /**
   * Advance to the next problem or complete session
   */
  const advanceToProblem = useCallback((index: number) => {
    if (index >= problemsRef.current.length) {
      completeSession();
      return;
    }

    const currentDifficulty = difficultyRef.current;
    if (!currentDifficulty) return;

    setCurrentProblemIndex(index);
    setUserInput('');
    problemStartTimeRef.current = Date.now();

    const config = DIFFICULTY_CONFIG[currentDifficulty];
    setTimeLeft(config.timePerProblem);

    // Start timer
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
    }

    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 100;
        if (newTime <= 0) {
          // Time's up - mark as wrong and advance
          window.clearInterval(timerRef.current!);
          timerRef.current = null;

          const problem = problemsRef.current[index];
          problem.timedOut = true;
          problem.isCorrect = false;
          problem.timeToAnswer = config.timePerProblem;

          setCurrentStreak(0);
          onProblemEndRef.current?.(problem, index, false);

          // Use setTimeout to avoid state update during render
          setTimeout(() => advanceToProblem(index + 1), 500);
          return 0;
        }
        return newTime;
      });
    }, 100);

    onProblemStartRef.current?.(problemsRef.current[index], index);
  }, [completeSession]);

  /**
   * Start a new session
   */
  const start = useCallback((diff: MentalMathSprintDifficulty, problemCount: number) => {
    const newProblems = generateProblems(diff, problemCount);
    setProblems(newProblems);
    problemsRef.current = newProblems;
    difficultyRef.current = diff; // Set ref immediately before advanceToProblem
    setDifficulty(diff);
    setCurrentStreak(0);
    setBestStreak(0);
    setTotalCorrect(0);
    setIsRunning(true);
    sessionStartTimeRef.current = Date.now();

    advanceToProblem(0);
  }, [advanceToProblem]);

  /**
   * Submit the current answer
   */
  const submitAnswer = useCallback(() => {
    if (!isRunning || currentProblemIndex < 0 || userInput === '') return;

    // Stop timer
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const problem = problemsRef.current[currentProblemIndex];
    const userAnswer = parseInt(userInput, 10);
    const isCorrect = userAnswer === problem.correctAnswer;
    const timeToAnswer = problemStartTimeRef.current
      ? Date.now() - problemStartTimeRef.current
      : 0;

    // Update problem
    problem.userAnswer = userAnswer;
    problem.isCorrect = isCorrect;
    problem.timeToAnswer = timeToAnswer;

    // Update streak
    if (isCorrect) {
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      setBestStreak(prev => Math.max(prev, newStreak));
      setTotalCorrect(prev => prev + 1);
    } else {
      setCurrentStreak(0);
    }

    onProblemEndRef.current?.(problem, currentProblemIndex, isCorrect);

    // Wait a moment to show feedback, then advance
    setTimeout(() => advanceToProblem(currentProblemIndex + 1), 500);
  }, [isRunning, currentProblemIndex, userInput, currentStreak, advanceToProblem]);

  /**
   * Input a digit
   */
  const inputDigit = useCallback((digit: number) => {
    if (!isRunning) return;
    setUserInput(prev => {
      // Limit to 4 characters (-999 to 999)
      if (prev.length >= 4) return prev;
      // Handle leading zero
      if (prev === '0') return String(digit);
      // Handle negative with leading zero
      if (prev === '-0') return `-${digit}`;
      return prev + digit;
    });
  }, [isRunning]);

  /**
   * Toggle negative sign
   */
  const toggleNegative = useCallback(() => {
    if (!isRunning) return;
    setUserInput(prev => {
      if (prev.startsWith('-')) {
        return prev.slice(1);
      }
      return '-' + prev;
    });
  }, [isRunning]);

  /**
   * Clear input
   */
  const clearInput = useCallback(() => {
    if (!isRunning) return;
    setUserInput(prev => {
      if (prev.length <= 1) return '';
      return prev.slice(0, -1);
    });
  }, [isRunning]);

  /**
   * Reset the game
   */
  const reset = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setProblems([]);
    problemsRef.current = [];
    difficultyRef.current = null;
    setCurrentProblemIndex(-1);
    setIsRunning(false);
    setTimeLeft(0);
    setCurrentStreak(0);
    setBestStreak(0);
    setUserInput('');
    setDifficulty(null);
    setTotalCorrect(0);
  }, []);

  const currentProblem = currentProblemIndex >= 0 && currentProblemIndex < problems.length
    ? problems[currentProblemIndex]
    : null;

  return {
    problems,
    currentProblemIndex,
    currentProblem,
    isRunning,
    timeLeft,
    currentStreak,
    bestStreak,
    userInput,
    difficulty,
    totalCorrect,
    start,
    submitAnswer,
    inputDigit,
    toggleNegative,
    clearInput,
    reset,
  };
}

export { DIFFICULTY_CONFIG };
