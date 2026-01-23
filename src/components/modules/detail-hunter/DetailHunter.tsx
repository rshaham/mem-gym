import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../../context/GameContext';
import { useDetailHunter } from './useDetailHunter';
import { GameSetup } from './GameSetup';
import { ImageViewer } from './ImageViewer';
import { WaitingScreen } from './WaitingScreen';
import { QuizScreen } from './QuizScreen';
import { SessionResults } from './SessionResults';
import type { DetailHunterSession } from '../../../types';

// Helper to avoid repetition of delay bonus calculation
function getDelayBonus(delayMinutes: number): number {
  if (delayMinutes <= 0) return 0;
  if (delayMinutes <= 30) return 10;
  if (delayMinutes <= 60) return 20;
  return 40;
}

// Helper to avoid repetition of viewing bonus calculation
function getViewingBonus(viewingTime: number): number {
  if (viewingTime >= 30) return 0;
  if (viewingTime >= 20) return 5;
  if (viewingTime >= 15) return 10;
  return 20;
}

export function DetailHunter(): JSX.Element {
  const navigate = useNavigate();
  const { progress, addXP, updateDetailHunterStats } = useGame();

  const stats = progress.moduleStats.detailHunter;

  // Handle session completion - update stats and add XP
  const handleQuizComplete = useCallback((session: DetailHunterSession) => {
    if (session.xpEarned !== null) {
      addXP(session.xpEarned);
    }

    // Update module stats
    const score = session.score ?? 0;
    const isSuccessful = score >= 70;
    const newTotalSessions = stats.totalSessions + 1;
    const newTotalRecalls = stats.totalRecalls + 1;
    const newSuccessfulRecalls = stats.successfulRecalls + (isSuccessful ? 1 : 0);
    const newAverageAccuracy = ((stats.averageAccuracy * stats.totalSessions) + score) / newTotalSessions;
    const newBestAccuracy = Math.max(stats.bestAccuracy, score);

    updateDetailHunterStats({
      totalSessions: newTotalSessions,
      totalRecalls: newTotalRecalls,
      successfulRecalls: newSuccessfulRecalls,
      averageAccuracy: newAverageAccuracy,
      bestAccuracy: newBestAccuracy,
    });
  }, [addXP, stats, updateDetailHunterStats]);

  // Initialize the game hook with completion callback
  const {
    phase,
    selectedImage,
    viewingTimeLeft,
    currentQuestionIndex,
    questions,
    session,
    availableCategories,
    isLoading,
    error,
    startSession,
    startQuiz,
    answerQuestion,
    getResults,
    reset,
  } = useDetailHunter({
    onQuizComplete: handleQuizComplete,
  });

  // Handle exit - navigate back to home
  const handleExit = useCallback(() => {
    navigate('/');
  }, [navigate]);

  // Handle play again - reset state to setup phase
  const handlePlayAgain = useCallback(() => {
    reset();
  }, [reset]);

  // Handle cancel during waiting phase
  const handleCancel = useCallback(() => {
    reset();
    navigate('/');
  }, [reset, navigate]);

  // Render based on current phase
  if (phase === 'setup') {
    return (
      <GameSetup
        onStart={startSession}
        onBack={handleExit}
        availableCategories={availableCategories}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  if (phase === 'viewing' && selectedImage) {
    return (
      <ImageViewer
        imageUrl={selectedImage.url}
        photographer={selectedImage.photographer}
        photographerUrl={selectedImage.photographerUrl}
        timeRemaining={viewingTimeLeft}
        totalTime={session?.viewingTime ?? 30}
      />
    );
  }

  if (phase === 'waiting' && session) {
    // Calculate scheduled time for quiz
    const scheduledTime = session.viewedAt + (session.delayMinutes * 60 * 1000);

    return (
      <WaitingScreen
        delayMinutes={session.delayMinutes}
        scheduledTime={scheduledTime}
        onReady={startQuiz}
        onCancel={handleCancel}
      />
    );
  }

  if (phase === 'quiz' && questions.length > 0) {
    return (
      <QuizScreen
        questions={questions}
        currentQuestionIndex={currentQuestionIndex}
        onAnswer={answerQuestion}
      />
    );
  }

  if (phase === 'results' && session) {
    const results = getResults();

    // Calculate XP breakdown for display
    const baseXP = 10 * results.totalQuestions;
    const accuracyBonus = Math.floor((results.score / 100) * 50);
    const delayBonus = getDelayBonus(session.delayMinutes);
    const viewingBonus = getViewingBonus(session.viewingTime);

    return (
      <SessionResults
        score={results.score}
        correctCount={results.correctAnswers}
        totalQuestions={results.totalQuestions}
        xpEarned={results.xpEarned}
        xpBreakdown={{
          base: baseXP,
          accuracy: accuracyBonus,
          delayBonus,
          viewingBonus,
        }}
        onPlayAgain={handlePlayAgain}
        onExit={handleExit}
      />
    );
  }

  // Fallback - should not reach here normally
  return <></>;
}
