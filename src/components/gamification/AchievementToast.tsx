import { useEffect, useCallback } from 'react';
import { useMotion } from '../../hooks/useMotion';
import { TrophyIcon, StarIcon, FlameIcon, TargetIcon, ZapIcon, GridIcon, BrainIcon, EyeIcon } from '../icons';
import type { Achievement } from '../../types';

interface AchievementToastProps {
  achievement: Achievement;
  onDismiss: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  flame: FlameIcon,
  star: StarIcon,
  target: TargetIcon,
  zap: ZapIcon,
  grid: GridIcon,
  brain: BrainIcon,
  eye: EyeIcon,
  trophy: TrophyIcon,
};

export function AchievementToast({ achievement, onDismiss }: AchievementToastProps): JSX.Element {
  const { animations } = useMotion();

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const handleDismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  // Get icon component
  const IconComponent = iconMap[achievement.icon] ?? TrophyIcon;

  return (
    <div
      className={`fixed top-4 left-4 right-4 z-50 mx-auto max-w-sm ${animations.slideDown}`}
      role="alert"
      aria-live="polite"
    >
      <div
        className="bg-gradient-to-r from-gold-dark to-gold rounded-xl p-4 shadow-lg cursor-pointer"
        onClick={handleDismiss}
      >
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <IconComponent className="text-white" size={24} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-0.5">
              Achievement Unlocked!
            </p>
            <h3 className="font-bold text-white text-lg leading-tight">
              {achievement.name}
            </h3>
            <p className="text-sm text-white/90 truncate">
              {achievement.description}
            </p>
          </div>

          {/* XP Reward */}
          <div className="text-right flex-shrink-0">
            <div className="text-lg font-bold text-white">
              +{achievement.xpReward}
            </div>
            <div className="text-xs text-white/80">XP</div>
          </div>
        </div>
      </div>
    </div>
  );
}
