import { Card } from '../../common/Card';
import { Button } from '../../common/Button';

interface XPBreakdown {
  base: number;
  accuracy: number;
  delayBonus: number;
  viewingBonus: number;
}

interface SessionResultsProps {
  score: number;              // 0-100
  correctCount: number;
  totalQuestions: number;
  xpEarned: number;
  xpBreakdown: XPBreakdown;
  onPlayAgain: () => void;
  onExit: () => void;
}

function getPerformanceMessage(score: number): string {
  if (score >= 90) {
    return 'Outstanding!';
  } else if (score >= 80) {
    return 'Excellent work!';
  } else if (score >= 70) {
    return 'Good job!';
  } else if (score >= 50) {
    return 'Keep practicing!';
  } else {
    return 'Every session counts!';
  }
}

function getScoreColor(score: number): string {
  if (score >= 80) {
    return 'text-emerald-500';
  } else if (score >= 50) {
    return 'text-amber-500';
  } else {
    return 'text-red-500';
  }
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

function XPRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}): JSX.Element {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-[var(--text-secondary)]">{label}</span>
      <span className={highlight ? 'text-emerald-500 font-medium' : 'text-[var(--text-primary)]'}>
        +{value}
      </span>
    </div>
  );
}

export function SessionResults({
  score,
  correctCount,
  totalQuestions,
  xpEarned,
  xpBreakdown,
  onPlayAgain,
  onExit,
}: SessionResultsProps): JSX.Element {
  const performance = getPerformanceMessage(score);

  return (
    <div
      className="flex flex-col gap-4 p-4 max-h-full overflow-y-auto"
      role="region"
      aria-label="Session Results"
    >
      {/* Performance Header with Circular Progress */}
      <Card className="text-center">
        <p className="text-lg text-[var(--text-secondary)] mb-4">
          {performance}
        </p>
        <div className="flex justify-center mb-4">
          <CircularProgress score={score} />
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          Memory Recall Score
        </p>
      </Card>

      {/* Stats Breakdown */}
      <Card>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 uppercase tracking-wide">
          Results
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
            <span className="text-sm text-[var(--text-secondary)]">Correct Answers</span>
            <span className="text-lg font-semibold text-[var(--text-primary)]">
              {correctCount} <span className="text-sm font-normal text-[var(--text-secondary)]">of {totalQuestions}</span>
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-[var(--text-secondary)]">Score</span>
            <span className={`text-lg font-semibold ${getScoreColor(score)}`}>
              {score}%
            </span>
          </div>
        </div>
      </Card>

      {/* XP Breakdown */}
      <Card>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 uppercase tracking-wide">
          XP Earned
        </h3>
        <div className="space-y-2 mb-3">
          <XPRow label="Base XP" value={xpBreakdown.base} />
          <XPRow
            label="Accuracy Bonus"
            value={xpBreakdown.accuracy}
            highlight={xpBreakdown.accuracy > 0}
          />
          <XPRow
            label="Delay Bonus"
            value={xpBreakdown.delayBonus}
            highlight={xpBreakdown.delayBonus > 0}
          />
          <XPRow
            label="Viewing Bonus"
            value={xpBreakdown.viewingBonus}
            highlight={xpBreakdown.viewingBonus > 0}
          />
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
          <span className="font-semibold text-[var(--text-primary)]">Total</span>
          <span
            className="text-2xl font-bold text-emerald-500"
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
          aria-label="Play again"
          className="!bg-emerald-500 hover:!bg-emerald-600 active:!bg-emerald-700"
        >
          Play Again
        </Button>
        <Button
          variant="secondary"
          size="md"
          fullWidth
          onClick={onExit}
          aria-label="Exit to dashboard"
          className="!border-emerald-500 !text-emerald-500 hover:!bg-emerald-50 active:!bg-emerald-100"
        >
          Exit
        </Button>
      </div>
    </div>
  );
}
