import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../../context/GameContext';
import { useSemanticChain } from './useSemanticChain';
import { GameSetup } from './GameSetup';
import { ChainDisplay } from './ChainDisplay';
import { WordInput } from './WordInput';
import { SessionResults } from './SessionResults';
import { ChevronLeftIcon } from '../../icons';
import { playSuccessSound, playErrorSound, playGameOverSound, playVictorySound } from './sounds';
import type { SemanticChainCategory, SemanticChainDifficulty, SemanticChainSession } from '../../../types';
import { getCategoryDisplayName } from '../../../data/categoryWords';

export function SemanticChain(): JSX.Element {
  const navigate = useNavigate();
  const { addXP, updateSemanticChainStats, checkAndQueueAchievements, settings } = useGame();

  const prevChainLengthRef = useRef<number>(0);

  // Handle session completion
  const handleSessionComplete = useCallback((session: SemanticChainSession) => {
    // Play appropriate sound
    if (settings.soundEnabled) {
      if (session.chainLength >= 10) {
        playVictorySound();
      } else {
        playGameOverSound();
      }
    }

    addXP(session.xpEarned);

    // Update stats
    updateSemanticChainStats({
      totalSessions: 1,
      totalWordsChained: session.chainLength,
      longestChain: session.chainLength,
      averageChainLength: session.chainLength,
      currentDifficulty: session.difficulty,
      favoriteCategory: session.category,
    });

    // Check achievements
    checkAndQueueAchievements();
  }, [addXP, updateSemanticChainStats, checkAndQueueAchievements, settings.soundEnabled]);

  // Initialize the game hook
  const {
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
    startGame,
    setInput,
    submitWord,
    reset,
  } = useSemanticChain({
    onSessionComplete: handleSessionComplete,
  });

  // Play sounds on chain changes
  useEffect(() => {
    if (chainLength > prevChainLengthRef.current && chainLength > 1) {
      if (settings.soundEnabled) {
        playSuccessSound();
      }
    }
    prevChainLengthRef.current = chainLength;
  }, [chainLength, settings.soundEnabled]);

  // Play error sound on error
  useEffect(() => {
    if (lastError && settings.soundEnabled) {
      playErrorSound();
    }
  }, [lastError, settings.soundEnabled]);

  // Handle start
  const handleStart = useCallback((cat: SemanticChainCategory, diff: SemanticChainDifficulty) => {
    startGame(cat, diff);
  }, [startGame]);

  // Handle exit
  const handleExit = useCallback(() => {
    reset();
    navigate('/');
  }, [reset, navigate]);

  // Handle play again
  const handlePlayAgain = useCallback(() => {
    reset();
  }, [reset]);

  // Calculate timer progress (0-100)
  const timerProgress = maxTime > 0 ? (timeRemaining / maxTime) * 100 : 0;

  // Timer color based on remaining time
  const getTimerColor = () => {
    if (timerProgress > 60) return 'bg-green-500';
    if (timerProgress > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Render setup phase
  if (phase === 'setup') {
    return <GameSetup onStart={handleStart} onBack={handleExit} />;
  }

  // Render results phase
  if (phase === 'results') {
    return (
      <SessionResults
        category={category}
        difficulty={difficulty}
        chainLength={chainLength}
        wordsUsed={chain}
        xpEarned={Math.floor((20 + chainLength * 3) * (difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : 2) + (chainLength >= 15 ? 50 : 0))}
        gameOverReason={gameOverReason}
        onPlayAgain={handlePlayAgain}
        onExit={handleExit}
      />
    );
  }

  // Render playing phase
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

        <div className="text-center">
          <div className="text-sm text-[var(--text-secondary)]">
            {getCategoryDisplayName(category)}
          </div>
          <div className="font-semibold text-[var(--text-primary)]">
            {chainLength} words
          </div>
        </div>

        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Timer bar */}
      <div className="px-4 py-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-100 ${getTimerColor()}`}
            style={{ width: `${timerProgress}%` }}
          />
        </div>
        <div className="text-center mt-1">
          <span className={`text-sm font-mono ${timerProgress < 30 ? 'text-red-500 font-bold' : 'text-[var(--text-secondary)]'}`}>
            {(timeRemaining / 1000).toFixed(1)}s
          </span>
        </div>
      </div>

      {/* Chain display */}
      <div className="px-4 py-2">
        <ChainDisplay chain={chain} highlightLast={!isGameOver} />
      </div>

      {/* Game over overlay */}
      {isGameOver && (
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="text-4xl mb-2">
              {gameOverReason === 'no-words' ? '🎉' : '⏰'}
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
              {gameOverReason === 'timeout' && 'Time\'s Up!'}
              {gameOverReason === 'invalid' && 'Invalid Word!'}
              {gameOverReason === 'no-words' && 'Perfect!'}
            </h2>
            <p className="text-[var(--text-secondary)]">
              Loading results...
            </p>
          </div>
        </div>
      )}

      {/* Input area */}
      {!isGameOver && (
        <div className="flex-1 flex flex-col justify-end p-4">
          <WordInput
            value={currentInput}
            onChange={setInput}
            onSubmit={submitWord}
            requiredLetter={lastLetter}
            error={lastError}
            disabled={isGameOver}
          />
        </div>
      )}
    </div>
  );
}
