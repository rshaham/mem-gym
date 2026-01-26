import { useState } from 'react';
import { Card } from '../../common/Card';
import { ChevronLeftIcon } from '../../icons';
import type { SemanticChainCategory, SemanticChainDifficulty } from '../../../types';
import { getAllCategories, getCategoryDisplayName } from '../../../data/categoryWords';

interface GameSetupProps {
  onStart: (category: SemanticChainCategory, difficulty: SemanticChainDifficulty) => void;
  onBack: () => void;
}

const CATEGORY_ICONS: Record<SemanticChainCategory, string> = {
  animals: '🐾',
  foods: '🍎',
  countries: '🌍',
  colors: '🎨',
  occupations: '👔',
  science: '🔬',
  psychology: '🧠',
  technology: '💻',
};

const DIFFICULTY_INFO: Record<SemanticChainDifficulty, { label: string; description: string }> = {
  easy: { label: 'Easy', description: '15 seconds per word, no time decay' },
  medium: { label: 'Medium', description: '12 seconds, gets faster as you go' },
  hard: { label: 'Hard', description: '10 seconds, rapid time decay' },
};

export function GameSetup({ onStart, onBack }: GameSetupProps): JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState<SemanticChainCategory>('animals');
  const [selectedDifficulty, setSelectedDifficulty] = useState<SemanticChainDifficulty>('easy');

  const categories = getAllCategories();

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
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Semantic Chain</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Instructions */}
        <Card>
          <h2 className="font-semibold text-[var(--text-primary)] mb-2">How to Play</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Build a chain of words! Each word must start with the last letter of the previous word
            and belong to the selected category. Type fast before time runs out!
          </p>
        </Card>

        {/* Category Selection */}
        <div>
          <h2 className="font-semibold text-[var(--text-primary)] mb-3">Select Category</h2>
          <div className="grid grid-cols-2 gap-3">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedCategory === cat
                    ? 'border-accent-primary bg-accent-primary/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span className="text-2xl mb-2 block">{CATEGORY_ICONS[cat]}</span>
                <span className={`font-medium ${
                  selectedCategory === cat ? 'text-accent-primary' : 'text-[var(--text-primary)]'
                }`}>
                  {getCategoryDisplayName(cat)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div>
          <h2 className="font-semibold text-[var(--text-primary)] mb-3">Select Difficulty</h2>
          <div className="space-y-3">
            {(Object.entries(DIFFICULTY_INFO) as [SemanticChainDifficulty, typeof DIFFICULTY_INFO['easy']][]).map(
              ([diff, info]) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedDifficulty === diff
                      ? 'border-accent-primary bg-accent-primary/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <span className={`font-semibold block ${
                    selectedDifficulty === diff ? 'text-accent-primary' : 'text-[var(--text-primary)]'
                  }`}>
                    {info.label}
                  </span>
                  <span className="text-sm text-[var(--text-secondary)]">
                    {info.description}
                  </span>
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={() => onStart(selectedCategory, selectedDifficulty)}
          className="w-full py-4 bg-accent-primary text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity"
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
