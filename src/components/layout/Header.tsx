import { useGame } from '../../context/GameContext';

interface HeaderProps {
  title?: string;
  showStats?: boolean;
}

export function Header({ title = 'Memory Gym', showStats = true }: HeaderProps): JSX.Element {
  const { progress } = useGame();

  return (
    <header className="sticky top-0 z-10 bg-[var(--bg-primary)] border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between px-4 h-14">
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h1>

        {showStats && (
          <div className="flex items-center gap-3">
            {/* Streak */}
            <div className="flex items-center gap-1 text-sm">
              <span className="text-accent-warning">🔥</span>
              <span className="font-medium text-[var(--text-primary)]">
                {progress.currentStreak}
              </span>
            </div>

            {/* Level & XP */}
            <div className="flex items-center gap-1 text-sm">
              <span className="text-accent-primary">⭐</span>
              <span className="font-medium text-[var(--text-primary)]">
                Lv.{progress.level}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
