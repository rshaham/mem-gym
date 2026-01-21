import { useState } from 'react';
import { Button } from '../../common/Button';
import { Card } from '../../common/Card';

interface GameSetupProps {
  onStart: (category: string, viewingTime: number, delayMinutes: number) => void;
  availableCategories: string[];
}

const VIEWING_TIME_OPTIONS = [10, 15, 20, 30] as const;
const DELAY_OPTIONS = [
  { label: 'Instant', value: 0 },
  { label: '30 min', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 },
] as const;

const DEFAULT_CATEGORIES = ['Nature', 'Urban', 'Animals', 'Food'];

export function GameSetup({ onStart, availableCategories }: GameSetupProps): JSX.Element {
  const categories = availableCategories.length > 0 ? availableCategories : DEFAULT_CATEGORIES;

  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]);
  const [selectedViewingTime, setSelectedViewingTime] = useState<number>(15);
  const [selectedDelay, setSelectedDelay] = useState<number>(0);

  function handleStart(): void {
    onStart(selectedCategory, selectedViewingTime, selectedDelay);
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 max-w-md mx-auto">
      {/* Category Selector */}
      <Card>
        <p className="text-sm font-medium text-[var(--text-secondary)] mb-3 text-center uppercase tracking-wide">
          Category
        </p>
        <div
          className="grid grid-cols-2 gap-2"
          role="group"
          aria-label="Select image category"
        >
          {categories.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                aria-pressed={isSelected ? 'true' : 'false'}
                aria-label={`Category: ${category}`}
                className={`
                  py-3 px-4 text-base font-medium rounded-xl
                  border-2 transition-all duration-fast
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-detail-hunter focus-visible:ring-offset-2
                  ${
                    isSelected
                      ? 'bg-detail-hunter text-white border-detail-hunter'
                      : 'bg-[var(--bg-primary)] text-[var(--text-primary)] border-gray-200 dark:border-gray-700 hover:border-detail-hunter/50 active:bg-gray-100 dark:active:bg-gray-800'
                  }
                `}
              >
                {category}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Viewing Time Selector */}
      <Card>
        <p className="text-sm font-medium text-[var(--text-secondary)] mb-3 text-center uppercase tracking-wide">
          Viewing Time
        </p>
        <div
          className="flex rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700"
          role="group"
          aria-label="Select viewing time"
        >
          {VIEWING_TIME_OPTIONS.map((time) => {
            const isSelected = selectedViewingTime === time;
            return (
              <button
                key={time}
                type="button"
                onClick={() => setSelectedViewingTime(time)}
                aria-pressed={isSelected ? 'true' : 'false'}
                aria-label={`${time} seconds`}
                className={`
                  flex-1 py-3 text-base font-medium
                  transition-all duration-fast
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-detail-hunter
                  ${
                    isSelected
                      ? 'bg-detail-hunter text-white'
                      : 'bg-[var(--bg-primary)] text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700'
                  }
                `}
              >
                {time}s
              </button>
            );
          })}
        </div>
        <p className="text-sm text-[var(--text-secondary)] mt-2 text-center">
          Study the image for {selectedViewingTime} seconds
        </p>
      </Card>

      {/* Delay Selector */}
      <Card>
        <p className="text-sm font-medium text-[var(--text-secondary)] mb-3 text-center uppercase tracking-wide">
          Delay Before Questions
        </p>
        <div
          className="flex rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700"
          role="group"
          aria-label="Select delay before questions"
        >
          {DELAY_OPTIONS.map((option) => {
            const isSelected = selectedDelay === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedDelay(option.value)}
                aria-pressed={isSelected ? 'true' : 'false'}
                aria-label={`Delay: ${option.label}`}
                className={`
                  flex-1 py-3 text-sm font-medium
                  transition-all duration-fast
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-detail-hunter
                  ${
                    isSelected
                      ? 'bg-detail-hunter text-white'
                      : 'bg-[var(--bg-primary)] text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700'
                  }
                `}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </Card>

      {/* How to Play */}
      <Card>
        <h3 className="font-semibold text-[var(--text-primary)] mb-3">How to Play</h3>
        <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
          <li className="flex gap-2">
            <span className="text-detail-hunter font-bold">1.</span>
            <span>
              You'll see an image for <strong className="text-[var(--text-primary)]">{selectedViewingTime} seconds</strong>
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-detail-hunter font-bold">2.</span>
            <span>
              {selectedDelay === 0
                ? 'Immediately answer questions about what you saw'
                : `After ${selectedDelay >= 60 ? `${selectedDelay / 60} hour${selectedDelay >= 120 ? 's' : ''}` : `${selectedDelay} minutes`}, answer questions about what you saw`}
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-detail-hunter font-bold">3.</span>
            <span>Try to remember as many <strong className="text-[var(--text-primary)]">details</strong> as possible</span>
          </li>
        </ul>
        <div className="mt-3 p-2 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
          <p className="text-xs text-purple-800 dark:text-purple-200">
            <strong>Tip:</strong> Focus on specific details like colors, numbers, positions, and unique features in the image.
          </p>
        </div>
      </Card>

      {/* Begin Button */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={handleStart}
        aria-label={`Begin training with ${selectedCategory} images, ${selectedViewingTime} second viewing time, and ${selectedDelay === 0 ? 'no' : selectedDelay + ' minute'} delay`}
        className="text-xl py-4 !bg-detail-hunter hover:!bg-[#4745c5] active:!bg-[#3a39a8]"
      >
        Begin Training
      </Button>
    </div>
  );
}
