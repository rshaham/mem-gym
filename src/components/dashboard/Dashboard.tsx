import { Link } from 'react-router-dom';
import { Card } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';
import { useGame } from '../../context/GameContext';
import { getXPForLevel, getXPForNextLevel } from '../../utils/scoring';
import {
  FlameIcon,
  TrophyIcon,
  TargetIcon,
  GridIcon,
  VolumeIcon,
  EyeIcon,
  RewindIcon,
  ChevronRightIcon,
} from '../icons';
import type { ModuleType } from '../../types';

interface ModuleInfo {
  id: ModuleType;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  colorClass: string;
  bgClass: string;
}

const modules: ModuleInfo[] = [
  {
    id: 'dual-n-back',
    name: 'Dual N-Back',
    description: 'Train working memory with position and audio sequences',
    icon: GridIcon,
    colorClass: 'text-dual-n-back',
    bgClass: 'bg-dual-n-back-light dark:bg-dual-n-back/20',
  },
  {
    id: 'echo-chamber',
    name: 'Echo Chamber',
    description: 'Recall sentences after a silence period',
    icon: VolumeIcon,
    colorClass: 'text-echo-chamber',
    bgClass: 'bg-echo-chamber-light dark:bg-echo-chamber/20',
  },
  {
    id: 'detail-hunter',
    name: 'Detail Hunter',
    description: 'Remember visual details from images',
    icon: EyeIcon,
    colorClass: 'text-detail-hunter',
    bgClass: 'bg-detail-hunter-light dark:bg-detail-hunter/20',
  },
  {
    id: 'reverse-recall',
    name: 'Reverse Recall',
    description: 'Trace your day backwards in time',
    icon: RewindIcon,
    colorClass: 'text-reverse-recall',
    bgClass: 'bg-reverse-recall-light dark:bg-reverse-recall/20',
  },
];

export function Dashboard(): JSX.Element {
  const { progress } = useGame();

  const currentLevelXP = getXPForLevel(progress.level);
  const nextLevelXP = getXPForNextLevel(progress.level);
  const xpInCurrentLevel = progress.totalXP - currentLevelXP;
  const xpNeededForLevel = nextLevelXP - currentLevelXP;
  const levelProgress = (xpInCurrentLevel / xpNeededForLevel) * 100;

  return (
    <div className="p-4 space-y-6">
      {/* Welcome & Stats Card */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Welcome back!
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Keep training to level up
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-accent-primary">
                Lv.{progress.level}
              </div>
              <div className="text-xs text-[var(--text-secondary)]">
                {progress.totalXP} XP
              </div>
            </div>
          </div>

          <ProgressBar
            value={levelProgress}
            label={`${xpInCurrentLevel} / ${xpNeededForLevel} XP to next level`}
            color="primary"
          />

          <div className="flex items-center justify-around pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="text-center">
              <div className="flex justify-center mb-1">
                <FlameIcon className="text-orange-500" size={28} />
              </div>
              <div className="text-lg font-bold text-[var(--text-primary)]">
                {progress.currentStreak}
              </div>
              <div className="text-xs text-[var(--text-secondary)]">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-1">
                <TrophyIcon className="text-gold" size={28} />
              </div>
              <div className="text-lg font-bold text-[var(--text-primary)]">
                {progress.longestStreak}
              </div>
              <div className="text-xs text-[var(--text-secondary)]">Best Streak</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-1">
                <TargetIcon className="text-accent-primary" size={28} />
              </div>
              <div className="text-lg font-bold text-[var(--text-primary)]">
                {progress.achievements.length}
              </div>
              <div className="text-xs text-[var(--text-secondary)]">Achievements</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Training Modules */}
      <div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
          Training Modules
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {modules.map((module) => {
            const IconComponent = module.icon;
            return (
              <Link key={module.id} to={`/train/${module.id}`}>
                <Card variant="interactive" className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${module.bgClass}`}
                  >
                    <IconComponent className={module.colorClass} size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[var(--text-primary)]">
                      {module.name}
                    </h4>
                    <p className="text-sm text-[var(--text-secondary)] truncate">
                      {module.description}
                    </p>
                  </div>
                  <ChevronRightIcon className="text-[var(--text-secondary)]" size={20} />
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
