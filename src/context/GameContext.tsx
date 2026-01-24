import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type {
  GameProgress,
  UserSettings,
  ModuleType,
  LevelUpResult,
  Achievement,
} from '../types';
import { loadFromStorage, saveToStorage } from '../hooks/useLocalStorage';
import {
  getLevelFromXP,
  calculateXP,
  checkLevelUp,
  updateStreak,
} from '../utils/scoring';
import { checkAchievements } from '../utils/achievementChecker';
import { getAchievementById } from '../data/achievements';

// Storage keys
const STORAGE_KEYS = {
  PROGRESS: 'memory_gym_progress',
  SETTINGS: 'memory_gym_settings',
};

// Default values
const defaultSettings: UserSettings = {
  notificationsEnabled: false,
  soundEnabled: true,
  hapticFeedback: true,
  theme: 'system',
  ttsVoice: null,
  ttsRate: 1,
};

const defaultProgress: GameProgress = {
  totalXP: 0,
  level: 1,
  currentStreak: 0,
  longestStreak: 0,
  lastPlayedDate: null,
  achievements: [],
  moduleStats: {
    detailHunter: {
      totalSessions: 0,
      totalRecalls: 0,
      successfulRecalls: 0,
      averageAccuracy: 0,
      bestAccuracy: 0,
    },
    echoChamber: {
      totalSessions: 0,
      averageAccuracy: 0,
      bestAccuracy: 0,
      wordsRecalled: 0,
      currentDifficulty: 'easy',
    },
    reverseRecall: {
      totalSessions: 0,
      totalEventsLogged: 0,
      longestChain: 0,
      averageChainLength: 0,
      calendarData: {},
    },
    dualNBack: {
      totalSessions: 0,
      totalTrials: 0,
      highestN: 1,
      averageAccuracy: 0,
      positionAccuracy: 0,
      audioAccuracy: 0,
      currentN: 1,
    },
  },
};

// State type
interface GameState {
  progress: GameProgress;
  settings: UserSettings;
  pendingLevelUp: LevelUpResult | null;
  pendingAchievements: Achievement[];
}

// Action types
type GameAction =
  | { type: 'LOAD_STATE'; progress: GameProgress; settings: UserSettings }
  | { type: 'ADD_XP'; amount: number }
  | { type: 'COMPLETE_SESSION'; moduleType: ModuleType; accuracy: number }
  | { type: 'UPDATE_DUAL_NBACK_STATS'; stats: Partial<GameProgress['moduleStats']['dualNBack']> }
  | { type: 'UPDATE_DETAIL_HUNTER_STATS'; stats: Partial<GameProgress['moduleStats']['detailHunter']> }
  | { type: 'UPDATE_REVERSE_RECALL_STATS'; stats: Partial<GameProgress['moduleStats']['reverseRecall']> }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<UserSettings> }
  | { type: 'CLEAR_LEVEL_UP' }
  | { type: 'UNLOCK_ACHIEVEMENT'; achievementId: string }
  | { type: 'QUEUE_ACHIEVEMENT'; achievement: Achievement }
  | { type: 'DISMISS_ACHIEVEMENT' };

// Reducer
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'LOAD_STATE':
      return {
        ...state,
        progress: action.progress,
        settings: action.settings,
      };

    case 'ADD_XP': {
      const newTotalXP = state.progress.totalXP + action.amount;
      const levelUp = checkLevelUp(state.progress.totalXP, newTotalXP);
      const newLevel = getLevelFromXP(newTotalXP);

      return {
        ...state,
        progress: {
          ...state.progress,
          totalXP: newTotalXP,
          level: newLevel,
        },
        pendingLevelUp: levelUp,
      };
    }

    case 'COMPLETE_SESSION': {
      const xpEarned = calculateXP(action.moduleType, action.accuracy);
      const newTotalXP = state.progress.totalXP + xpEarned;
      const levelUp = checkLevelUp(state.progress.totalXP, newTotalXP);
      const newLevel = getLevelFromXP(newTotalXP);
      const updatedProgress = updateStreak({
        ...state.progress,
        totalXP: newTotalXP,
        level: newLevel,
      });

      return {
        ...state,
        progress: updatedProgress,
        pendingLevelUp: levelUp,
      };
    }

    case 'UPDATE_DUAL_NBACK_STATS':
      return {
        ...state,
        progress: {
          ...state.progress,
          moduleStats: {
            ...state.progress.moduleStats,
            dualNBack: {
              ...state.progress.moduleStats.dualNBack,
              ...action.stats,
            },
          },
        },
      };

    case 'UPDATE_DETAIL_HUNTER_STATS':
      return {
        ...state,
        progress: {
          ...state.progress,
          moduleStats: {
            ...state.progress.moduleStats,
            detailHunter: {
              ...state.progress.moduleStats.detailHunter,
              ...action.stats,
            },
          },
        },
      };

    case 'UPDATE_REVERSE_RECALL_STATS': {
      const currentStats = state.progress.moduleStats.reverseRecall;
      const newTotalSessions = currentStats.totalSessions + (action.stats.totalSessions || 0);
      const newTotalEvents = currentStats.totalEventsLogged + (action.stats.totalEventsLogged || 0);
      const newLongestChain = Math.max(currentStats.longestChain, action.stats.longestChain || 0);
      const newAvgChain = newTotalSessions > 0
        ? (currentStats.averageChainLength * currentStats.totalSessions + (action.stats.averageChainLength || 0)) / newTotalSessions
        : 0;

      // Merge calendar data - increment counts for each date
      const newCalendarData = { ...currentStats.calendarData };
      if (action.stats.calendarData) {
        for (const [date, count] of Object.entries(action.stats.calendarData)) {
          newCalendarData[date] = (newCalendarData[date] || 0) + count;
        }
      }

      return {
        ...state,
        progress: {
          ...state.progress,
          moduleStats: {
            ...state.progress.moduleStats,
            reverseRecall: {
              ...currentStats,
              totalSessions: newTotalSessions,
              totalEventsLogged: newTotalEvents,
              longestChain: newLongestChain,
              averageChainLength: Math.round(newAvgChain * 10) / 10,
              calendarData: newCalendarData,
            },
          },
        },
      };
    }

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.settings,
        },
      };

    case 'CLEAR_LEVEL_UP':
      return {
        ...state,
        pendingLevelUp: null,
      };

    case 'UNLOCK_ACHIEVEMENT':
      if (state.progress.achievements.includes(action.achievementId)) {
        return state;
      }
      return {
        ...state,
        progress: {
          ...state.progress,
          achievements: [...state.progress.achievements, action.achievementId],
        },
      };

    case 'QUEUE_ACHIEVEMENT':
      return {
        ...state,
        pendingAchievements: [...state.pendingAchievements, action.achievement],
      };

    case 'DISMISS_ACHIEVEMENT':
      return {
        ...state,
        pendingAchievements: state.pendingAchievements.slice(1),
      };

    default:
      return state;
  }
}

// Context
interface GameContextValue {
  progress: GameProgress;
  settings: UserSettings;
  pendingLevelUp: LevelUpResult | null;
  pendingAchievements: Achievement[];
  addXP: (amount: number) => void;
  completeSession: (moduleType: ModuleType, accuracy: number) => void;
  updateDualNBackStats: (stats: Partial<GameProgress['moduleStats']['dualNBack']>) => void;
  updateDetailHunterStats: (stats: Partial<GameProgress['moduleStats']['detailHunter']>) => void;
  updateReverseRecallStats: (stats: Partial<GameProgress['moduleStats']['reverseRecall']>) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  clearLevelUp: () => void;
  unlockAchievement: (achievementId: string) => void;
  queueAchievement: (achievement: Achievement) => void;
  dismissAchievement: () => void;
  checkAndQueueAchievements: (sessionAccuracy?: number) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

// Provider
interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps): JSX.Element {
  const [state, dispatch] = useReducer(gameReducer, {
    progress: defaultProgress,
    settings: defaultSettings,
    pendingLevelUp: null,
    pendingAchievements: [],
  });

  // Load state from localStorage on mount
  useEffect(() => {
    const savedProgress = loadFromStorage(STORAGE_KEYS.PROGRESS, defaultProgress);
    const savedSettings = loadFromStorage(STORAGE_KEYS.SETTINGS, defaultSettings);
    dispatch({
      type: 'LOAD_STATE',
      progress: savedProgress,
      settings: savedSettings,
    });
  }, []);

  // Save progress to localStorage when it changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PROGRESS, state.progress);
  }, [state.progress]);

  // Save settings to localStorage when they change
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SETTINGS, state.settings);
  }, [state.settings]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    const theme = state.settings.theme;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    // Listen for system preference changes when theme is 'system'
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        if (e.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [state.settings.theme]);

  // Check and queue achievements after session completion
  const checkAndQueueAchievements = useCallback((sessionAccuracy?: number) => {
    const newlyUnlocked = checkAchievements(state.progress, sessionAccuracy);

    for (const achievementId of newlyUnlocked) {
      // Mark as unlocked in progress
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', achievementId });

      // Queue for display
      const achievement = getAchievementById(achievementId);
      if (achievement) {
        dispatch({ type: 'QUEUE_ACHIEVEMENT', achievement });
      }
    }
  }, [state.progress]);

  const value: GameContextValue = {
    progress: state.progress,
    settings: state.settings,
    pendingLevelUp: state.pendingLevelUp,
    pendingAchievements: state.pendingAchievements,
    addXP: (amount) => dispatch({ type: 'ADD_XP', amount }),
    completeSession: (moduleType, accuracy) =>
      dispatch({ type: 'COMPLETE_SESSION', moduleType, accuracy }),
    updateDualNBackStats: (stats) =>
      dispatch({ type: 'UPDATE_DUAL_NBACK_STATS', stats }),
    updateDetailHunterStats: (stats) =>
      dispatch({ type: 'UPDATE_DETAIL_HUNTER_STATS', stats }),
    updateReverseRecallStats: (stats) =>
      dispatch({ type: 'UPDATE_REVERSE_RECALL_STATS', stats }),
    updateSettings: (settings) =>
      dispatch({ type: 'UPDATE_SETTINGS', settings }),
    clearLevelUp: () => dispatch({ type: 'CLEAR_LEVEL_UP' }),
    unlockAchievement: (achievementId) =>
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', achievementId }),
    queueAchievement: (achievement) =>
      dispatch({ type: 'QUEUE_ACHIEVEMENT', achievement }),
    dismissAchievement: () => dispatch({ type: 'DISMISS_ACHIEVEMENT' }),
    checkAndQueueAchievements,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// Hook
export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
