import { Card } from '../../common/Card';

interface GameSetupProps {
  onStart: (level: 1 | 2 | 3) => void;
  onBack: () => void;
}

interface LevelOption {
  level: 1 | 2 | 3;
  title: string;
  difficulty: string;
  description: string;
}

const LEVEL_OPTIONS: LevelOption[] = [
  {
    level: 1,
    title: 'Level 1',
    difficulty: 'Easy',
    description: 'Recall 3 events with sensory details',
  },
  {
    level: 2,
    title: 'Level 2',
    difficulty: 'Medium',
    description: 'Recall 5 events with sensory details',
  },
  {
    level: 3,
    title: 'Level 3',
    difficulty: 'Hard',
    description: '5+ events with sensory details',
  },
];

export function GameSetup({ onStart, onBack }: GameSetupProps): JSX.Element {
  return (
    <div className="flex flex-col gap-6 px-4 py-6 max-w-md mx-auto">
      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors w-fit -mb-2"
        aria-label="Go back to home"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-reverse-recall mb-2">
          Reverse Recall
        </h1>
        <p className="text-[var(--text-secondary)]">
          Train your memory by recalling events in reverse chronological order.
          Start with your most recent memory and work backwards.
        </p>
      </div>

      {/* Level Selection */}
      <div className="flex flex-col gap-3">
        {LEVEL_OPTIONS.map((option) => (
          <Card
            key={option.level}
            variant="interactive"
            className="cursor-pointer"
            onClick={() => onStart(option.level)}
            role="button"
            tabIndex={0}
            aria-label={`Start ${option.title}: ${option.difficulty} - ${option.description}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onStart(option.level);
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-semibold text-[var(--text-primary)]">
                    {option.title}
                  </h2>
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-reverse-recall/10 text-reverse-recall">
                    {option.difficulty}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  {option.description}
                </p>
              </div>
              <div className="ml-3 text-reverse-recall" aria-hidden="true">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* How to Play */}
      <Card>
        <h3 className="font-semibold text-[var(--text-primary)] mb-3">
          How to Play
        </h3>
        <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
          <li className="flex gap-2">
            <span className="text-reverse-recall font-bold">1.</span>
            <span>Think of events from your day in reverse order</span>
          </li>
          <li className="flex gap-2">
            <span className="text-reverse-recall font-bold">2.</span>
            <span>Start with the most recent event and work backwards</span>
          </li>
          <li className="flex gap-2">
            <span className="text-reverse-recall font-bold">3.</span>
            <span>Log each event with as much detail as you can remember</span>
          </li>
        </ul>
        <div className="mt-3 p-2 bg-green-50 dark:bg-green-950/30 rounded-lg">
          <p className="text-xs text-green-800 dark:text-green-200">
            <strong>Tip:</strong> Adding sensory details (what you saw, heard,
            smelled) strengthens memory connections.
          </p>
        </div>
      </Card>
    </div>
  );
}
