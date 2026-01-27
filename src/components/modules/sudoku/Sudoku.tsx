import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../../context/GameContext';
import { useSudoku } from './useSudoku';
import { GameSetup } from './GameSetup';
import { SudokuGrid } from './SudokuGrid';
import { NumberPad } from './NumberPad';
import { SessionResults } from './SessionResults';
import { ChevronLeftIcon, PauseIcon, PlayIcon, ClockIcon } from '../../icons';
import { playTapSound, playCelebrationSound, playVictorySound } from './sounds';
import type { SudokuDifficulty, SudokuSession } from '../../../types';

type GamePhase = 'setup' | 'active' | 'paused' | 'results';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function Sudoku(): JSX.Element {
  const navigate = useNavigate();
  const { addXP, updateSudokuStats, checkAndQueueAchievements, settings } = useGame();

  const [phase, setPhase] = useState<GamePhase>('setup');
  const [completedSession, setCompletedSession] = useState<SudokuSession | null>(null);
  const prevCelebratingRef = useRef<number>(0);

  // Handle session completion
  const handleSessionComplete = useCallback((session: SudokuSession) => {
    // Play victory sound
    if (settings.soundEnabled) {
      playVictorySound();
    }

    // Set UI state FIRST to ensure results screen shows immediately
    setCompletedSession(session);
    setPhase('results');

    // Update stats in background (don't block UI)
    try {
      addXP(session.xpEarned);

      // Build stats update including best time for difficulty
      const statsUpdate: Record<string, unknown> = {
        totalPuzzlesSolved: 1, // Will be incremented
        totalSessions: 1,
        currentDifficulty: session.difficulty,
      };

      // Track best time for this difficulty
      if (session.difficulty === 'easy') {
        statsUpdate.bestTimeEasy = session.timeElapsed;
      } else if (session.difficulty === 'medium') {
        statsUpdate.bestTimeMedium = session.timeElapsed;
      } else if (session.difficulty === 'hard') {
        statsUpdate.bestTimeHard = session.timeElapsed;
      }

      updateSudokuStats(statsUpdate as Partial<typeof statsUpdate>);

      // Check achievements
      checkAndQueueAchievements();
    } catch (error) {
      console.error('Error saving Sudoku stats:', error);
    }
  }, [addXP, updateSudokuStats, checkAndQueueAchievements, settings.soundEnabled]);

  // Initialize the game hook
  const {
    puzzle,
    selectedCell,
    isPencilMode,
    elapsedTime,
    isPaused,
    difficulty,
    highlightedNumber,
    relatedCells,
    digitCounts,
    celebratingCells,
    startGame,
    selectCell,
    placeNumber,
    togglePencilMode,
    clearCell,
    undo,
    pause,
    resume,
    reset,
  } = useSudoku({
    onSessionComplete: handleSessionComplete,
  });

  // Play celebration sound when a line/box is completed
  useEffect(() => {
    if (celebratingCells.size > 0 && celebratingCells.size !== prevCelebratingRef.current) {
      if (settings.soundEnabled) {
        playCelebrationSound();
      }
    }
    prevCelebratingRef.current = celebratingCells.size;
  }, [celebratingCells, settings.soundEnabled]);

  // Wrapper for placeNumber that plays tap sound
  const handlePlaceNumber = useCallback((num: number) => {
    if (settings.soundEnabled) {
      playTapSound();
    }
    placeNumber(num);
  }, [placeNumber, settings.soundEnabled]);

  // Handle start
  const handleStart = useCallback((diff: SudokuDifficulty) => {
    startGame(diff);
    setPhase('active');
  }, [startGame]);

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

  // Handle pause toggle
  const handlePauseToggle = useCallback(() => {
    if (isPaused) {
      resume();
      setPhase('active');
    } else {
      pause();
      setPhase('paused');
    }
  }, [isPaused, pause, resume]);

  // Render setup phase
  if (phase === 'setup') {
    return <GameSetup onStart={handleStart} onBack={handleExit} />;
  }

  // Render results phase
  if (phase === 'results' && completedSession) {
    return (
      <SessionResults
        difficulty={completedSession.difficulty}
        timeElapsed={completedSession.timeElapsed}
        moveCount={completedSession.moveCount}
        xpEarned={completedSession.xpEarned}
        onPlayAgain={handlePlayAgain}
        onExit={handleExit}
      />
    );
  }

  // Render active/paused phase
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

        <div className="flex items-center gap-2 text-[var(--text-primary)]">
          <ClockIcon className="w-5 h-5" />
          <span className="font-mono font-semibold">{formatTime(elapsedTime)}</span>
        </div>

        <button
          onClick={handlePauseToggle}
          className="p-2 -mr-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={isPaused ? 'Resume game' : 'Pause game'}
        >
          {isPaused ? (
            <PlayIcon className="w-6 h-6 text-[var(--text-primary)]" />
          ) : (
            <PauseIcon className="w-6 h-6 text-[var(--text-primary)]" />
          )}
        </button>
      </div>

      {/* Paused overlay */}
      {isPaused && (
        <div className="flex-1 flex items-center justify-center bg-[var(--bg-secondary)]">
          <div className="text-center">
            <PauseIcon className="w-16 h-16 mx-auto mb-4 text-[var(--text-secondary)]" />
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Game Paused</h2>
            <p className="text-[var(--text-secondary)] mb-6">Tap play to continue</p>
            <button
              onClick={handlePauseToggle}
              className="px-6 py-3 bg-accent-primary text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              Resume
            </button>
          </div>
        </div>
      )}

      {/* Game content */}
      {!isPaused && (
        <>
          {/* Grid */}
          <div className="flex-1 flex items-center justify-center p-4">
            <SudokuGrid
              puzzle={puzzle}
              selectedCell={selectedCell}
              highlightedNumber={highlightedNumber}
              relatedCells={relatedCells}
              celebratingCells={celebratingCells}
              onCellSelect={selectCell}
            />
          </div>

          {/* Difficulty indicator */}
          <div className="text-center py-2">
            <span className="text-sm text-[var(--text-secondary)]">
              Difficulty: <span className="font-semibold capitalize">{difficulty}</span>
            </span>
          </div>

          {/* Number pad */}
          <NumberPad
            onNumberPress={handlePlaceNumber}
            onUndo={undo}
            onClear={clearCell}
            onTogglePencil={togglePencilMode}
            isPencilMode={isPencilMode}
            digitCounts={digitCounts}
          />
        </>
      )}
    </div>
  );
}
