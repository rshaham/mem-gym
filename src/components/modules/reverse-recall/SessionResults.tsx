import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import type { ReverseRecallEvent } from '../../../types';

interface SessionResultsProps {
  events: ReverseRecallEvent[];
  targetEvents: number;
  xpEarned: number;
  onPlayAgain: () => void;
  onExit: () => void;
}

function getPerformanceMessage(score: number): string {
  if (score >= 90) return 'Outstanding!';
  if (score >= 80) return 'Excellent work!';
  if (score >= 70) return 'Good job!';
  if (score >= 50) return 'Keep practicing!';
  return 'Every session counts!';
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-500';
  if (score >= 50) return 'text-amber-500';
  return 'text-red-500';
}

function CircularProgress({
  score,
  size = 160,
  strokeWidth = 12,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
}): JSX.Element {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        aria-hidden="true"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={getScoreColor(score)}
          style={{
            transition: 'stroke-dashoffset 0.5s ease-in-out',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`text-4xl font-bold ${getScoreColor(score)}`}
          aria-label={`Score: ${score} percent`}
        >
          {score}%
        </span>
      </div>
    </div>
  );
}

function countSensoryDetails(events: ReverseRecallEvent[]): number {
  return events.reduce((count, event) => {
    if (!event.sensoryDetails) return count;
    const details = event.sensoryDetails;
    let eventCount = 0;
    if (details.sight) eventCount++;
    if (details.sound) eventCount++;
    if (details.smell) eventCount++;
    if (details.touch) eventCount++;
    if (details.taste) eventCount++;
    return count + eventCount;
  }, 0);
}

export function SessionResults({
  events,
  targetEvents,
  xpEarned,
  onPlayAgain,
  onExit,
}: SessionResultsProps): JSX.Element {
  const sensoryDetailsCount = countSensoryDetails(events);

  // Calculate completion score as percentage:
  // - Base: % of target events completed (capped at 100%)
  // - Bonus: 2% per sensory detail (capped at 20%)
  const eventCompletionPercent = Math.min(100, Math.round((events.length / targetEvents) * 100));
  const sensoryBonusPercent = Math.min(20, sensoryDetailsCount * 2);
  const score = Math.min(100, eventCompletionPercent + sensoryBonusPercent);

  const performance = getPerformanceMessage(score);

  return (
    <div
      className="min-h-screen overflow-y-auto p-4 pb-8 bg-[var(--bg-secondary)]"
      role="region"
      aria-label="Session Results"
    >
      <div className="flex flex-col gap-4 max-w-md mx-auto w-full">
        {/* Performance Header with Circular Progress */}
        <Card className="text-center">
          <p className="text-lg text-[var(--text-secondary)] mb-4">
            {performance}
          </p>
          <div className="flex justify-center mb-4">
            <CircularProgress score={score} />
          </div>
          <p className="text-sm text-[var(--text-secondary)]">Session Score</p>
        </Card>

        {/* Stats Summary */}
        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 uppercase tracking-wide">
            Session Stats
          </h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-reverse-recall">
                {events.length}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Events Logged
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-reverse-recall">
                {sensoryDetailsCount}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Sensory Details
              </p>
            </div>
          </div>
        </Card>

        {/* XP Earned */}
        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2 uppercase tracking-wide">
            XP Earned
          </h3>
          <div className="flex justify-between items-center">
            <span className="text-[var(--text-secondary)]">Session Complete</span>
            <span
              className="text-2xl font-bold text-emerald-500"
              aria-label={`Total XP earned: ${xpEarned}`}
            >
              +{xpEarned} XP
            </span>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-2">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={onPlayAgain}
            aria-label="Play again"
            className="!bg-reverse-recall hover:!bg-[#2db84e] active:!bg-[#28a745]"
          >
            Play Again
          </Button>
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={onExit}
            aria-label="Exit to dashboard"
            className="!border-reverse-recall !text-reverse-recall hover:!bg-green-50 active:!bg-green-100 dark:hover:!bg-green-950/30 dark:active:!bg-green-950/50"
          >
            Exit
          </Button>
        </div>
      </div>
    </div>
  );
}
