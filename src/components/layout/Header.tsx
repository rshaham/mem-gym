import { useGame } from '../../context/GameContext';
import { FlameIcon, StarIcon } from '../icons';

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
          <div className="flex items-center gap-4">
            {/* Streak */}
            <div className="flex items-center gap-1.5">
              <FlameIcon size={18} className="text-accent-warning" />
              <span className="font-semibold text-sm text-[var(--text-primary)] font-mono">
                {progress.currentStreak}
              </span>
            </div>

            {/* Level */}
            <div className="flex items-center gap-1.5">
              <StarIcon size={18} className="text-gold" />
              <span className="font-semibold text-sm text-[var(--text-primary)]">
                Lv.{progress.level}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
