import type { GameProgress } from '../types';
import { ALL_ACHIEVEMENTS } from '../data/achievements';

/**
 * Checks which achievements should be unlocked based on current progress.
 * Returns array of achievement IDs that are newly unlocked.
 */
export function checkAchievements(
  progress: GameProgress,
  sessionAccuracy?: number
): string[] {
  const newlyUnlocked: string[] = [];
  const alreadyUnlocked = new Set(progress.achievements);

  // Get total sessions across all modules
  const totalSessions =
    progress.moduleStats.dualNBack.totalSessions +
    progress.moduleStats.echoChamber.totalSessions +
    progress.moduleStats.detailHunter.totalSessions +
    progress.moduleStats.reverseRecall.totalSessions +
    progress.moduleStats.sudoku.totalSessions;

  for (const achievement of ALL_ACHIEVEMENTS) {
    // Skip already unlocked
    if (alreadyUnlocked.has(achievement.id)) continue;

    const shouldUnlock = checkSingleAchievement(
      achievement.id,
      progress,
      totalSessions,
      sessionAccuracy
    );

    if (shouldUnlock) {
      newlyUnlocked.push(achievement.id);
    }
  }

  return newlyUnlocked;
}

function checkSingleAchievement(
  achievementId: string,
  progress: GameProgress,
  totalSessions: number,
  sessionAccuracy?: number
): boolean {
  switch (achievementId) {
    // Streak achievements
    case 'streak-7':
      return progress.longestStreak >= 7;
    case 'streak-14':
      return progress.longestStreak >= 14;
    case 'streak-30':
      return progress.longestStreak >= 30;
    case 'streak-60':
      return progress.longestStreak >= 60;
    case 'streak-100':
      return progress.longestStreak >= 100;

    // Volume achievements
    case 'sessions-10':
      return totalSessions >= 10;
    case 'sessions-50':
      return totalSessions >= 50;
    case 'sessions-100':
      return totalSessions >= 100;
    case 'sessions-500':
      return totalSessions >= 500;

    // Accuracy achievements
    case 'first-90':
      return sessionAccuracy !== undefined && sessionAccuracy >= 90;
    case 'first-perfect':
      return sessionAccuracy !== undefined && sessionAccuracy >= 100;
    case 'average-80': {
      const stats = progress.moduleStats;
      // Only modules with accuracy tracking (Reverse Recall doesn't have averageAccuracy)
      const averages = [
        stats.dualNBack.averageAccuracy,
        stats.echoChamber.averageAccuracy,
        stats.detailHunter.averageAccuracy,
      ];
      // Only count modules with sessions
      const activeAverages = averages.filter((a) => a > 0);
      if (activeAverages.length === 0) return false;
      const overallAverage =
        activeAverages.reduce((sum, a) => sum + a, 0) / activeAverages.length;
      return overallAverage >= 80;
    }

    // Milestone achievements
    case 'first-session':
      return totalSessions >= 1;
    case 'level-5':
      return progress.level >= 5;
    case 'level-10':
      return progress.level >= 10;
    case 'level-15':
      return progress.level >= 15;
    case 'level-20':
      return progress.level >= 20;

    // Special achievements
    case 'dnb-n3':
      return progress.moduleStats.dualNBack.highestN >= 3;
    case 'dnb-n5':
      return progress.moduleStats.dualNBack.highestN >= 5;
    case 'dnb-n7':
      return progress.moduleStats.dualNBack.highestN >= 7;
    case 'all-modules':
      return (
        progress.moduleStats.dualNBack.totalSessions >= 1 &&
        progress.moduleStats.echoChamber.totalSessions >= 1 &&
        progress.moduleStats.detailHunter.totalSessions >= 1 &&
        progress.moduleStats.reverseRecall.totalSessions >= 1 &&
        progress.moduleStats.sudoku.totalSessions >= 1
      );
    case 'detail-master':
      return progress.moduleStats.detailHunter.bestAccuracy >= 95;

    // Sudoku achievements
    case 'sudoku-first':
      return progress.moduleStats.sudoku.totalPuzzlesSolved >= 1;
    case 'sudoku-hard':
      // Check if they've ever solved a hard puzzle
      return progress.moduleStats.sudoku.bestTimeHard !== null;
    case 'sudoku-speed': {
      // Check if any best time is under 5 minutes (300 seconds)
      const { bestTimeEasy, bestTimeMedium, bestTimeHard } = progress.moduleStats.sudoku;
      return (
        (bestTimeEasy !== null && bestTimeEasy < 300) ||
        (bestTimeMedium !== null && bestTimeMedium < 300) ||
        (bestTimeHard !== null && bestTimeHard < 300)
      );
    }

    default:
      return false;
  }
}
