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
    sudoku: {
      totalSessions: 0,
      totalPuzzlesSolved: 0,
      averageTime: 0,
      bestTimeEasy: null,
      bestTimeMedium: null,
      bestTimeHard: null,
      currentDifficulty: 'easy',
    },
    semanticChain: {
      totalSessions: 0,
      totalWordsChained: 0,
      longestChain: 0,
      averageChainLength: 0,
      currentDifficulty: 'easy',
      favoriteCategory: null,
    },
    mentalMathSprint: {
      totalSessions: 0,
      totalProblems: 0,
      averageAccuracy: 0,
      bestAccuracy: 0,
      averageTimePerProblem: 0,
      bestStreak: 0,
      currentDifficulty: 'easy',
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
  | { type: 'UPDATE_SUDOKU_STATS'; stats: Partial<GameProgress['moduleStats']['sudoku']> }
  | { type: 'UPDATE_SEMANTIC_CHAIN_STATS'; stats: Partial<GameProgress['moduleStats']['semanticChain']> }
  | { type: 'UPDATE_MENTAL_MATH_SPRINT_STATS'; stats: Partial<GameProgress['moduleStats']['mentalMathSprint']> }
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

    case 'UPDATE_SUDOKU_STATS': {
      const currentStats = state.progress.moduleStats.sudoku;
      const newTotalSessions = currentStats.totalSessions + (action.stats.totalSessions || 0);
      const newTotalPuzzlesSolved = currentStats.totalPuzzlesSolved + (action.stats.totalPuzzlesSolved || 0);

      // Handle best times - only update if new time is better (or first completion)
      let newBestTimeEasy = currentStats.bestTimeEasy;
      if (action.stats.bestTimeEasy !== undefined && action.stats.bestTimeEasy !== null) {
        if (currentStats.bestTimeEasy === null || action.stats.bestTimeEasy < currentStats.bestTimeEasy) {
          newBestTimeEasy = action.stats.bestTimeEasy;
        }
      }

      let newBestTimeMedium = currentStats.bestTimeMedium;
      if (action.stats.bestTimeMedium !== undefined && action.stats.bestTimeMedium !== null) {
        if (currentStats.bestTimeMedium === null || action.stats.bestTimeMedium < currentStats.bestTimeMedium) {
          newBestTimeMedium = action.stats.bestTimeMedium;
        }
      }

      let newBestTimeHard = currentStats.bestTimeHard;
      if (action.stats.bestTimeHard !== undefined && action.stats.bestTimeHard !== null) {
        if (currentStats.bestTimeHard === null || action.stats.bestTimeHard < currentStats.bestTimeHard) {
          newBestTimeHard = action.stats.bestTimeHard;
        }
      }

      return {
        ...state,
        progress: {
          ...state.progress,
          moduleStats: {
            ...state.progress.moduleStats,
            sudoku: {
              ...currentStats,
              ...action.stats,
              totalSessions: newTotalSessions,
              totalPuzzlesSolved: newTotalPuzzlesSolved,
              bestTimeEasy: newBestTimeEasy,
              bestTimeMedium: newBestTimeMedium,
              bestTimeHard: newBestTimeHard,
            },
          },
        },
      };
    }

    case 'UPDATE_SEMANTIC_CHAIN_STATS': {
      const currentStats = state.progress.moduleStats.semanticChain;
      const newTotalSessions = currentStats.totalSessions + (action.stats.totalSessions || 0);
      const newTotalWords = currentStats.totalWordsChained + (action.stats.totalWordsChained || 0);
      const newLongestChain = Math.max(currentStats.longestChain, action.stats.longestChain || 0);

      // Calculate running average chain length
      const sessionChainLength = action.stats.longestChain || action.stats.averageChainLength || 0;
      const newAvgChain = newTotalSessions > 0
        ? (currentStats.averageChainLength * currentStats.totalSessions + sessionChainLength) / newTotalSessions
        : 0;

      // Track favorite category (most played)
      // For simplicity, just update to the latest category if provided
      const newFavoriteCategory = action.stats.favoriteCategory !== undefined
        ? action.stats.favoriteCategory
        : currentStats.favoriteCategory;

      return {
        ...state,
        progress: {
          ...state.progress,
          moduleStats: {
            ...state.progress.moduleStats,
            semanticChain: {
              ...currentStats,
              ...action.stats,
              totalSessions: newTotalSessions,
              totalWordsChained: newTotalWords,
              longestChain: newLongestChain,
              averageChainLength: Math.round(newAvgChain * 10) / 10,
              favoriteCategory: newFavoriteCategory,
            },
          },
        },
      };
    }

    case 'UPDATE_MENTAL_MATH_SPRINT_STATS': {
      const currentStats = state.progress.moduleStats.mentalMathSprint;
      const newTotalSessions = currentStats.totalSessions + (action.stats.totalSessions || 0);
      const newTotalProblems = currentStats.totalProblems + (action.stats.totalProblems || 0);
      const newBestStreak = Math.max(currentStats.bestStreak, action.stats.bestStreak || 0);

      // Calculate running average accuracy
      const sessionAccuracy = action.stats.averageAccuracy || 0;
      const newAvgAccuracy = newTotalSessions > 0
        ? (currentStats.averageAccuracy * currentStats.totalSessions + sessionAccuracy) / newTotalSessions
        : 0;

      // Calculate running average time per problem
      const sessionAvgTime = action.stats.averageTimePerProblem || 0;
      const newAvgTime = newTotalSessions > 0
        ? (currentStats.averageTimePerProblem * currentStats.totalSessions + sessionAvgTime) / newTotalSessions
        : 0;

      // Track best accuracy
      const newBestAccuracy = Math.max(currentStats.bestAccuracy, action.stats.bestAccuracy || sessionAccuracy);

      return {
        ...state,
        progress: {
          ...state.progress,
          moduleStats: {
            ...state.progress.moduleStats,
            mentalMathSprint: {
              ...currentStats,
              ...action.stats,
              totalSessions: newTotalSessions,
              totalProblems: newTotalProblems,
              averageAccuracy: Math.round(newAvgAccuracy * 10) / 10,
              bestAccuracy: newBestAccuracy,
              averageTimePerProblem: Math.round(newAvgTime),
              bestStreak: newBestStreak,
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
  updateSudokuStats: (stats: Partial<GameProgress['moduleStats']['sudoku']>) => void;
  updateSemanticChainStats: (stats: Partial<GameProgress['moduleStats']['semanticChain']>) => void;
  updateMentalMathSprintStats: (stats: Partial<GameProgress['moduleStats']['mentalMathSprint']>) => void;
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
    updateSudokuStats: (stats) =>
      dispatch({ type: 'UPDATE_SUDOKU_STATS', stats }),
    updateSemanticChainStats: (stats) =>
      dispatch({ type: 'UPDATE_SEMANTIC_CHAIN_STATS', stats }),
    updateMentalMathSprintStats: (stats) =>
      dispatch({ type: 'UPDATE_MENTAL_MATH_SPRINT_STATS', stats }),
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
