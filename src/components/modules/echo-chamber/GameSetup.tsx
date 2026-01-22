import { useState } from 'react';
import { Button } from '../../common/Button';
import { Card } from '../../common/Card';
import type { EchoChamberDifficulty, EchoChamberMode } from '../../../types';

interface GameSetupProps {
  onStart: (difficulty: EchoChamberDifficulty, mode: EchoChamberMode, sessionLength: number) => void;
}

const DIFFICULTY_OPTIONS: { value: EchoChamberDifficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
  { value: 'expert', label: 'Expert' },
];

const MODE_OPTIONS: { value: EchoChamberMode; label: string; description: string }[] = [
  { value: 'visual', label: 'Visual', description: 'Read the sentence' },
  { value: 'audio', label: 'Audio', description: 'Listen to the sentence' },
];

const SESSION_LENGTH_OPTIONS = [3, 5, 10] as const;

export function GameSetup({ onStart }: GameSetupProps): JSX.Element {
  const [selectedDifficulty, setSelectedDifficulty] = useState<EchoChamberDifficulty>('medium');
  const [selectedMode, setSelectedMode] = useState<EchoChamberMode>('visual');
  const [selectedSessionLength, setSelectedSessionLength] = useState<number>(5);

  function handleStart(): void {
    onStart(selectedDifficulty, selectedMode, selectedSessionLength);
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 max-w-md mx-auto">
      {/* Difficulty Selector */}
      <Card>
        <p className="text-sm font-medium text-[var(--text-secondary)] mb-3 text-center uppercase tracking-wide">
          Difficulty
        </p>
        <div
          className="grid grid-cols-2 gap-2"
          role="group"
          aria-label="Select difficulty level"
        >
          {DIFFICULTY_OPTIONS.map((option) => {
            const isSelected = selectedDifficulty === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedDifficulty(option.value)}
                aria-pressed={isSelected ? 'true' : 'false'}
                aria-label={`Difficulty: ${option.label}`}
                className={`
                  py-3 px-4 text-base font-medium rounded-xl
                  border-2 transition-all duration-fast
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-echo-chamber focus-visible:ring-offset-2
                  ${
                    isSelected
                      ? 'bg-echo-chamber text-white border-echo-chamber'
                      : 'bg-[var(--bg-primary)] text-[var(--text-primary)] border-gray-200 dark:border-gray-700 hover:border-echo-chamber/50 active:bg-gray-100 dark:active:bg-gray-800'
                  }
                `}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Mode Selector */}
      <Card>
        <p className="text-sm font-medium text-[var(--text-secondary)] mb-3 text-center uppercase tracking-wide">
          Mode
        </p>
        <div
          className="flex rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700"
          role="group"
          aria-label="Select presentation mode"
        >
          {MODE_OPTIONS.map((option) => {
            const isSelected = selectedMode === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedMode(option.value)}
                aria-pressed={isSelected ? 'true' : 'false'}
                aria-label={`Mode: ${option.label} - ${option.description}`}
                className={`
                  flex-1 py-3 px-4 text-base font-medium
                  transition-all duration-fast
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-echo-chamber
                  ${
                    isSelected
                      ? 'bg-echo-chamber text-white'
                      : 'bg-[var(--bg-primary)] text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700'
                  }
                `}
              >
                <div className="flex flex-col items-center">
                  <span>{option.label}</span>
                  <span className={`text-xs mt-0.5 ${isSelected ? 'text-white/80' : 'text-[var(--text-secondary)]'}`}>
                    {option.description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Session Length Selector */}
      <Card>
        <p className="text-sm font-medium text-[var(--text-secondary)] mb-3 text-center uppercase tracking-wide">
          Session Length
        </p>
        <div
          className="flex rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700"
          role="group"
          aria-label="Select number of sentences"
        >
          {SESSION_LENGTH_OPTIONS.map((length) => {
            const isSelected = selectedSessionLength === length;
            return (
              <button
                key={length}
                type="button"
                onClick={() => setSelectedSessionLength(length)}
                aria-pressed={isSelected ? 'true' : 'false'}
                aria-label={`${length} sentences`}
                className={`
                  flex-1 py-3 text-base font-medium
                  transition-all duration-fast
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-echo-chamber
                  ${
                    isSelected
                      ? 'bg-echo-chamber text-white'
                      : 'bg-[var(--bg-primary)] text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700'
                  }
                `}
              >
                {length}
              </button>
            );
          })}
        </div>
        <p className="text-sm text-[var(--text-secondary)] mt-2 text-center">
          {selectedSessionLength} sentence{selectedSessionLength > 1 ? 's' : ''} per session
        </p>
      </Card>

      {/* How to Play */}
      <Card>
        <h3 className="font-semibold text-[var(--text-primary)] mb-3">How to Play</h3>
        <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
          <li className="flex gap-2">
            <span className="text-echo-chamber font-bold">1.</span>
            <span>
              {selectedMode === 'visual' ? 'Read' : 'Listen to'} the sentence carefully
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-echo-chamber font-bold">2.</span>
            <span>Wait during the silence period</span>
          </li>
          <li className="flex gap-2">
            <span className="text-echo-chamber font-bold">3.</span>
            <span>Type what you remember <strong className="text-[var(--text-primary)]">word for word</strong></span>
          </li>
        </ul>
        <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
          <p className="text-xs text-orange-800 dark:text-orange-200">
            <strong>Tip:</strong> Focus on the meaning and structure of the sentence to aid recall.
          </p>
        </div>
      </Card>

      {/* Begin Button */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={handleStart}
        aria-label={`Begin training with ${selectedDifficulty} difficulty, ${selectedMode} mode, and ${selectedSessionLength} sentences`}
        className="text-xl py-4 !bg-echo-chamber hover:!bg-[#e68a00] active:!bg-[#cc7a00]"
      >
        Begin Training
      </Button>
    </div>
  );
}
