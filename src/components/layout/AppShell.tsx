import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { LevelUpModal } from '../gamification/LevelUpModal';
import { AchievementToast } from '../gamification/AchievementToast';
import { useGame } from '../../context/GameContext';

// Routes where bottom nav should be hidden (during active game sessions)
const HIDE_NAV_PATTERNS = [
  /^\/train\/[\w-]+$/,
];

export function AppShell(): JSX.Element {
  const location = useLocation();
  const { pendingLevelUp, clearLevelUp, pendingAchievements, dismissAchievement } = useGame();

  // Check if we should hide the navigation
  const hideNav = HIDE_NAV_PATTERNS.some((pattern) => pattern.test(location.pathname));

  // Get page title based on route
  const getTitle = (): string => {
    if (location.pathname === '/') return 'Memory Gym';
    if (location.pathname === '/stats') return 'Statistics';
    if (location.pathname === '/settings') return 'Settings';
    if (location.pathname.startsWith('/train/')) {
      const module = location.pathname.split('/')[2];
      const titles: Record<string, string> = {
        'dual-n-back': 'Dual N-Back',
        'echo-chamber': 'Echo Chamber',
        'detail-hunter': 'Detail Hunter',
        'reverse-recall': 'Reverse Recall',
        'mental-math-sprint': 'Mental Math Sprint',
      };
      return titles[module] ?? 'Training';
    }
    return 'Memory Gym';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-secondary)]">
      <Header title={getTitle()} showStats={!hideNav} />

      <main className={`flex-1 min-h-0 ${hideNav ? '' : 'pb-20'}`}>
        <Outlet />
      </main>

      {!hideNav && <BottomNav />}

      {/* Level Up Celebration Modal */}
      {pendingLevelUp && (
        <LevelUpModal levelUp={pendingLevelUp} onDismiss={clearLevelUp} />
      )}

      {/* Achievement Toast - show only when no level up modal */}
      {!pendingLevelUp && pendingAchievements.length > 0 && (
        <AchievementToast
          achievement={pendingAchievements[0]}
          onDismiss={dismissAchievement}
        />
      )}
    </div>
  );
}
