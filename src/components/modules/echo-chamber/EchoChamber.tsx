import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../../context/GameContext';
import { useEchoChamber } from './useEchoChamber';
import { GameSetup } from './GameSetup';
import { SentencePresenter } from './SentencePresenter';
import { SilenceTimer } from './SilenceTimer';
import { RecallInput } from './RecallInput';
import { RecallFeedback } from './RecallFeedback';
import { SessionResults } from './SessionResults';
import type { EchoChamberSession } from '../../../types';

export function EchoChamber(): JSX.Element {
  const navigate = useNavigate();
  const { addXP, checkAndQueueAchievements } = useGame();

  // Handle session completion - add XP and check achievements
  const handleSessionComplete = useCallback(
    (session: EchoChamberSession) => {
      if (session.xpEarned > 0) {
        addXP(session.xpEarned);
      }
      // Check for newly unlocked achievements
      const avgAccuracy = session.rounds.length > 0
        ? session.rounds.reduce((sum, r) => sum + r.score, 0) / session.rounds.length
        : 0;
      checkAndQueueAchievements(avgAccuracy);
    },
    [addXP, checkAndQueueAchievements]
  );

  // Initialize the game hook with completion callback
  const {
    phase,
    mode,
    currentSentence,
    silenceTimeLeft,
    recallTimeLeft,
    lastRoundResult,
    rounds,
    sessionXP,
    startSession,
    finishPresenting,
    submitRecall,
    nextRound,
    reset,
  } = useEchoChamber({
    onSessionComplete: handleSessionComplete,
  });

  // Handle exit - navigate back to home
  const handleExit = useCallback(() => {
    reset();
    navigate('/');
  }, [reset, navigate]);

  // Handle play again - reset state to setup phase
  const handlePlayAgain = useCallback(() => {
    reset();
  }, [reset]);

  // Render based on current phase
  if (phase === 'setup') {
    return <GameSetup onStart={startSession} onBack={handleExit} />;
  }

  if (phase === 'presenting') {
    return (
      <SentencePresenter
        sentence={currentSentence}
        mode={mode}
        onComplete={finishPresenting}
      />
    );
  }

  if (phase === 'silence') {
    // Calculate total silence time based on difficulty (from hook)
    // The hook manages silenceTimeLeft in ms
    const totalSilenceTime = silenceTimeLeft > 0 ? silenceTimeLeft : 1000;
    return (
      <SilenceTimer
        timeLeft={silenceTimeLeft}
        totalTime={totalSilenceTime}
      />
    );
  }

  if (phase === 'recall') {
    return (
      <RecallInput
        onSubmit={submitRecall}
        timeLeft={recallTimeLeft}
      />
    );
  }

  if (phase === 'feedback' && lastRoundResult) {
    return (
      <RecallFeedback
        round={lastRoundResult}
        onContinue={nextRound}
      />
    );
  }

  if (phase === 'results') {
    // Include the last round result in the final rounds array if not already included
    const finalRounds = lastRoundResult && !rounds.includes(lastRoundResult)
      ? [...rounds, lastRoundResult]
      : rounds;

    const totalScore = finalRounds.length > 0
      ? Math.round(
          finalRounds.reduce((sum, round) => sum + round.score, 0) /
            finalRounds.length
        )
      : 0;

    return (
      <SessionResults
        rounds={finalRounds}
        totalScore={totalScore}
        xpEarned={sessionXP}
        onPlayAgain={handlePlayAgain}
        onExit={handleExit}
      />
    );
  }

  // Fallback - should not reach here normally
  return <></>;
}
