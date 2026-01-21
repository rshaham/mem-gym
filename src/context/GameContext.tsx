import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from 'react';
import type {
  GameProgress,
  UserSettings,
  ModuleType,
  LevelUpResult,
} from '../types';
import { loadFromStorage, saveToStorage } from '../hooks/useLocalStorage';
import {
  getLevelFromXP,
  calculateXP,
  checkLevelUp,
  updateStreak,
} from '../utils/scoring';

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
}

// Action types
type GameAction =
  | { type: 'LOAD_STATE'; progress: GameProgress; settings: UserSettings }
  | { type: 'ADD_XP'; amount: number }
  | { type: 'COMPLETE_SESSION'; moduleType: ModuleType; accuracy: number }
  | { type: 'UPDATE_DUAL_NBACK_STATS'; stats: Partial<GameProgress['moduleStats']['dualNBack']> }
  | { type: 'UPDATE_DETAIL_HUNTER_STATS'; stats: Partial<GameProgress['moduleStats']['detailHunter']> }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<UserSettings> }
  | { type: 'CLEAR_LEVEL_UP' }
  | { type: 'UNLOCK_ACHIEVEMENT'; achievementId: string };

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

    default:
      return state;
  }
}

// Context
interface GameContextValue {
  progress: GameProgress;
  settings: UserSettings;
  pendingLevelUp: LevelUpResult | null;
  addXP: (amount: number) => void;
  completeSession: (moduleType: ModuleType, accuracy: number) => void;
  updateDualNBackStats: (stats: Partial<GameProgress['moduleStats']['dualNBack']>) => void;
  updateDetailHunterStats: (stats: Partial<GameProgress['moduleStats']['detailHunter']>) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  clearLevelUp: () => void;
  unlockAchievement: (achievementId: string) => void;
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

  const value: GameContextValue = {
    progress: state.progress,
    settings: state.settings,
    pendingLevelUp: state.pendingLevelUp,
    addXP: (amount) => dispatch({ type: 'ADD_XP', amount }),
    completeSession: (moduleType, accuracy) =>
      dispatch({ type: 'COMPLETE_SESSION', moduleType, accuracy }),
    updateDualNBackStats: (stats) =>
      dispatch({ type: 'UPDATE_DUAL_NBACK_STATS', stats }),
    updateDetailHunterStats: (stats) =>
      dispatch({ type: 'UPDATE_DETAIL_HUNTER_STATS', stats }),
    updateSettings: (settings) =>
      dispatch({ type: 'UPDATE_SETTINGS', settings }),
    clearLevelUp: () => dispatch({ type: 'CLEAR_LEVEL_UP' }),
    unlockAchievement: (achievementId) =>
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', achievementId }),
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
