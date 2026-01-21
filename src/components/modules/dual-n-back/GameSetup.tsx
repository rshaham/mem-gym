import { useState } from 'react';
import { Button } from '../../common/Button';
import { Card } from '../../common/Card';

interface GameSetupProps {
  initialNLevel: number;
  onStart: (trialCount: number, nLevel: number) => void;
}

const TRIAL_OPTIONS = [15, 20, 25, 30] as const;
const N_LEVEL_OPTIONS = [1, 2, 3, 4, 5] as const;

export function GameSetup({ initialNLevel, onStart }: GameSetupProps): JSX.Element {
  const [selectedTrials, setSelectedTrials] = useState<number>(20);
  const [selectedN, setSelectedN] = useState<number>(initialNLevel);

  function handleStart(): void {
    onStart(selectedTrials, selectedN);
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 max-w-md mx-auto">
      {/* N-Level Selector */}
      <Card>
        <p className="text-sm font-medium text-[var(--text-secondary)] mb-2 text-center uppercase tracking-wide">
          Difficulty Level
        </p>
        <div
          className="flex rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700"
          role="group"
          aria-label="Select N level"
        >
          {N_LEVEL_OPTIONS.map((n) => {
            const isSelected = selectedN === n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setSelectedN(n)}
                aria-pressed={isSelected ? 'true' : 'false'}
                aria-label={`N=${n}`}
                className={`
                  flex-1 py-3 text-base font-medium
                  transition-all duration-fast
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-dual-n-back
                  ${
                    isSelected
                      ? 'bg-dual-n-back text-white'
                      : 'bg-[var(--bg-primary)] text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700'
                  }
                `}
              >
                {n}
              </button>
            );
          })}
        </div>
        <p className="text-sm text-[var(--text-secondary)] mt-2 text-center">
          Remember {selectedN} step{selectedN > 1 ? 's' : ''} back
        </p>
      </Card>

      {/* How to Play */}
      <Card>
        <h3 className="font-semibold text-[var(--text-primary)] mb-3">How to Play</h3>
        <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
          <li className="flex gap-2">
            <span className="text-dual-n-back font-bold">1.</span>
            <span>Each turn shows a <strong className="text-[var(--text-primary)]">square</strong> and plays a <strong className="text-[var(--text-primary)]">letter</strong></span>
          </li>
          <li className="flex gap-2">
            <span className="text-dual-n-back font-bold">2.</span>
            <span>Remember what happened {selectedN} turn{selectedN > 1 ? 's' : ''} ago</span>
          </li>
          <li className="flex gap-2">
            <span className="text-dual-n-back font-bold">3.</span>
            <span>
              Press <strong className="text-[var(--text-primary)]">Position</strong> only if the square is in the <em>same spot</em> as {selectedN} turn{selectedN > 1 ? 's' : ''} ago
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-dual-n-back font-bold">4.</span>
            <span>
              Press <strong className="text-[var(--text-primary)]">Sound</strong> only if the letter is the <em>same</em> as {selectedN} turn{selectedN > 1 ? 's' : ''} ago
            </span>
          </li>
        </ul>
        <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
          <p className="text-xs text-amber-800 dark:text-amber-200">
            <strong>Important:</strong> Most turns will NOT have a match. If nothing matches, don't press anything - that's correct!
          </p>
        </div>
        <p className="mt-2 text-xs text-[var(--text-secondary)]">
          Keyboard: <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[var(--text-primary)] font-mono">A</kbd> = Position, <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[var(--text-primary)] font-mono">L</kbd> = Sound
        </p>
      </Card>

      {/* Trial Count Selector */}
      <Card>
        <p className="text-sm font-medium text-[var(--text-secondary)] mb-3 text-center">
          Number of Trials
        </p>
        <div
          className="flex rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700"
          role="group"
          aria-label="Select number of trials"
        >
          {TRIAL_OPTIONS.map((count) => {
            const isSelected = selectedTrials === count;
            return (
              <button
                key={count}
                type="button"
                onClick={() => setSelectedTrials(count)}
                aria-pressed={isSelected ? 'true' : 'false'}
                aria-label={`${count} trials`}
                className={`
                  flex-1 py-3 text-base font-medium
                  transition-all duration-fast
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-dual-n-back
                  ${
                    isSelected
                      ? 'bg-dual-n-back text-white'
                      : 'bg-[var(--bg-primary)] text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700'
                  }
                `}
              >
                {count}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Begin Button */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={handleStart}
        aria-label={`Begin training with ${selectedTrials} trials at level ${selectedN}`}
        className="text-xl py-4"
      >
        Begin Training
      </Button>
    </div>
  );
}
