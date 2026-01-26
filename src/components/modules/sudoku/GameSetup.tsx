import { useState } from 'react';
import { Card } from '../../common/Card';
import { Button } from '../../common/Button';
import { ChevronLeftIcon, GridIcon } from '../../icons';
import type { SudokuDifficulty } from '../../../types';

interface GameSetupProps {
  onStart: (difficulty: SudokuDifficulty) => void;
  onBack: () => void;
}

const DIFFICULTIES: { value: SudokuDifficulty; label: string; description: string; clues: string }[] = [
  { value: 'easy', label: 'Easy', description: 'Great for beginners', clues: '35-40 clues' },
  { value: 'medium', label: 'Medium', description: 'A balanced challenge', clues: '28-34 clues' },
  { value: 'hard', label: 'Hard', description: 'For experienced players', clues: '22-27 clues' },
];

export function GameSetup({ onStart, onBack }: GameSetupProps): JSX.Element {
  const [difficulty, setDifficulty] = useState<SudokuDifficulty>('easy');

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Go back"
        >
          <ChevronLeftIcon className="w-6 h-6 text-[var(--text-primary)]" />
        </button>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Sudoku</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Module info */}
        <Card className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <GridIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            Train Your Logic
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Complete the 9x9 grid so every row, column, and 3x3 box contains digits 1-9.
            Use notes to track possibilities.
          </p>
        </Card>

        {/* Difficulty selection */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wide mb-3">
            Select Difficulty
          </h3>
          <div className="space-y-2">
            {DIFFICULTIES.map(({ value, label, description, clues }) => (
              <button
                key={value}
                onClick={() => setDifficulty(value)}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  difficulty === value
                    ? 'bg-accent-primary/10 border-2 border-accent-primary'
                    : 'bg-[var(--bg-primary)] border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                }`}
                aria-pressed={difficulty === value}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-semibold ${difficulty === value ? 'text-accent-primary' : 'text-[var(--text-primary)]'}`}>
                      {label}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">{description}</p>
                  </div>
                  <span className="text-xs text-[var(--text-secondary)] bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    {clues}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* How to play */}
        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wide mb-3">
            How to Play
          </h3>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li className="flex gap-2">
              <span className="text-accent-primary font-bold">1.</span>
              Tap a cell to select it
            </li>
            <li className="flex gap-2">
              <span className="text-accent-primary font-bold">2.</span>
              Tap a number to place it in the cell
            </li>
            <li className="flex gap-2">
              <span className="text-accent-primary font-bold">3.</span>
              Use Notes mode to track possible numbers
            </li>
            <li className="flex gap-2">
              <span className="text-accent-primary font-bold">4.</span>
              Notes auto-clear when you place a number nearby
            </li>
          </ul>
        </Card>
      </div>

      {/* Start button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => onStart(difficulty)}
        >
          Start Puzzle
        </Button>
      </div>
    </div>
  );
}
