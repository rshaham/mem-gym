import { useState } from 'react';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import type { DualNBackSession } from '../../../types';

interface XPBreakdown {
  base: number;
  accuracy: number;
  levelBonus: number;
}

interface SessionResultsProps {
  session: DualNBackSession;
  currentN: number;
  suggestedN: number | null; // null means stay same
  xpEarned: number;
  xpBreakdown: XPBreakdown;
  onPlayAgain: (newN: number) => void;
  onExit: () => void;
  onAcceptSuggestion: (accepted: boolean) => void;
}

function getPerformanceMessage(overallAccuracy: number): string {
  if (overallAccuracy >= 90) {
    return 'Outstanding!';
  } else if (overallAccuracy >= 80) {
    return 'Excellent work!';
  } else if (overallAccuracy >= 70) {
    return 'Good job!';
  } else if (overallAccuracy >= 50) {
    return 'Keep practicing!';
  } else {
    return 'Every session counts!';
  }
}

function StatBox({
  label,
  value,
  subtext
}: {
  label: string;
  value: string | number;
  subtext?: string;
}): JSX.Element {
  return (
    <div className="text-center">
      <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-[var(--text-primary)]">
        {value}
      </p>
      {subtext && (
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          {subtext}
        </p>
      )}
    </div>
  );
}

function BreakdownRow({
  label,
  hits,
  misses,
  falseAlarms,
}: {
  label: string;
  hits: number;
  misses: number;
  falseAlarms: number;
}): JSX.Element {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
      <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>
      <div className="flex gap-4 text-sm">
        <span className="text-accent-success" aria-label={`${hits} hits`}>
          <span className="text-[var(--text-secondary)] mr-1">Hits:</span>
          {hits}
        </span>
        <span className="text-accent-warning" aria-label={`${misses} misses`}>
          <span className="text-[var(--text-secondary)] mr-1">Miss:</span>
          {misses}
        </span>
        <span className="text-accent-error" aria-label={`${falseAlarms} false alarms`}>
          <span className="text-[var(--text-secondary)] mr-1">FA:</span>
          {falseAlarms}
        </span>
      </div>
    </div>
  );
}

export function SessionResults({
  session,
  currentN,
  suggestedN,
  xpEarned,
  xpBreakdown,
  onPlayAgain,
  onExit,
  onAcceptSuggestion,
}: SessionResultsProps): JSX.Element {
  const [selectedN, setSelectedN] = useState<number>(currentN);

  const overallAccuracyPercent = Math.round(session.overallAccuracy * 100);
  const positionAccuracyPercent = session.positionHits + session.positionMisses > 0
    ? Math.round((session.positionHits / (session.positionHits + session.positionMisses)) * 100)
    : 0;
  const audioAccuracyPercent = session.audioHits + session.audioMisses > 0
    ? Math.round((session.audioHits / (session.audioHits + session.audioMisses)) * 100)
    : 0;

  const performance = getPerformanceMessage(overallAccuracyPercent);
  const shouldLevelUp = suggestedN !== null && suggestedN > currentN;

  function handleSuggestionResponse(accepted: boolean): void {
    onAcceptSuggestion(accepted);
    if (accepted && suggestedN !== null) {
      setSelectedN(suggestedN);
    }
  }

  function handlePlayAgain(): void {
    onPlayAgain(selectedN);
  }

  return (
    <div
      className="flex flex-col gap-4 p-4 max-h-full overflow-y-auto"
      role="region"
      aria-label="Session Results"
    >
      {/* Performance Header */}
      <Card className="text-center">
        <p className="text-lg text-[var(--text-secondary)] mb-2">
          {performance}
        </p>
        <div
          className={`text-6xl font-bold mb-2 ${
            overallAccuracyPercent >= 80
              ? 'text-accent-success'
              : overallAccuracyPercent >= 50
                ? 'text-accent-warning'
                : 'text-accent-error'
          }`}
          aria-label={`Overall accuracy: ${overallAccuracyPercent} percent`}
        >
          {overallAccuracyPercent}%
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          Overall Accuracy at N={session.nLevel}
        </p>
      </Card>

      {/* Position & Audio Accuracy */}
      <Card>
        <div className="grid grid-cols-2 gap-4">
          <StatBox
            label="Position"
            value={`${positionAccuracyPercent}%`}
            subtext={positionAccuracyPercent >= 80 ? 'Great!' : positionAccuracyPercent >= 50 ? 'Good' : 'Practice more'}
          />
          <StatBox
            label="Sound"
            value={`${audioAccuracyPercent}%`}
            subtext={audioAccuracyPercent >= 80 ? 'Great!' : audioAccuracyPercent >= 50 ? 'Good' : 'Practice more'}
          />
        </div>
      </Card>

      {/* Detailed Breakdown */}
      <Card>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 uppercase tracking-wide">
          Breakdown
        </h3>
        <BreakdownRow
          label="Position"
          hits={session.positionHits}
          misses={session.positionMisses}
          falseAlarms={session.positionFalseAlarms}
        />
        <BreakdownRow
          label="Sound"
          hits={session.audioHits}
          misses={session.audioMisses}
          falseAlarms={session.audioFalseAlarms}
        />
      </Card>

      {/* N-Level Suggestion */}
      {suggestedN !== null && (
        <Card
          className={`${
            shouldLevelUp
              ? 'bg-green-50 dark:bg-green-950/30 border-accent-success'
              : 'bg-orange-50 dark:bg-orange-950/30 border-accent-warning'
          }`}
        >
          <p className="text-sm text-[var(--text-primary)] mb-3 text-center font-medium">
            {shouldLevelUp
              ? `Ready for N=${suggestedN}?`
              : `Consider practicing at N=${suggestedN}?`}
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleSuggestionResponse(true)}
              aria-label={shouldLevelUp ? `Accept level up to N=${suggestedN}` : `Accept level down to N=${suggestedN}`}
            >
              Yes
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleSuggestionResponse(false)}
              aria-label={`Stay at N=${currentN}`}
            >
              No, stay at N={currentN}
            </Button>
          </div>
        </Card>
      )}

      {/* Stay at current level message */}
      {suggestedN === null && (
        <Card className="bg-gray-50 dark:bg-gray-900/50">
          <p className="text-sm text-[var(--text-secondary)] text-center">
            Keep practicing at <span className="font-semibold">N={currentN}</span>
          </p>
        </Card>
      )}

      {/* XP Earned */}
      <Card>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 uppercase tracking-wide">
          XP Earned
        </h3>
        <div className="space-y-2 mb-3">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Base XP</span>
            <span className="text-[var(--text-primary)]">+{xpBreakdown.base}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Accuracy Bonus</span>
            <span className="text-accent-success">+{xpBreakdown.accuracy}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Level Bonus (N={session.nLevel})</span>
            <span className="text-accent-primary">+{xpBreakdown.levelBonus}</span>
          </div>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
          <span className="font-semibold text-[var(--text-primary)]">Total</span>
          <span
            className="text-2xl font-bold text-accent-primary"
            aria-label={`Total XP earned: ${xpEarned}`}
          >
            +{xpEarned} XP
          </span>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 mt-2 pb-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handlePlayAgain}
          aria-label={`Play again at N=${selectedN}`}
        >
          Play Again (N={selectedN})
        </Button>
        <Button
          variant="ghost"
          size="md"
          fullWidth
          onClick={onExit}
          aria-label="Exit to dashboard"
        >
          Exit
        </Button>
      </div>
    </div>
  );
}
