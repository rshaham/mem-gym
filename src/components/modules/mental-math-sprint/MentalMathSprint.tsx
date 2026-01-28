import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../../context/GameContext';
import { useMentalMathSprint, DIFFICULTY_CONFIG } from './useMentalMathSprint';
import { GameSetup } from './GameSetup';
import { SessionResults } from './SessionResults';
import { ProblemDisplay } from './ProblemDisplay';
import { NumberPad } from './NumberPad';
import { TimerDisplay } from './TimerDisplay';
import { StreakIndicator } from './StreakIndicator';
import { ChevronLeftIcon } from '../../icons';
import type { MentalMathSprintDifficulty, MentalMathSprintSession } from '../../../types';

type GamePhase = 'setup' | 'active' | 'results';

export function MentalMathSprint(): JSX.Element {
  const navigate = useNavigate();
  const { progress, addXP, updateMentalMathSprintStats, checkAndQueueAchievements } = useGame();

  const [phase, setPhase] = useState<GamePhase>('setup');
  const [completedSession, setCompletedSession] = useState<MentalMathSprintSession | null>(null);

  // Handle session completion
  const handleSessionComplete = useCallback((session: MentalMathSprintSession) => {
    // Set UI state FIRST
    setCompletedSession(session);
    setPhase('results');

    // Update stats in try-catch (don't block UI)
    try {
      addXP(session.xpEarned);

      updateMentalMathSprintStats({
        totalSessions: 1,
        totalProblems: session.totalProblems,
        averageAccuracy: session.accuracy,
        bestAccuracy: session.accuracy,
        averageTimePerProblem: session.averageTime,
        bestStreak: session.bestStreak,
        currentDifficulty: session.difficulty,
      });

      checkAndQueueAchievements(session.accuracy);
    } catch (error) {
      console.error('Error saving Mental Math Sprint stats:', error);
    }
  }, [addXP, updateMentalMathSprintStats, checkAndQueueAchievements]);

  // Initialize the game hook
  const {
    currentProblem,
    currentProblemIndex,
    problems,
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
  } = useMentalMathSprint({
    onSessionComplete: handleSessionComplete,
  });

  // Handle start
  const handleStart = useCallback((diff: MentalMathSprintDifficulty, problemCount: number) => {
    start(diff, problemCount);
    setPhase('active');
  }, [start]);

  // Handle exit
  const handleExit = useCallback(() => {
    reset();
    navigate('/');
  }, [reset, navigate]);

  // Handle play again
  const handlePlayAgain = useCallback(() => {
    setCompletedSession(null);
    setPhase('setup');
    reset();
  }, [reset]);

  // Keyboard support
  useEffect(() => {
    if (phase !== 'active' || !isRunning) return;

    function handleKeyDown(e: KeyboardEvent): void {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key;

      if (key >= '0' && key <= '9') {
        e.preventDefault();
        inputDigit(parseInt(key, 10));
      } else if (key === '-') {
        e.preventDefault();
        toggleNegative();
      } else if (key === 'Backspace') {
        e.preventDefault();
        clearInput();
      } else if (key === 'Enter') {
        e.preventDefault();
        submitAnswer();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, isRunning, inputDigit, toggleNegative, clearInput, submitAnswer]);

  // Render setup phase
  if (phase === 'setup') {
    return (
      <GameSetup
        initialDifficulty={progress.moduleStats.mentalMathSprint.currentDifficulty}
        onStart={handleStart}
        onBack={handleExit}
      />
    );
  }

  // Render results phase
  if (phase === 'results' && completedSession) {
    const baseXP = 10 * completedSession.totalCorrect;
    const accuracyBonus = Math.floor(completedSession.accuracy / 5);
    const streakBonus = Math.min(completedSession.bestStreak * 2, 20);
    const difficultyMultiplier = completedSession.difficulty === 'easy' ? 1 : completedSession.difficulty === 'medium' ? 1.5 : 2;
    const difficultyBonus = Math.floor((baseXP + accuracyBonus + streakBonus) * (difficultyMultiplier - 1));
    const perfectBonus = completedSession.accuracy === 100 ? 50 : 0;

    return (
      <SessionResults
        session={completedSession}
        xpEarned={completedSession.xpEarned}
        xpBreakdown={{
          base: baseXP + 25, // Include session complete bonus
          accuracy: accuracyBonus,
          streak: streakBonus,
          difficulty: difficultyBonus,
          perfect: perfectBonus,
        }}
        onPlayAgain={handlePlayAgain}
        onExit={handleExit}
      />
    );
  }

  // Get total time for timer
  const totalTime = difficulty ? DIFFICULTY_CONFIG[difficulty].timePerProblem : 15000;

  // Render active phase
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={handleExit}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Exit game"
        >
          <ChevronLeftIcon className="w-6 h-6 text-[var(--text-primary)]" />
        </button>

        {/* Progress */}
        <span className="text-[var(--text-primary)] font-semibold">
          {currentProblemIndex + 1} / {problems.length}
        </span>

        {/* Streak indicator */}
        <StreakIndicator currentStreak={currentStreak} bestStreak={bestStreak} />
      </div>

      {/* Timer */}
      <div className="pt-4">
        <TimerDisplay
          timeLeft={timeLeft}
          totalTime={totalTime}
          isRunning={isRunning}
        />
      </div>

      {/* Problem display */}
      <div className="flex-1 flex items-center justify-center">
        {currentProblem && (
          <ProblemDisplay
            problem={currentProblem}
            showAnswer={currentProblem.isCorrect !== null}
            userAnswer={userInput || currentProblem.userAnswer?.toString()}
          />
        )}
      </div>

      {/* Score indicator */}
      <div className="text-center py-2">
        <span className="text-sm text-[var(--text-secondary)]">
          Correct: <span className="font-semibold text-accent-success">{totalCorrect}</span>
        </span>
      </div>

      {/* Number pad */}
      <NumberPad
        onDigit={inputDigit}
        onNegative={toggleNegative}
        onClear={clearInput}
        onSubmit={submitAnswer}
        currentValue={userInput}
        disabled={!isRunning || currentProblem?.isCorrect !== null}
      />
    </div>
  );
}
