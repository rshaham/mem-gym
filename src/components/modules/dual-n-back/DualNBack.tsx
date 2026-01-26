import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../../context/GameContext';
import { useDualNBack, type SessionResults } from './useDualNBack';
import { GameSetup } from './GameSetup';
import { GameGrid } from './GameGrid';
import { TrialProgress } from './TrialProgress';
import { ResponseBar } from './ResponseBar';
import { SessionResults as SessionResultsComponent } from './SessionResults';
import type { DualNBackTrial, DualNBackSession } from '../../../types';

type GamePhase = 'setup' | 'active' | 'results';

// Detect if device has a physical keyboard (desktop/laptop)
function useHasKeyboard(): boolean {
  const [hasKeyboard, setHasKeyboard] = useState(false);

  useEffect(() => {
    // Check for hover capability as proxy for desktop
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    setHasKeyboard(mediaQuery.matches);

    function handleChange(e: MediaQueryListEvent): void {
      setHasKeyboard(e.matches);
    }

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return hasKeyboard;
}

export function DualNBack(): JSX.Element {
  const navigate = useNavigate();
  const { progress, settings, addXP, updateDualNBackStats, checkAndQueueAchievements } = useGame();
  const hasKeyboard = useHasKeyboard();

  const [phase, setPhase] = useState<GamePhase>('setup');
  const [trialCount, setTrialCount] = useState(20);
  const [highlightedCell, setHighlightedCell] = useState<number | null>(null);
  const [positionPressed, setPositionPressed] = useState(false);
  const [soundPressed, setSoundPressed] = useState(false);
  const [completedSession, setCompletedSession] = useState<DualNBackSession | null>(null);
  const [sessionResults, setSessionResults] = useState<SessionResults | null>(null);

  const currentN = progress.moduleStats.dualNBack.currentN;

  // TTS voice reference
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Load TTS voices
  useEffect(() => {
    function loadVoices(): void {
      const voices = speechSynthesis.getVoices();
      if (voices.length === 0) return;

      // Try to use saved voice preference
      if (settings.ttsVoice) {
        const savedVoice = voices.find(v => v.name === settings.ttsVoice);
        if (savedVoice) {
          voiceRef.current = savedVoice;
          return;
        }
      }

      // Fall back to first English voice
      const englishVoice = voices.find(v => v.lang.startsWith('en'));
      voiceRef.current = englishVoice ?? voices[0];
    }

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      speechSynthesis.cancel();
    };
  }, [settings.ttsVoice]);

  // Speak a letter using TTS
  const speakLetter = useCallback((letter: string) => {
    if (!settings.soundEnabled) return;

    speechSynthesis.cancel(); // Cancel any pending speech

    const utterance = new SpeechSynthesisUtterance(letter);
    if (voiceRef.current) {
      utterance.voice = voiceRef.current;
    }
    utterance.rate = settings.ttsRate;
    utterance.pitch = 1;
    utterance.volume = 1;

    speechSynthesis.speak(utterance);
  }, [settings.soundEnabled, settings.ttsRate]);

  // Handle trial start - show stimulus and play audio
  const handleTrialStart = useCallback((trial: DualNBackTrial) => {
    setHighlightedCell(trial.position);
    speakLetter(trial.letter);
    setPositionPressed(false);
    setSoundPressed(false);
  }, [speakLetter]);

  // Handle stimulus end - hide grid highlight
  const handleStimulusEnd = useCallback(() => {
    setHighlightedCell(null);
  }, []);

  // Handle session complete
  const handleSessionComplete = useCallback((session: DualNBackSession) => {
    // Calculate results from the session
    const nLevel = session.nLevel;
    const trials = session.trials;
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
      if (trial.positionMatch && trial.userPositionResponse) positionHits++;
      else if (trial.positionMatch && !trial.userPositionResponse) positionMisses++;
      else if (!trial.positionMatch && trial.userPositionResponse) positionFalseAlarms++;
      else positionCorrectRejections++;

      if (trial.audioMatch && trial.userAudioResponse) audioHits++;
      else if (trial.audioMatch && !trial.userAudioResponse) audioMisses++;
      else if (!trial.audioMatch && trial.userAudioResponse) audioFalseAlarms++;
      else audioCorrectRejections++;
    }

    const positionAccuracy = scoredCount > 0 ? (positionHits + positionCorrectRejections) / scoredCount : 0;
    const audioAccuracy = scoredCount > 0 ? (audioHits + audioCorrectRejections) / scoredCount : 0;
    const overallAccuracy = (positionAccuracy + audioAccuracy) / 2;

    // XP calculation
    const baseXP = 10 * trials.length;
    const accuracyBonus = Math.floor(overallAccuracy * 50);
    const nLevelBonus = nLevel * 20;
    const xpEarned = baseXP + accuracyBonus + nLevelBonus;

    const results: SessionResults = {
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

    // Set UI state FIRST to ensure results screen shows immediately
    setCompletedSession(session);
    setSessionResults(results);
    setPhase('results');

    // Update stats in background (don't block UI)
    try {
      const stats = progress.moduleStats.dualNBack;
      const newTotalSessions = stats.totalSessions + 1;
      const newTotalTrials = stats.totalTrials + trials.length;
      const newAverageAccuracy = ((stats.averageAccuracy * stats.totalSessions) + overallAccuracy) / newTotalSessions;
      const newPositionAccuracy = ((stats.positionAccuracy * stats.totalSessions) + positionAccuracy) / newTotalSessions;
      const newAudioAccuracy = ((stats.audioAccuracy * stats.totalSessions) + audioAccuracy) / newTotalSessions;
      const newHighestN = Math.max(stats.highestN, nLevel);

      updateDualNBackStats({
        totalSessions: newTotalSessions,
        totalTrials: newTotalTrials,
        averageAccuracy: newAverageAccuracy,
        positionAccuracy: newPositionAccuracy,
        audioAccuracy: newAudioAccuracy,
        highestN: newHighestN,
      });

      // Add XP
      addXP(xpEarned);

      // Check for newly unlocked achievements
      checkAndQueueAchievements(overallAccuracy * 100);
    } catch (error) {
      console.error('Error saving session stats:', error);
    }
  }, [progress.moduleStats.dualNBack, updateDualNBackStats, addXP, checkAndQueueAchievements]);

  // Initialize the game hook
  const {
    currentTrialIndex,
    isRunning,
    phase: trialPhase,
    start,
    recordPositionResponse,
    recordAudioResponse,
  } = useDualNBack({
    onTrialStart: handleTrialStart,
    onStimulusEnd: handleStimulusEnd,
    onSessionComplete: handleSessionComplete,
  });

  // Handle game start
  const handleStart = useCallback((trials: number, nLevel: number) => {
    setTrialCount(trials);
    updateDualNBackStats({ currentN: nLevel });
    setPhase('active');
    start(trials, nLevel);
  }, [start, updateDualNBackStats]);

  // Handle position button press
  const handlePositionPress = useCallback(() => {
    if (!positionPressed) {
      setPositionPressed(true);
      recordPositionResponse();
    }
  }, [positionPressed, recordPositionResponse]);

  // Handle sound button press
  const handleSoundPress = useCallback(() => {
    if (!soundPressed) {
      setSoundPressed(true);
      recordAudioResponse();
    }
  }, [soundPressed, recordAudioResponse]);

  // Keyboard shortcuts for desktop
  useEffect(() => {
    if (phase !== 'active' || !isRunning) return;

    function handleKeyDown(e: KeyboardEvent): void {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key.toLowerCase();

      if (key === 'a') {
        e.preventDefault();
        handlePositionPress();
      } else if (key === 'l') {
        e.preventDefault();
        handleSoundPress();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, isRunning, handlePositionPress, handleSoundPress]);

  // Calculate suggested N level
  const getSuggestedN = (): number | null => {
    if (!sessionResults) return null;

    const positionPercent = sessionResults.positionAccuracy * 100;
    const audioPercent = sessionResults.audioAccuracy * 100;

    if (positionPercent > 80 && audioPercent > 80) {
      return currentN + 1;
    } else if (positionPercent < 50 || audioPercent < 50) {
      return Math.max(1, currentN - 1);
    }
    return null;
  };

  // Handle suggestion acceptance
  const handleAcceptSuggestion = useCallback((accepted: boolean) => {
    if (accepted) {
      const suggestedN = getSuggestedN();
      if (suggestedN !== null) {
        updateDualNBackStats({ currentN: suggestedN });
      }
    }
  }, [updateDualNBackStats]);

  // Handle play again
  const handlePlayAgain = useCallback((newN: number) => {
    updateDualNBackStats({ currentN: newN });
    setPhase('setup');
    setCompletedSession(null);
    setSessionResults(null);
    setHighlightedCell(null);
    setPositionPressed(false);
    setSoundPressed(false);
  }, [updateDualNBackStats]);

  // Handle exit
  const handleExit = useCallback(() => {
    navigate('/');
  }, [navigate]);

  // Render based on phase
  if (phase === 'setup') {
    return (
      <GameSetup
        initialNLevel={currentN}
        onStart={handleStart}
        onBack={handleExit}
      />
    );
  }

  if (phase === 'active') {
    return (
      <div className="flex flex-col h-full">
        {/* Progress indicator */}
        <div className="p-4">
          <TrialProgress
            current={currentTrialIndex + 1}
            total={trialCount}
          />
        </div>

        {/* Game grid */}
        <div className="flex-1 flex items-center justify-center px-4">
          <GameGrid highlightedCell={highlightedCell} />
        </div>

        {/* Response bar */}
        <ResponseBar
          onPositionPress={handlePositionPress}
          onSoundPress={handleSoundPress}
          disabled={!isRunning || trialPhase === 'idle'}
          positionPressed={positionPressed}
          soundPressed={soundPressed}
          showKeyboardHints={hasKeyboard}
        />
      </div>
    );
  }

  if (phase === 'results' && completedSession && sessionResults) {
    return (
      <SessionResultsComponent
        session={completedSession}
        currentN={currentN}
        suggestedN={getSuggestedN()}
        xpEarned={sessionResults.xpEarned}
        xpBreakdown={{
          base: 10 * completedSession.trials.length,
          accuracy: Math.floor(sessionResults.overallAccuracy * 50),
          levelBonus: completedSession.nLevel * 20,
        }}
        onPlayAgain={handlePlayAgain}
        onExit={handleExit}
        onAcceptSuggestion={handleAcceptSuggestion}
      />
    );
  }

  // Fallback - should not reach here
  return <></>;
}
