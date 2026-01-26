import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import type { SudokuDifficulty } from '../../../types';

interface SessionResultsProps {
  difficulty: SudokuDifficulty;
  timeElapsed: number;
  moveCount: number;
  xpEarned: number;
  onPlayAgain: () => void;
  onExit: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getPerformanceMessage(difficulty: SudokuDifficulty, timeSeconds: number): string {
  const targets = { easy: 600, medium: 900, hard: 1200 };
  const target = targets[difficulty];

  if (timeSeconds < target * 0.5) return 'Lightning Fast!';
  if (timeSeconds < target * 0.75) return 'Excellent Speed!';
  if (timeSeconds < target) return 'Great Job!';
  return 'Puzzle Complete!';
}

function getDifficultyLabel(difficulty: SudokuDifficulty): string {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}

export function SessionResults({
  difficulty,
  timeElapsed,
  moveCount,
  xpEarned,
  onPlayAgain,
  onExit,
}: SessionResultsProps): JSX.Element {
  const message = getPerformanceMessage(difficulty, timeElapsed);

  // Calculate XP breakdown
  const baseXP = 40;
  const difficultyMultiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : 2.5;
  const difficultyXP = Math.floor(baseXP * difficultyMultiplier);

  const targets = { easy: 600, medium: 900, hard: 1200 };
  const target = targets[difficulty];
  let timeBonus = 0;
  if (timeElapsed < target * 0.5) timeBonus = 50;
  else if (timeElapsed < target * 0.75) timeBonus = 25;
  else if (timeElapsed < target) timeBonus = 10;

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Header */}
      <Card className="text-center">
        <p className="text-lg text-[var(--text-secondary)] mb-2">{message}</p>
        <div className="text-5xl font-bold text-accent-success mb-2">
          {formatTime(timeElapsed)}
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          {getDifficultyLabel(difficulty)} Puzzle Completed
        </p>
      </Card>

      {/* Stats */}
      <Card>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wide mb-3">
          Statistics
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-[var(--text-primary)]">{moveCount}</p>
            <p className="text-xs text-[var(--text-secondary)]">Moves</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[var(--text-primary)]">{formatTime(timeElapsed)}</p>
            <p className="text-xs text-[var(--text-secondary)]">Time</p>
          </div>
        </div>
      </Card>

      {/* XP Breakdown */}
      <Card>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wide mb-3">
          XP Earned
        </h3>
        <div className="space-y-2 mb-3">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Base XP</span>
            <span className="text-[var(--text-primary)]">+{baseXP}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">
              Difficulty ({getDifficultyLabel(difficulty)})
            </span>
            <span className="text-accent-primary">+{difficultyXP - baseXP}</span>
          </div>
          {timeBonus > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Speed Bonus</span>
              <span className="text-accent-success">+{timeBonus}</span>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
          <span className="font-semibold text-[var(--text-primary)]">Total</span>
          <span className="text-2xl font-bold text-accent-primary">+{xpEarned} XP</span>
        </div>
      </Card>

      {/* Actions */}
      <div className="mt-auto space-y-3">
        <Button variant="primary" size="lg" fullWidth onClick={onPlayAgain}>
          Play Again
        </Button>
        <Button variant="ghost" size="md" fullWidth onClick={onExit}>
          Exit
        </Button>
      </div>
    </div>
  );
}
