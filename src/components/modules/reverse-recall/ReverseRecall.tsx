import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../../context/GameContext';
import { useReverseRecall, type SensoryKey } from './useReverseRecall';
import { GameSetup } from './GameSetup';
import { EventEntry } from './EventEntry';
import { SensoryModal } from './SensoryModal';
import { SessionResults } from './SessionResults';
import type { ReverseRecallSession } from '../../../types';

export function ReverseRecall(): JSX.Element {
  const navigate = useNavigate();
  const { addXP, updateReverseRecallStats, checkAndQueueAchievements } = useGame();

  // Modal state for sensory input
  const [sensoryModal, setSensoryModal] = useState<{
    isOpen: boolean;
    eventId: string;
    sense: SensoryKey;
    currentValue: string;
  }>({
    isOpen: false,
    eventId: '',
    sense: 'sight',
    currentValue: '',
  });

  // Handle session completion - add XP and update stats
  const handleSessionComplete = useCallback(
    (session: ReverseRecallSession) => {
      if (session.score > 0) {
        addXP(session.score);
      }

      // Update module stats
      updateReverseRecallStats({
        totalSessions: 1, // Will be incremented in reducer
        totalEventsLogged: session.events.length,
        longestChain: session.events.length,
        averageChainLength: session.events.length,
        calendarData: { [session.date]: 1 }, // Track completion for this date
      });

      // Check for newly unlocked achievements
      checkAndQueueAchievements();
    },
    [addXP, updateReverseRecallStats, checkAndQueueAchievements]
  );

  // Initialize the game hook with completion callback
  const {
    phase,
    chainLevel,
    events,
    session,
    targetEventCount,
    startSession,
    addEvent,
    updateEventSensory,
    finishEntry,
    reset,
  } = useReverseRecall({
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

  // Handle sensory badge tap - open modal
  const handleSensoryTap = useCallback(
    (eventId: string, sense: SensoryKey) => {
      const event = events.find((e) => e.id === eventId);
      const currentValue = event?.sensoryDetails?.[sense] || '';

      setSensoryModal({
        isOpen: true,
        eventId,
        sense,
        currentValue,
      });
    },
    [events]
  );

  // Handle sensory modal save
  const handleSensorySave = useCallback(
    (value: string) => {
      updateEventSensory(sensoryModal.eventId, sensoryModal.sense, value);
    },
    [sensoryModal.eventId, sensoryModal.sense, updateEventSensory]
  );

  // Handle sensory modal close
  const handleSensoryClose = useCallback(() => {
    setSensoryModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Render based on current phase
  if (phase === 'setup') {
    return <GameSetup onStart={startSession} onBack={handleExit} />;
  }

  if (phase === 'entry') {
    return (
      <>
        <EventEntry
          events={events}
          chainLevel={chainLevel}
          targetEvents={targetEventCount}
          onAddEvent={addEvent}
          onSensoryTap={handleSensoryTap}
          onFinish={finishEntry}
        />
        <SensoryModal
          isOpen={sensoryModal.isOpen}
          sense={sensoryModal.sense}
          currentValue={sensoryModal.currentValue}
          onSave={handleSensorySave}
          onClose={handleSensoryClose}
        />
      </>
    );
  }

  if (phase === 'results' && session) {
    return (
      <SessionResults
        events={session.events}
        targetEvents={targetEventCount}
        xpEarned={session.score}
        onPlayAgain={handlePlayAgain}
        onExit={handleExit}
      />
    );
  }

  // Fallback - should not reach here normally
  return <></>;
}
