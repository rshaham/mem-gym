import { useEffect, useCallback } from 'react';
import { useMotion } from '../../hooks/useMotion';
import { StarIcon, ZapIcon } from '../icons';
import type { LevelUpResult } from '../../types';

interface LevelUpModalProps {
  levelUp: LevelUpResult;
  onDismiss: () => void;
}

export function LevelUpModal({ levelUp, onDismiss }: LevelUpModalProps): JSX.Element {
  const { animations, prefersReducedMotion } = useMotion();

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  // Dismiss on click or key press
  const handleDismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDismiss]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={handleDismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby="level-up-title"
    >
      {/* Celebration container */}
      <div
        className={`relative flex flex-col items-center gap-6 p-8 ${animations.bounceIn}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow effect behind level number */}
        <div
          className={`absolute inset-0 rounded-full bg-gold/20 blur-3xl ${
            prefersReducedMotion ? '' : 'animate-pulse-glow'
          }`}
          aria-hidden="true"
        />

        {/* Decorative stars */}
        <div className="absolute -top-8 -left-8" aria-hidden="true">
          <StarIcon className="text-gold" size={32} />
        </div>
        <div className="absolute -top-4 -right-12" aria-hidden="true">
          <StarIcon className="text-gold" size={24} />
        </div>
        <div className="absolute -bottom-6 -left-10" aria-hidden="true">
          <StarIcon className="text-gold" size={20} />
        </div>
        <div className="absolute -bottom-4 -right-6" aria-hidden="true">
          <StarIcon className="text-gold" size={28} />
        </div>

        {/* Level Up text */}
        <div className={`flex items-center gap-2 ${animations.slideDown}`}>
          <ZapIcon className="text-gold" size={28} />
          <h2
            id="level-up-title"
            className="text-2xl font-bold text-gold uppercase tracking-wider"
          >
            Level Up!
          </h2>
          <ZapIcon className="text-gold" size={28} />
        </div>

        {/* Level number */}
        <div className="relative">
          <div
            className={`text-8xl font-bold text-white font-mono-display ${
              prefersReducedMotion ? '' : 'animate-bounce-in'
            }`}
            style={{ animationDelay: '0.2s' }}
          >
            {levelUp.newLevel}
          </div>
        </div>

        {/* Previous level indicator */}
        <p className={`text-lg text-white/80 ${animations.fadeIn}`} style={{ animationDelay: '0.4s' }}>
          From Level {levelUp.previousLevel}
        </p>

        {/* Tap to continue */}
        <p
          className={`text-sm text-white/60 ${animations.fadeIn}`}
          style={{ animationDelay: '0.6s' }}
        >
          Tap anywhere to continue
        </p>
      </div>
    </div>
  );
}
