import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import type { MentalMathSprintSession } from '../../../types';

interface XPBreakdown {
  base: number;
  accuracy: number;
  streak: number;
  difficulty: number;
  perfect: number;
}

interface SessionResultsProps {
  session: MentalMathSprintSession;
  xpEarned: number;
  xpBreakdown: XPBreakdown;
  onPlayAgain: () => void;
  onExit: () => void;
}

function getPerformanceMessage(accuracy: number): string {
  if (accuracy >= 90) return 'Outstanding!';
  if (accuracy >= 80) return 'Excellent work!';
  if (accuracy >= 70) return 'Good job!';
  if (accuracy >= 50) return 'Keep practicing!';
  return 'Every session counts!';
}

function formatTime(ms: number): string {
  const seconds = Math.round(ms / 1000 * 10) / 10;
  return `${seconds}s`;
}

function StatBox({
  label,
  value,
  subtext,
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

export function SessionResults({
  session,
  xpEarned,
  xpBreakdown,
  onPlayAgain,
  onExit,
}: SessionResultsProps): JSX.Element {
  const accuracyPercent = Math.round(session.accuracy);
  const performance = getPerformanceMessage(accuracyPercent);

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
            accuracyPercent >= 80
              ? 'text-accent-success'
              : accuracyPercent >= 50
                ? 'text-accent-warning'
                : 'text-accent-error'
          }`}
          aria-label={`Accuracy: ${accuracyPercent} percent`}
        >
          {accuracyPercent}%
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          {session.totalCorrect} / {session.totalProblems} correct on {session.difficulty}
        </p>
      </Card>

      {/* Stats Grid */}
      <Card>
        <div className="grid grid-cols-3 gap-4">
          <StatBox
            label="Best Streak"
            value={session.bestStreak}
            subtext={session.bestStreak >= 5 ? 'Great!' : ''}
          />
          <StatBox
            label="Avg Time"
            value={formatTime(session.averageTime)}
            subtext={session.averageTime < 5000 ? 'Fast!' : ''}
          />
          <StatBox
            label="Total Time"
            value={formatTime(session.completedAt - session.startedAt)}
          />
        </div>
      </Card>

      {/* XP Breakdown */}
      <Card>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 uppercase tracking-wide">
          XP Earned
        </h3>
        <div className="space-y-2 mb-3">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Base XP ({session.totalCorrect} correct)</span>
            <span className="text-[var(--text-primary)]">+{xpBreakdown.base}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Accuracy Bonus</span>
            <span className="text-accent-success">+{xpBreakdown.accuracy}</span>
          </div>
          {xpBreakdown.streak > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Streak Bonus</span>
              <span className="text-orange-500">+{xpBreakdown.streak}</span>
            </div>
          )}
          {xpBreakdown.difficulty > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Difficulty Bonus ({session.difficulty})</span>
              <span className="text-pink-500">+{xpBreakdown.difficulty}</span>
            </div>
          )}
          {xpBreakdown.perfect > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Perfect Session!</span>
              <span className="text-accent-primary">+{xpBreakdown.perfect}</span>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
          <span className="font-semibold text-[var(--text-primary)]">Total</span>
          <span
            className="text-2xl font-bold text-pink-500"
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
          onClick={onPlayAgain}
          className="bg-pink-500 hover:bg-pink-600"
          aria-label={`Play again on ${session.difficulty}`}
        >
          Play Again ({session.difficulty})
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
