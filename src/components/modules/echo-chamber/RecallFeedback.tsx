import { Button } from '../../common/Button';
import { Card } from '../../common/Card';
import type { EchoChamberRound, WordComparison } from '../../../types';

interface RecallFeedbackProps {
  round: EchoChamberRound;
  onContinue: () => void;
}

function getWordStyle(status: WordComparison['status']): string {
  switch (status) {
    case 'correct':
      return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30';
    case 'incorrect':
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30';
    case 'missing':
      return 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 line-through';
    case 'extra':
      return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30';
    default:
      return '';
  }
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-500';
  if (score >= 50) return 'text-amber-500';
  return 'text-red-500';
}

function getPerformanceMessage(score: number): string {
  if (score >= 90) return 'Perfect!';
  if (score >= 80) return 'Excellent!';
  if (score >= 70) return 'Great job!';
  if (score >= 50) return 'Good effort!';
  if (score >= 30) return 'Keep practicing!';
  return 'Don\'t give up!';
}

function WordBadge({
  comparison,
}: {
  comparison: WordComparison;
}): JSX.Element {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-md text-sm font-medium mr-1 mb-1 ${getWordStyle(comparison.status)}`}
    >
      {comparison.word}
      {comparison.status === 'incorrect' && comparison.expected && (
        <span className="ml-1 text-xs opacity-70">
          (was: {comparison.expected})
        </span>
      )}
    </span>
  );
}

export function RecallFeedback({
  round,
  onContinue,
}: RecallFeedbackProps): JSX.Element {
  const { sentence, recalledText, score, wordComparison } = round;

  // Count each type of word status
  const counts = wordComparison.reduce(
    (acc, w) => {
      acc[w.status]++;
      return acc;
    },
    { correct: 0, incorrect: 0, missing: 0, extra: 0 }
  );

  return (
    <div className="min-h-screen flex flex-col p-4 bg-[var(--bg-secondary)]">
      <div className="flex-1 flex flex-col gap-4 max-w-md mx-auto w-full py-4">
        {/* Score Display */}
        <Card className="text-center">
          <p className="text-sm text-[var(--text-secondary)] mb-1">
            {getPerformanceMessage(score)}
          </p>
          <p
            className={`text-5xl font-bold ${getScoreColor(score)}`}
            aria-label={`Score: ${score} percent`}
          >
            {score}%
          </p>
        </Card>

        {/* Original Sentence */}
        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wide">
            Original Sentence
          </h3>
          <p className="text-lg text-[var(--text-primary)] leading-relaxed">
            {sentence}
          </p>
        </Card>

        {/* User's Response */}
        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wide">
            Your Response
          </h3>
          {recalledText.trim() ? (
            <p className="text-lg text-[var(--text-primary)] leading-relaxed">
              {recalledText}
            </p>
          ) : (
            <p className="text-lg text-[var(--text-secondary)] italic">
              (No response given)
            </p>
          )}
        </Card>

        {/* Word-by-Word Comparison */}
        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3 uppercase tracking-wide">
            Word Comparison
          </h3>
          <div className="flex flex-wrap mb-4">
            {wordComparison.map((comparison, index) => (
              <WordBadge key={`${comparison.word}-${index}`} comparison={comparison} />
            ))}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-xs border-t border-gray-200 dark:border-gray-700 pt-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-500" />
              <span className="text-[var(--text-secondary)]">
                Correct ({counts.correct})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-red-500" />
              <span className="text-[var(--text-secondary)]">
                Incorrect ({counts.incorrect})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-gray-400" />
              <span className="text-[var(--text-secondary)]">
                Missing ({counts.missing})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-orange-500" />
              <span className="text-[var(--text-secondary)]">
                Extra ({counts.extra})
              </span>
            </div>
          </div>
        </Card>

        {/* Continue Button */}
        <div className="mt-auto pt-4">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={onContinue}
            aria-label="Continue to next sentence"
            className="!bg-echo-chamber hover:!bg-[#e68a00] active:!bg-[#cc7a00]"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
