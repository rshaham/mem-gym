import { Card } from '../../common/Card';
import { ChainDisplay } from './ChainDisplay';
import type { SemanticChainCategory, SemanticChainDifficulty } from '../../../types';
import { getCategoryDisplayName } from '../../../data/categoryWords';

interface SessionResultsProps {
  category: SemanticChainCategory;
  difficulty: SemanticChainDifficulty;
  chainLength: number;
  wordsUsed: string[];
  xpEarned: number;
  gameOverReason: 'timeout' | 'invalid' | 'no-words' | null;
  onPlayAgain: () => void;
  onExit: () => void;
}

function getResultMessage(chainLength: number, reason: 'timeout' | 'invalid' | 'no-words' | null): { title: string; subtitle: string } {
  if (reason === 'no-words') {
    return {
      title: 'Perfect Chain!',
      subtitle: 'You used all available words for that letter!',
    };
  }

  if (chainLength >= 15) {
    return {
      title: 'Amazing!',
      subtitle: 'You\'re a word chain master!',
    };
  }
  if (chainLength >= 10) {
    return {
      title: 'Great Job!',
      subtitle: 'Impressive word skills!',
    };
  }
  if (chainLength >= 5) {
    return {
      title: 'Good Work!',
      subtitle: 'Keep practicing to build longer chains!',
    };
  }
  return {
    title: 'Nice Try!',
    subtitle: 'Practice makes perfect!',
  };
}

function getReasonText(reason: 'timeout' | 'invalid' | 'no-words' | null): string {
  switch (reason) {
    case 'timeout':
      return 'Time ran out';
    case 'invalid':
      return 'Invalid word';
    case 'no-words':
      return 'No more words available';
    default:
      return '';
  }
}

export function SessionResults({
  category,
  difficulty,
  chainLength,
  wordsUsed,
  xpEarned,
  gameOverReason,
  onPlayAgain,
  onExit,
}: SessionResultsProps): JSX.Element {
  const { title, subtitle } = getResultMessage(chainLength, gameOverReason);
  const reasonText = getReasonText(gameOverReason);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 text-center border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{title}</h1>
        <p className="text-[var(--text-secondary)]">{subtitle}</p>
      </div>

      {/* Results content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Game over reason */}
        {reasonText && (
          <div className="text-center">
            <span className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${gameOverReason === 'no-words'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
              }
            `}>
              {reasonText}
            </span>
          </div>
        )}

        {/* Stats */}
        <Card>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-accent-primary">{chainLength}</p>
              <p className="text-sm text-[var(--text-secondary)]">Words Chained</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">+{xpEarned}</p>
              <p className="text-sm text-[var(--text-secondary)]">XP Earned</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Category</span>
              <span className="font-medium text-[var(--text-primary)]">
                {getCategoryDisplayName(category)}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-[var(--text-secondary)]">Difficulty</span>
              <span className="font-medium text-[var(--text-primary)] capitalize">{difficulty}</span>
            </div>
          </div>
        </Card>

        {/* Chain display */}
        <div>
          <h3 className="font-semibold text-[var(--text-primary)] mb-2">Your Chain</h3>
          <ChainDisplay chain={wordsUsed} highlightLast={false} />
        </div>

        {/* XP breakdown */}
        <Card>
          <h3 className="font-semibold text-[var(--text-primary)] mb-3">XP Breakdown</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Base XP</span>
              <span className="text-[var(--text-primary)]">+20</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Chain Bonus ({chainLength} × 3)</span>
              <span className="text-[var(--text-primary)]">+{chainLength * 3}</span>
            </div>
            {chainLength >= 15 && (
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Master Bonus (15+ words)</span>
                <span className="text-[var(--text-primary)]">+50</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">
                Difficulty ({difficulty} × {difficulty === 'easy' ? '1' : difficulty === 'medium' ? '1.5' : '2'})
              </span>
              <span className="text-[var(--text-primary)]">×{difficulty === 'easy' ? '1' : difficulty === 'medium' ? '1.5' : '2'}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700 font-semibold">
              <span className="text-[var(--text-primary)]">Total</span>
              <span className="text-green-500">+{xpEarned} XP</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Action buttons */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
        <button
          onClick={onPlayAgain}
          className="w-full py-4 bg-accent-primary text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity"
        >
          Play Again
        </button>
        <button
          onClick={onExit}
          className="w-full py-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
