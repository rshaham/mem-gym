import { useEffect, useState } from 'react';

/**
 * Hook that provides motion-aware animation utilities.
 * Respects the user's prefers-reduced-motion setting.
 */
export function useMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  /**
   * Returns the animation class if motion is allowed, empty string otherwise.
   */
  function animate(animationClass: string): string {
    return prefersReducedMotion ? '' : animationClass;
  }

  /**
   * Returns animation styles only if motion is allowed.
   */
  function animateStyle(styles: React.CSSProperties): React.CSSProperties {
    return prefersReducedMotion ? {} : styles;
  }

  /**
   * Common animation classes
   */
  const animations = {
    fadeIn: animate('animate-fade-in'),
    slideUp: animate('animate-slide-up'),
    slideDown: animate('animate-slide-down'),
    scaleIn: animate('animate-scale-in'),
    bounceIn: animate('animate-bounce-in'),
    pulseGlow: animate('animate-pulse-glow'),
    shimmer: animate('animate-shimmer'),
    flashSuccess: animate('animate-flash-success'),
    flashError: animate('animate-flash-error'),
    countUp: animate('animate-count-up'),
    confetti: animate('animate-confetti'),
  };

  return {
    prefersReducedMotion,
    animate,
    animateStyle,
    animations,
  };
}
