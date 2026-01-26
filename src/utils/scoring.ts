import type { GameProgress, LevelUpResult, ModuleType } from '../types';

// XP required to reach each level
const XP_TABLE: Record<number, number> = {
  1: 0,
  2: 100,
  3: 250,
  4: 500,
  5: 850,
  6: 1300,
  7: 1900,
  8: 2650,
  9: 3550,
  10: 4600,
  11: 5800,
  12: 7150,
  13: 8650,
  14: 10300,
  15: 12100,
};

const MAX_LEVEL = 15;

export function getLevelFromXP(totalXP: number): number {
  let level = 1;
  for (let i = MAX_LEVEL; i >= 1; i--) {
    if (totalXP >= XP_TABLE[i]) {
      level = i;
      break;
    }
  }
  return level;
}

export function getXPForLevel(level: number): number {
  return XP_TABLE[level] ?? XP_TABLE[MAX_LEVEL];
}

export function getXPForNextLevel(currentLevel: number): number {
  const nextLevel = Math.min(currentLevel + 1, MAX_LEVEL);
  return XP_TABLE[nextLevel] ?? XP_TABLE[MAX_LEVEL];
}

export function checkLevelUp(currentXP: number, newXP: number): LevelUpResult | null {
  const previousLevel = getLevelFromXP(currentXP);
  const newLevel = getLevelFromXP(newXP);

  if (newLevel > previousLevel) {
    return {
      previousLevel,
      newLevel,
      xpForNextLevel: getXPForNextLevel(newLevel),
    };
  }

  return null;
}

interface XPRewards {
  sessionComplete: number;
  perfectSession: number;
  accuracyBonus: (accuracy: number) => number;
  difficultyMultiplier?: Record<string, number>;
}

const MODULE_XP_REWARDS: Record<ModuleType, XPRewards> = {
  'dual-n-back': {
    sessionComplete: 30,
    perfectSession: 100,
    accuracyBonus: (accuracy: number) => Math.floor(accuracy / 5),
  },
  'echo-chamber': {
    sessionComplete: 25,
    perfectSession: 75,
    accuracyBonus: (accuracy: number) => Math.floor(accuracy / 10),
    difficultyMultiplier: { easy: 1, medium: 1.5, hard: 2, expert: 3 },
  },
  'detail-hunter': {
    sessionComplete: 20,
    perfectSession: 50,
    accuracyBonus: (accuracy: number) => Math.floor(accuracy / 10),
  },
  'reverse-recall': {
    sessionComplete: 15,
    perfectSession: 40,
    accuracyBonus: (accuracy: number) => Math.floor(accuracy / 10),
  },
  'sudoku': {
    sessionComplete: 40,
    perfectSession: 0, // Sudoku doesn't have "perfect" - puzzle is complete or not
    accuracyBonus: () => 0, // XP calculated in hook based on difficulty/time
    difficultyMultiplier: { easy: 1, medium: 1.5, hard: 2.5 },
  },
  'semantic-chain': {
    sessionComplete: 20,
    perfectSession: 50, // Bonus for 15+ word chain
    accuracyBonus: (chainLength: number) => chainLength * 3, // 3 XP per word in chain
    difficultyMultiplier: { easy: 1, medium: 1.5, hard: 2 },
  },
};

export function calculateXP(
  moduleType: ModuleType,
  accuracy: number,
  difficulty?: string
): number {
  const rewards = MODULE_XP_REWARDS[moduleType];
  let xp = rewards.sessionComplete;

  // Accuracy bonus
  xp += rewards.accuracyBonus(accuracy);

  // Perfect session bonus
  if (accuracy >= 100) {
    xp += rewards.perfectSession;
  }

  // Difficulty multiplier (for echo-chamber)
  if (difficulty && rewards.difficultyMultiplier) {
    const multiplier = rewards.difficultyMultiplier[difficulty] ?? 1;
    xp = Math.floor(xp * multiplier);
  }

  return xp;
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function isYesterday(dateString: string, today: string): boolean {
  const date = new Date(dateString);
  const todayDate = new Date(today);
  const yesterday = new Date(todayDate);
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0];
}

export function isSameDay(dateString1: string, dateString2: string): boolean {
  return dateString1 === dateString2;
}

export function updateStreak(progress: GameProgress): GameProgress {
  const today = getTodayDateString();
  const { lastPlayedDate, currentStreak, longestStreak } = progress;

  if (!lastPlayedDate) {
    // First time playing
    return {
      ...progress,
      currentStreak: 1,
      longestStreak: Math.max(1, longestStreak),
      lastPlayedDate: today,
    };
  }

  if (isSameDay(lastPlayedDate, today)) {
    // Already played today, no change
    return progress;
  }

  if (isYesterday(lastPlayedDate, today)) {
    // Played yesterday, increment streak
    const newStreak = currentStreak + 1;
    return {
      ...progress,
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, longestStreak),
      lastPlayedDate: today,
    };
  }

  // Streak broken, reset to 1
  return {
    ...progress,
    currentStreak: 1,
    lastPlayedDate: today,
  };
}
