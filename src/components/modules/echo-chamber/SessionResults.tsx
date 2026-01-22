import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import type { EchoChamberRound } from '../../../types';

interface SessionResultsProps {
  rounds: EchoChamberRound[];
  totalScore: number;
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

function RoundSummaryItem({
  roundNumber,
  round,
}: {
  roundNumber: number;
  round: EchoChamberRound;
}): JSX.Element {
  const truncatedSentence =
    round.sentence.length > 40
      ? round.sentence.substring(0, 40) + '...'
      : round.sentence;

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-medium text-[var(--text-secondary)]">
          {roundNumber}
        </span>
        <span className="text-sm text-[var(--text-primary)] truncate">
          {truncatedSentence}
        </span>
      </div>
      <span
        className={`flex-shrink-0 ml-2 text-sm font-semibold ${getScoreColor(round.score)}`}
      >
        {round.score}%
      </span>
    </div>
  );
}

export function SessionResults({
  rounds,
  totalScore,
  xpEarned,
  onPlayAgain,
  onExit,
}: SessionResultsProps): JSX.Element {
  const performance = getPerformanceMessage(totalScore);

  // Calculate stats
  const perfectRounds = rounds.filter((r) => r.score >= 90).length;
  const totalWords = rounds.reduce(
    (sum, r) => sum + r.wordComparison.filter((w) => w.status !== 'extra').length,
    0
  );
  const correctWords = rounds.reduce(
    (sum, r) => sum + r.wordComparison.filter((w) => w.status === 'correct').length,
    0
  );

  return (
    <div
      className="flex flex-col gap-4 p-4 max-h-full overflow-y-auto"
      role="region"
      aria-label="Session Results"
    >
      {/* Performance Header with Circular Progress */}
      <Card className="text-center">
        <p className="text-lg text-[var(--text-secondary)] mb-4">{performance}</p>
        <div className="flex justify-center mb-4">
          <CircularProgress score={totalScore} />
        </div>
        <p className="text-sm text-[var(--text-secondary)]">Overall Accuracy</p>
      </Card>

      {/* Stats Summary */}
      <Card>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 uppercase tracking-wide">
          Session Stats
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-echo-chamber">{rounds.length}</p>
            <p className="text-xs text-[var(--text-secondary)]">Sentences</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-500">{perfectRounds}</p>
            <p className="text-xs text-[var(--text-secondary)]">Perfect</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {correctWords}/{totalWords}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">Words</p>
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

      {/* Round-by-Round Breakdown */}
      <Card>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2 uppercase tracking-wide">
          Round Breakdown
        </h3>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {rounds.map((round, index) => (
            <RoundSummaryItem
              key={index}
              roundNumber={index + 1}
              round={round}
            />
          ))}
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
          className="!bg-echo-chamber hover:!bg-[#e68a00] active:!bg-[#cc7a00]"
        >
          Play Again
        </Button>
        <Button
          variant="secondary"
          size="md"
          fullWidth
          onClick={onExit}
          aria-label="Exit to dashboard"
          className="!border-echo-chamber !text-echo-chamber hover:!bg-orange-50 active:!bg-orange-100 dark:hover:!bg-orange-950/30 dark:active:!bg-orange-950/50"
        >
          Exit
        </Button>
      </div>
    </div>
  );
}
