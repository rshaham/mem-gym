interface StreakIndicatorProps {
  currentStreak: number;
  bestStreak: number;
}

export function StreakIndicator({
  currentStreak,
  bestStreak,
}: StreakIndicatorProps): JSX.Element {
  // Scale the flame size based on streak
  const flameScale = Math.min(1 + currentStreak * 0.05, 1.5);
  const showFlame = currentStreak > 0;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
      {/* Flame icon */}
      <div
        className={`transition-transform duration-200 ${showFlame ? 'text-orange-500' : 'text-gray-400'}`}
        style={{ transform: `scale(${showFlame ? flameScale : 1})` }}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 23C8.5 23 5 20.5 5 16c0-3 2-5.5 3.5-7.5.5-.65 1.5-.65 1.5 0-.5 2.5.5 4.5.5 4.5s1.5-3.5 3-6C14.5 5 13.5 2.5 12 1c5 1.5 9 6 9 12 0 5.5-4.5 10-9 10z" />
        </svg>
      </div>

      {/* Current streak */}
      <span className={`text-sm font-semibold ${showFlame ? 'text-orange-500' : 'text-[var(--text-secondary)]'}`}>
        {currentStreak}
      </span>

      {/* Best streak indicator */}
      {bestStreak > 0 && (
        <span className="text-xs text-[var(--text-secondary)]">
          (best: {bestStreak})
        </span>
      )}
    </div>
  );
}
