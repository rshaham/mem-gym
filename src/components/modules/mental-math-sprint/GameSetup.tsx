import { useState } from 'react';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { ChevronLeftIcon } from '../../icons';
import type { MentalMathSprintDifficulty } from '../../../types';

interface GameSetupProps {
  initialDifficulty?: MentalMathSprintDifficulty;
  onStart: (difficulty: MentalMathSprintDifficulty, problemCount: number) => void;
  onBack: () => void;
}

const DIFFICULTY_OPTIONS: { value: MentalMathSprintDifficulty; label: string; description: string }[] = [
  { value: 'easy', label: 'Easy', description: '+/−, 2-3 steps, 15s' },
  { value: 'medium', label: 'Medium', description: '+/−/×, 3-4 steps, 12s' },
  { value: 'hard', label: 'Hard', description: '+/−/×/÷, 4-5 steps, 10s' },
  { value: 'expert', label: 'Expert', description: 'PEMDAS with ( ), 12s' },
];

const PROBLEM_COUNT_OPTIONS = [10, 15, 20, 25];

export function GameSetup({
  initialDifficulty = 'easy',
  onStart,
  onBack,
}: GameSetupProps): JSX.Element {
  const [difficulty, setDifficulty] = useState<MentalMathSprintDifficulty>(initialDifficulty);
  const [problemCount, setProblemCount] = useState(15);

  return (
    <div className="flex flex-col gap-6 px-4 py-6 max-w-md mx-auto">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Go back"
        >
          <ChevronLeftIcon className="w-6 h-6 text-[var(--text-primary)]" />
        </button>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Mental Math Sprint</h1>
      </div>

      {/* Difficulty selector */}
      <Card>
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">
          Difficulty
        </h2>
        <div className="flex rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
          {DIFFICULTY_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setDifficulty(option.value)}
              className={`flex-1 py-3 px-2 text-center transition-colors ${
                difficulty === option.value
                  ? 'bg-pink-500 text-white'
                  : 'bg-transparent text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className="font-semibold">{option.label}</span>
            </button>
          ))}
        </div>
        <p className="text-sm text-[var(--text-secondary)] mt-2 text-center">
          {DIFFICULTY_OPTIONS.find(o => o.value === difficulty)?.description}
        </p>
      </Card>

      {/* Problem count selector */}
      <Card>
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">
          Number of Problems
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {PROBLEM_COUNT_OPTIONS.map((count) => (
            <button
              key={count}
              onClick={() => setProblemCount(count)}
              className={`py-2 px-3 rounded-lg font-semibold transition-colors ${
                problemCount === count
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-[var(--text-primary)] hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {count}
            </button>
          ))}
        </div>
      </Card>

      {/* How to play */}
      <Card>
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">
          How to Play
        </h2>
        <ol className="space-y-2 text-sm text-[var(--text-primary)]">
          <li className="flex gap-2">
            <span className="text-pink-500 font-semibold">1.</span>
            <span>
              {difficulty === 'expert'
                ? 'Solve the expression using order of operations (PEMDAS)'
                : 'Follow the chain of operations from left to right'}
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-pink-500 font-semibold">2.</span>
            <span>Calculate the final answer mentally</span>
          </li>
          <li className="flex gap-2">
            <span className="text-pink-500 font-semibold">3.</span>
            <span>Enter your answer before time runs out</span>
          </li>
          <li className="flex gap-2">
            <span className="text-pink-500 font-semibold">4.</span>
            <span>Build a streak for bonus points!</span>
          </li>
        </ol>
      </Card>

      {/* Keyboard hint for desktop */}
      <p className="text-xs text-[var(--text-secondary)] text-center">
        Desktop: Use number keys and Enter to submit
      </p>

      {/* Start button */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={() => onStart(difficulty, problemCount)}
        className="bg-pink-500 hover:bg-pink-600"
      >
        Begin Training
      </Button>
    </div>
  );
}
