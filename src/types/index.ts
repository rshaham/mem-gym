// ============ USER & PROGRESS ============

export interface UserProfile {
  id: string;
  createdAt: number;
  settings: UserSettings;
}

export interface UserSettings {
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  hapticFeedback: boolean;
  theme: 'light' | 'dark' | 'system';
  ttsVoice: string | null;
  ttsRate: number; // 0.5 - 2.0
}

export interface GameProgress {
  totalXP: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string | null; // ISO date string YYYY-MM-DD
  achievements: string[]; // achievement IDs
  moduleStats: ModuleStats;
}

export interface ModuleStats {
  detailHunter: DetailHunterStats;
  echoChamber: EchoChamberStats;
  reverseRecall: ReverseRecallStats;
  dualNBack: DualNBackStats;
}

// ============ DETAIL HUNTER ============

export interface DetailHunterStats {
  totalSessions: number;
  totalRecalls: number;
  successfulRecalls: number;
  averageAccuracy: number;
  bestAccuracy: number;
}

export interface DetailHunterSession {
  id: string;
  imageUrl: string;
  imageDescription: string;
  userDetails: string[];
  createdAt: number;
  recallScheduledAt: number;
  recallCompletedAt: number | null;
  recalledDetails: string[] | null;
  score: number | null;
  status: 'pending' | 'ready' | 'completed' | 'expired';
}

// ============ ECHO CHAMBER ============

export interface EchoChamberStats {
  totalSessions: number;
  averageAccuracy: number;
  bestAccuracy: number;
  wordsRecalled: number;
  currentDifficulty: EchoDifficulty;
}

export type EchoDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface EchoChamberRound {
  id: string;
  sentence: string;
  wordCount: number;
  difficulty: EchoDifficulty;
  silenceDuration: number;
  userResponse: string;
  accuracy: number;
  timestamp: number;
}

export interface EchoChamberSession {
  id: string;
  rounds: EchoChamberRound[];
  totalScore: number;
  averageAccuracy: number;
  startedAt: number;
  completedAt: number;
}

// ============ REVERSE RECALL ============

export interface ReverseRecallStats {
  totalSessions: number;
  totalEventsLogged: number;
  longestChain: number;
  averageChainLength: number;
  calendarData: Record<string, number>;
}

export interface ReverseRecallSession {
  id: string;
  date: string;
  events: ReverseRecallEvent[];
  chainLevel: number;
  score: number;
  completedAt: number;
}

export interface ReverseRecallEvent {
  id: string;
  description: string;
  sensoryDetails?: {
    sight?: string;
    sound?: string;
    smell?: string;
    touch?: string;
    taste?: string;
  };
  timestamp: number;
  orderIndex: number;
}

// ============ DUAL N-BACK ============

export interface DualNBackStats {
  totalSessions: number;
  totalTrials: number;
  highestN: number;
  averageAccuracy: number;
  positionAccuracy: number;
  audioAccuracy: number;
  currentN: number;
}

export interface DualNBackSession {
  id: string;
  nLevel: number;
  trials: DualNBackTrial[];
  positionHits: number;
  positionMisses: number;
  positionFalseAlarms: number;
  audioHits: number;
  audioMisses: number;
  audioFalseAlarms: number;
  overallAccuracy: number;
  startedAt: number;
  completedAt: number;
}

export interface DualNBackTrial {
  position: number; // 0-8 for 3x3 grid
  letter: string;
  positionMatch: boolean;
  audioMatch: boolean;
  userPositionResponse: boolean;
  userAudioResponse: boolean;
  responseTime: number | null;
}

// ============ GAMIFICATION ============

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'accuracy' | 'volume' | 'milestone' | 'special';
  xpReward: number;
  unlockedAt?: number;
}

export interface DailyChallenge {
  id: string;
  date: string;
  description: string;
  module: string;
  requirement: {
    type: 'sessions' | 'accuracy' | 'streak';
    target: number;
  };
  xpReward: number;
  completed: boolean;
}

// ============ NOTIFICATIONS ============

export interface PendingNotification {
  id: string;
  type: 'detail_recall' | 'daily_reminder' | 'streak_warning';
  scheduledFor: number;
  data: Record<string, unknown>;
  sent: boolean;
}

// ============ GAME STATE ============

export type GamePhase = 'ready' | 'active' | 'review' | 'complete';

export type ModuleType = 'dual-n-back' | 'echo-chamber' | 'detail-hunter' | 'reverse-recall';

// ============ STORAGE ============

export interface StoredData<T> {
  version: number;
  data: T;
  lastModified: number;
}

// ============ XP & SCORING ============

export interface LevelUpResult {
  previousLevel: number;
  newLevel: number;
  xpForNextLevel: number;
}

export interface SessionResult {
  moduleType: ModuleType;
  accuracy: number;
  xpEarned: number;
  timestamp: number;
}
